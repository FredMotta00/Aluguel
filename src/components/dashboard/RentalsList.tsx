import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Calendar, FileText, Clock, AlertCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ReservaWithProduto, Produto } from '@/lib/database.types';

export const RentalsList = () => {
    const { toast } = useToast();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useState(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user?.email) setUserEmail(user.email);
        });
        return () => unsubscribe();
    });

    const { data: rentals = [], isLoading } = useQuery({
        queryKey: ['my-rentals', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];

            const q = query(
                collection(db, 'reservas'),
                where('cliente_email', '==', userEmail),
                orderBy('created_at', 'desc')
            );

            const querySnapshot = await getDocs(q);

            const rentalsData = await Promise.all(
                querySnapshot.docs.map(async (reservaDoc) => {
                    const reservaData = reservaDoc.data();
                    let produto = null;

                    if (reservaData.produto_id) {
                        const produtoDocRef = doc(db, 'produtos', reservaData.produto_id);
                        const produtoSnap = await getDoc(produtoDocRef);
                        if (produtoSnap.exists()) {
                            produto = { id: produtoSnap.id, ...produtoSnap.data() } as Produto;
                        }
                    }

                    return {
                        id: reservaDoc.id,
                        ...reservaData,
                        produtos: produto
                    } as ReservaWithProduto;
                })
            );

            return rentalsData;
        },
        enabled: !!userEmail
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendente': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
            case 'confirmada': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmada</Badge>;
            case 'finalizada': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Finalizada</Badge>;
            case 'cancelada': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const activeRentals = rentals.filter(r => ['pendente', 'confirmada'].includes(r.status));

    return (
        <Card className="rounded-none border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Lista de Locações
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : activeRentals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Produto</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Período</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeRentals.map((rental) => (
                                    <TableRow key={rental.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                {rental.produtos?.imagem && (
                                                    <div className="w-12 h-12 bg-muted border border-border/50 overflow-hidden shrink-0">
                                                        <img
                                                            src={rental.produtos.imagem}
                                                            alt={rental.produtos.nome}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-bold text-sm block uppercase tracking-tight">{rental.produtos?.nome || 'Produto Indisponível'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Contrato #{rental.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium text-foreground">
                                                    {format(parseISO(rental.data_inicio), "dd/MM/yy", { locale: ptBR })} - {format(parseISO(rental.data_fim), "dd/MM/yy", { locale: ptBR })}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">
                                                    {differenceInDays(parseISO(rental.data_fim), parseISO(rental.data_inicio)) + 1} dias de locação
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(rental.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none h-8 text-xs font-bold border-primary/20 text-primary hover:bg-primary/10"
                                                    onClick={() => toast({ title: "Solicitado", description: "Pedido de extensão enviado com sucesso." })}
                                                >
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                    Estender
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-none h-8 text-xs font-bold"
                                                    onClick={() => toast({ title: "Download", description: "Contrato baixado com sucesso." })}
                                                >
                                                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                                                    Contrato
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-border/50 bg-muted/20">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h3 className="text-lg font-bold uppercase tracking-tight text-muted-foreground">Sem Locações Ativas</h3>
                        <p className="text-sm text-muted-foreground mt-1 px-8">Você não possui contratos de locação em andamento no momento.</p>
                        <Button variant="link" className="mt-4 text-primary font-bold uppercase text-xs" onClick={() => window.location.href = '/'}>
                            Explorar Catálogo →
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
