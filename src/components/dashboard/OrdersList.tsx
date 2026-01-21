import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingBag, Clock, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
    productId: string;
    productName: string;
    type: 'rent' | 'sale';
    price: number;
    quantity: number;
    rentalPeriod?: {
        start: string;
        end: string;
        days: number;
    };
    total: number;
}

interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    useWallet: boolean;
    status: string;
    createdAt: any;
    type: string;
}

export const OrdersList = () => {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            if (!auth.currentUser) return [];

            const q = query(
                collection(db, 'orders'),
                where('userId', '==', auth.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
        },
        enabled: !!auth.currentUser
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Pedidos</CardTitle>
                    <CardDescription>Acompanhe suas cotações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Você ainda não tem pedidos.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Em Análise</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Aprovado</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Recusado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
                <CardDescription>Suas cotações recentes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">#{order.id.slice(0, 6).toUpperCase()}</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <span className="text-xs text-muted-foreground block">
                                    {order.createdAt?.seconds
                                        ? format(new Date(order.createdAt.seconds * 1000), "d MMM, HH:mm", { locale: ptBR })
                                        : 'Data pendente'}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-sm">R$ {order.total.toLocaleString('pt-BR')}</span>
                                {order.useWallet && (
                                    <span className="text-[10px] text-green-600 block">Com desconto Wallet</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-border/50">
                            {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[180px]">
                                        {item.type === 'rent' ? <Clock className="h-3 w-3 text-blue-500" /> : <ShoppingBag className="h-3 w-3 text-green-500" />}
                                        {item.productName}
                                    </span>
                                    <span>x{item.type === 'rent' ? item.rentalPeriod?.days + 'd' : item.quantity}</span>
                                </div>
                            ))}
                            {order.items.length > 2 && (
                                <div className="text-xs text-muted-foreground pt-1 opacity-70">
                                    + {order.items.length - 2} itens...
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" size="sm" className="w-full mt-3 h-7 text-xs">
                            Ver Detalhes <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
