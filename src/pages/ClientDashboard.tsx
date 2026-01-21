import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { RentalsList } from '@/components/dashboard/RentalsList';
import { OrdersList } from '@/components/dashboard/OrdersList';
import { Separator } from '@/components/ui/separator';
import { Loader2, GraduationCap, Briefcase, Settings2, Laptop, ArrowRight } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoSpcs from '@/assets/logo-spcs.png';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [loadingUser, setLoadingUser] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    // Wallet hook to fetch financial data
    const { company, transactions, isLoading: isLoadingWallet } = useWallet();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/auth');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoadingUser(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const dashboardData = useMemo(() => {
        const balance = company?.wallet_balance || 0;

        const loyaltyTier = company?.tier
            ? company.tier.charAt(0).toUpperCase() + company.tier.slice(1)
            : 'Silver'; // Default to Silver

        // 3. Savings: Sum of all 'earn' transactions (Cashback)
        const totalSavings = transactions
            ?.filter(t => t.type === 'earn')
            .reduce((acc, curr) => acc + curr.amount, 0) || 0;

        return { balance, loyaltyTier, totalSavings };
    }, [company, transactions]);

    if (loadingUser || isLoadingWallet) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Minha Conta</h1>
                    <p className="text-muted-foreground text-lg">
                        Bem-vindo de volta, <span className="font-bold text-primary">{userData?.fullName || 'Cliente'}</span>
                    </p>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 border-l-2 border-primary">
                    Acompanhe suas locações e conheça nossas soluções.
                </div>
            </div>

            {/* Overview Cards */}
            <OverviewCards
                balance={dashboardData.balance}
                loyaltyTier={dashboardData.loyaltyTier}
                totalSavings={dashboardData.totalSavings}
            />

            {/* 1. Ongoing Reservations - Main Focus */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-primary"></div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">Locações em Andamento</h2>
                </div>
                <RentalsList />
            </section>

            {/* 2. Instituto SPCS Banner */}
            <Card className="rounded-none border-none overflow-hidden bg-gradient-to-r from-slate-900 to-black relative group shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full -mr-20 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 relative z-10">
                        <div className="w-full md:w-1/3 flex justify-center bg-white/5 p-8 border border-white/10 backdrop-blur-sm">
                            <img src={logoSpcs} alt="Instituto SPCS" className="max-h-24 w-auto object-contain" />
                        </div>
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-black px-3 py-1 uppercase tracking-widest mb-2">
                                <GraduationCap className="h-3 w-3" />
                                Educação Técnica
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Cursos do Instituto SPCS</h3>
                            <p className="text-slate-400 text-lg max-w-xl">
                                Especialize sua equipe com os melhores treinamentos técnicos do mercado. Conheça nossa grade completa de cursos e certificações.
                            </p>
                            <Button className="rounded-none font-bold gap-2 px-8 h-12 text-black" size="lg">
                                Conhecer Cursos <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. EXS Services Grid - Other Revenue Streams */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-blue-600"></div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">Soluções e Serviços EXS</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Consulting */}
                    <Card className="rounded-none border-border/50 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm group cursor-pointer">
                        <CardContent className="p-8 space-y-5">
                            <div className="h-14 w-14 bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-colors">
                                <Briefcase className="h-7 w-7 text-primary group-hover:text-black" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold uppercase">Consultoria Personalizada</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Projetos customizados para otimizar sua operação e reduzir custos tecnológicos.
                                </p>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-primary font-bold group-hover:translate-x-1 transition-transform">
                                Solicitar Orçamento →
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card className="rounded-none border-border/50 hover:border-blue-500/50 transition-colors bg-card/50 backdrop-blur-sm group cursor-pointer">
                        <CardContent className="p-8 space-y-5">
                            <div className="h-14 w-14 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 transition-colors">
                                <Settings2 className="h-7 w-7 text-blue-500 group-hover:text-white" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold uppercase">Suporte Customizado</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Atendimento técnico exclusivo e manutenção preventiva para seu parque de equipamentos.
                                </p>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-blue-500 font-bold group-hover:translate-x-1 transition-transform">
                                Ver Planos de Suporte →
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Systems */}
                    <Card className="rounded-none border-border/50 bg-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-black bg-primary text-black px-2 py-0.5 uppercase tracking-tighter">Em Breve</span>
                        </div>
                        <CardContent className="p-8 space-y-5 opacity-60">
                            <div className="h-14 w-14 bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                                <Laptop className="h-7 w-7 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold uppercase text-slate-300">Sistemas EXS</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Plataforma de gestão integrada para locação de ativos e monitoramento de frota.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 italic">Lançamento previsto para 2026</span>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="opacity-10" />

            {/* 4. Orders History - Secondary */}
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-slate-500"></div>
                        <h2 className="text-lg font-bold uppercase tracking-tight opacity-70">Histórico de Pedidos</h2>
                    </div>
                    <OrdersList />
                </div>

                <div className="bg-muted/30 p-8 flex flex-col justify-center items-center text-center border border-dashed border-border rounded-none">
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Precisa de um fechamento financeiro ou nota fiscal? Entre em contato com nosso faturamento.
                    </p>
                    <Button variant="outline" className="mt-4 rounded-none border-primary/20 text-primary hover:bg-primary/10">
                        Falar com Financeiro
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
