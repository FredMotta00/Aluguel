import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth, db } from '@/integrations/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Company, WalletTransaction, TIER_CONFIG, CompanyTier } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export const useWallet = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch company by user_id
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;

      const q = query(
        collection(db, 'companies'),
        where('user_id', '==', user.uid),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const docData = querySnapshot.docs[0].data();
      return {
        id: querySnapshot.docs[0].id,
        ...docData
      } as Company;
    },
    enabled: !!user?.uid
  });

  // Fetch wallet transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const q = query(
        collection(db, 'wallet_transactions'),
        where('company_id', '==', company.id),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletTransaction[];
    },
    enabled: !!company?.id
  });

  // Create company for current user
  const createCompanyMutation = useMutation({
    mutationFn: async ({ nome, cnpj }: { nome: string; cnpj?: string }) => {
      if (!user?.uid || !user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const newCompany = {
        nome,
        email: user.email,
        cnpj: cnpj || null,
        user_id: user.uid,
        wallet_balance: 0,
        pending_balance: 0,
        loyalty_points: 0,
        tier: 'silver',
        total_locacoes_ano: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'companies'), newCompany);

      return {
        id: docRef.id,
        ...newCompany
      } as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: 'Empresa cadastrada!',
        description: 'Sua carteira EXS Wallet foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar empresa',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Add cashback (earn) - called when reservation is created
  const addCashbackMutation = useMutation({
    mutationFn: async ({
      reservaId,
      amount,
      description
    }: {
      reservaId: string;
      amount: number;
      description: string;
    }) => {
      if (!company) throw new Error('Empresa não encontrada');

      // Run as a transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        // Create pending transaction reference
        const txRef = doc(collection(db, 'wallet_transactions'));

        transaction.set(txRef, {
          company_id: company.id,
          user_id: company.user_id,
          reserva_id: reservaId,
          type: 'earn',
          status: 'pending',
          amount,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Update company pending balance reference
        const companyRef = doc(db, 'companies', company.id);
        const companyDoc = await transaction.get(companyRef);

        if (!companyDoc.exists()) {
          throw new Error("Company does not exist!");
        }

        const newPendingBalance = (companyDoc.data().pending_balance || 0) + amount;

        transaction.update(companyRef, {
          pending_balance: newPendingBalance,
          updated_at: new Date().toISOString()
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    }
  });

  // Release cashback (make available) - called when equipment is returned
  const releaseCashbackMutation = useMutation({
    mutationFn: async (reservaId: string) => {
      if (!company) throw new Error('Empresa não encontrada');

      await runTransaction(db, async (transaction) => {
        // Find pending transaction for this reservation
        const q = query(
          collection(db, 'wallet_transactions'),
          where('reserva_id', '==', reservaId),
          where('type', '==', 'earn'),
          where('status', '==', 'pending'),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const txDoc = snapshot.docs[0];
        const txData = txDoc.data();

        // Update transaction status
        transaction.update(txDoc.ref, {
          status: 'available',
          updated_at: new Date().toISOString()
        });

        // Update company balances
        const companyRef = doc(db, 'companies', company.id);
        const companyDoc = await transaction.get(companyRef);

        if (!companyDoc.exists()) {
          throw new Error("Company does not exist!");
        }

        const currentData = companyDoc.data();
        const newWalletBalance = (currentData.wallet_balance || 0) + txData.amount;
        // Ensure pending balance doesn't go below 0
        const newPendingBalance = Math.max(0, (currentData.pending_balance || 0) - txData.amount);

        transaction.update(companyRef, {
          wallet_balance: newWalletBalance,
          pending_balance: newPendingBalance,
          updated_at: new Date().toISOString()
        });

        return { id: txDoc.id, ...txData };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({
        title: 'Cashback liberado!',
        description: 'O cashback foi adicionado à sua carteira.',
      });
    }
  });

  // Use wallet balance (burn)
  const useBalanceMutation = useMutation({
    mutationFn: async ({
      reservaId,
      amount,
      description
    }: {
      reservaId: string;
      amount: number;
      description: string;
    }) => {
      if (!company || company.wallet_balance < amount) {
        throw new Error('Saldo insuficiente');
      }

      await runTransaction(db, async (transaction) => {
        // Create burn transaction
        const txRef = doc(collection(db, 'wallet_transactions'));

        transaction.set(txRef, {
          company_id: company.id,
          user_id: company.user_id,
          reserva_id: reservaId,
          type: 'burn',
          status: 'used',
          amount: -amount,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Update company balance
        const companyRef = doc(db, 'companies', company.id);
        const companyDoc = await transaction.get(companyRef);

        if (!companyDoc.exists()) {
          throw new Error("Company does not exist!");
        }

        const newBalance = companyDoc.data().wallet_balance - amount;

        transaction.update(companyRef, {
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    }
  });

  // Update company annual total
  const updateAnnualTotalMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!company) throw new Error('Empresa não encontrada');

      const companyRef = doc(db, 'companies', company.id);

      await runTransaction(db, async (transaction) => {
        const companyDoc = await transaction.get(companyRef);
        if (!companyDoc.exists()) throw new Error("Company not found");

        const currentData = companyDoc.data();
        const newTotal = (currentData.total_locacoes_ano || 0) + amount;
        const newPoints = (currentData.loyalty_points || 0) + Math.floor(amount / 10); // 1 point for every R$ 10 spent

        transaction.update(companyRef, {
          total_locacoes_ano: newTotal,
          loyalty_points: newPoints,
          updated_at: new Date().toISOString()
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    }
  });

  // Calculate cashback for a given amount based on tier
  const calculateCashback = (amount: number, tier?: CompanyTier): number => {
    const tierToUse = tier || company?.tier || 'silver';
    const percentage = TIER_CONFIG[tierToUse].cashbackPercentage;
    return Math.round(amount * percentage * 100) / 100;
  };

  return {
    user,
    company,
    transactions,
    isLoading: isLoadingAuth || isLoadingCompany || isLoadingTransactions,
    isAuthenticated: !!user,
    createCompany: createCompanyMutation.mutateAsync,
    addCashback: addCashbackMutation.mutateAsync,
    releaseCashback: releaseCashbackMutation.mutateAsync,
    useBalance: useBalanceMutation.mutateAsync,
    updateAnnualTotal: updateAnnualTotalMutation.mutateAsync,
    calculateCashback,
    isCreatingCompany: createCompanyMutation.isPending
  };
};
