import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, ShoppingCart, Calendar, Info, Wallet, Ticket } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase/client';
import { collection as firestoreCollection, query, where, limit, getDocs } from 'firebase/firestore';

interface SuggestionProduct {
    id: string;
    nome: string;
    imagem: string | null;
    preco_diario?: number;
    commercial?: {
        dailyRate?: number | null;
        salePrice?: number | null;
        monthlyRate?: number | null;
        isForSale?: boolean;
    };
    [key: string]: any;
}

const CartPage = () => {
    const { items, removeFromCart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [useWallet, setUseWallet] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState('');
    const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; discount: number } | null>(null);
    const [loading, setLoading] = React.useState(false);

    const hasMonthlyPlan = items.some(item => item.rentalPeriod?.monthlyPlan);

    // Fetch Wallet Balance
    const { data: walletBalance = 0 } = useQuery({
        queryKey: ['wallet-balance', auth.currentUser?.uid],
        queryFn: async () => {
            if (!auth.currentUser) return 0;
            const docRef = doc(db, 'companies', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? (docSnap.data().wallet_balance || 0) : 0;
        },
        enabled: !!auth.currentUser
    });

    // Fetch Suggestions (Products for Sale)
    const { data: suggestions = [] } = useQuery({
        queryKey: ['cart-suggestions', items.length],
        queryFn: async () => {
            const q = query(
                firestoreCollection(db, 'inventory'),
                where('status', 'in', ['available', 'disponivel']),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const cartProductIds = items.map(i => i.productId);
            return querySnapshot.docs
                .map((doc): SuggestionProduct => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nome: data.nome || data.name || "Sem nome",
                        imagem: data.imagem || (data.images && data.images.length > 0 ? data.images[0] : null),
                        ...data
                    };
                })
                .filter(p => !cartProductIds.includes(p.id))
                .slice(0, 4); // Show only 4 suggestions
        }
    });

    const walletDiscount = useWallet ? Math.min(walletBalance, total) : 0;
    const couponDiscount = appliedCoupon ? (appliedCoupon.discount > 1 ? appliedCoupon.discount : total * appliedCoupon.discount) : 0;
    const finalTotal = Math.max(0, total - walletDiscount - couponDiscount);

    const handleApplyCoupon = () => {
        if (hasMonthlyPlan) {
            toast({
                title: "Não permitido",
                description: "Cupons não podem ser usados com planos mensais.",
                variant: "destructive"
            });
            return;
        }

        if (couponCode.toUpperCase() === 'WELCOME10') {
            setAppliedCoupon({ code: 'WELCOME10', discount: 0.1 });
            toast({ title: "Sucesso", description: "Cupom de 10% aplicado!" });
        } else {
            toast({ title: "Erro", description: "Cupom inválido.", variant: "destructive" });
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) return;

        // Check auth first
        if (!auth.currentUser) {
            toast({
                title: "Login necessário",
                description: "Faça login para finalizar o pedido.",
                variant: "destructive"
            });
            navigate('/auth', { state: { from: location.pathname } });
            return;
        }

        navigate('/checkout');
    };


    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-slate-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-slate-700">Seu carrinho está vazio</h2>
                <p className="text-muted-foreground mb-8">Navegue pelo catálogo e adicione itens para locação ou compra.</p>
                <Link to="/">
                    <Button size="lg" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Catálogo
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-primary" />
                Carrinho de Compras
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-border/60 hover:border-border transition-colors">
                            <div className="flex flex-col sm:flex-row">
                                <div className="w-full sm:w-32 h-32 bg-slate-100 shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Info className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                {item.type === 'rent' ? (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-1 inline-block">
                                                        Locação
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-1 inline-block">
                                                        Venda
                                                    </span>
                                                )}
                                                <h3 className="font-semibold text-lg leading-tight">{item.productName}</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-500 -mt-1 -mr-2"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {item.type === 'rent' && item.rentalPeriod && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    {item.rentalPeriod.start.toLocaleDateString('pt-BR')} até {item.rentalPeriod.end.toLocaleDateString('pt-BR')}
                                                    {item.rentalPeriod.monthlyPlan ? ' • Plano Mensal' : ` • ${item.rentalPeriod.days} dias`}
                                                    {item.quantity && item.quantity > 1 ? ` • ${item.quantity} equipamentos` : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-sm text-muted-foreground">
                                            {item.type === 'rent'
                                                ? (item.rentalPeriod?.monthlyPlan ? `R$ ${item.price.toLocaleString('pt-BR')} / mês` : `R$ ${item.price.toLocaleString('pt-BR')} / dia`)
                                                : `Produto único`
                                            }
                                            {item.quantity && item.quantity > 1 && ` • ${item.quantity}x`}
                                        </div>
                                        <div className="font-bold text-lg text-primary">
                                            R$ {((item.type === 'rent' && item.rentalPeriod)
                                                ? (item.rentalPeriod.monthlyPlan ? item.price * (item.quantity || 1) : item.price * item.rentalPeriod.days * (item.quantity || 1))
                                                : (item.price * (item.quantity || 1))
                                            ).toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-lg border-border/60">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle>Resumo do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>R$ {total.toLocaleString('pt-BR')}</span>
                                </div>

                                {appliedCoupon && !hasMonthlyPlan && (
                                    <div className="flex justify-between text-primary font-medium animate-in fade-in slide-in-from-top-1">
                                        <span className="flex items-center gap-1.5">
                                            <Ticket className="w-4 h-4" />
                                            Cupom ({appliedCoupon.code})
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => setAppliedCoupon(null)}
                                            >
                                                ×
                                            </Button>
                                        </span>
                                        <span>- R$ {couponDiscount.toLocaleString('pt-BR')}</span>
                                    </div>
                                )}

                                {useWallet && (
                                    <div className="flex justify-between text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
                                        <span className="flex items-center gap-1.5">
                                            <Wallet className="w-4 h-4" />
                                            Saldo Utilizado
                                        </span>
                                        <span>- R$ {walletDiscount.toLocaleString('pt-BR')}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-border flex justify-between items-center text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">R$ {finalTotal.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            <div className="space-y-2">
                                <Label htmlFor="coupon" className={`text-xs font-bold uppercase tracking-widest ${hasMonthlyPlan ? 'opacity-50' : ''}`}>
                                    Cupom de Desconto
                                </Label>
                                <div className="flex gap-2">
                                    <input
                                        id="coupon"
                                        type="text"
                                        placeholder="Digite seu cupom"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={hasMonthlyPlan}
                                        className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 uppercase font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        className="rounded-none border-primary/20 hover:bg-primary/10"
                                        onClick={handleApplyCoupon}
                                        disabled={hasMonthlyPlan || !couponCode}
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                                {hasMonthlyPlan && (
                                    <p className="text-[10px] text-destructive font-bold uppercase flex items-center gap-1 mt-1">
                                        <Info className="h-3 w-3" />
                                        Cupons não cumulativos com planos mensais
                                    </p>
                                )}
                            </div>

                            {auth.currentUser && walletBalance > 0 && (
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="wallet-mode" checked={useWallet} onCheckedChange={setUseWallet} />
                                        <Label htmlFor="wallet-mode" className="text-sm font-medium cursor-pointer flex-1">
                                            Usar saldo da Wallet
                                            <span className="block text-xs text-muted-foreground font-normal">
                                                Disponível: R$ {walletBalance.toLocaleString('pt-BR')}
                                            </span>
                                        </Label>
                                    </div>
                                </div>
                            )}

                            <Button size="lg" className="w-full" onClick={handleCheckout} disabled={loading}>
                                {loading ? 'Processando...' : 'Gerar Pedido / Cotação'}
                            </Button>

                            <div className="text-xs text-muted-foreground text-center px-4">
                                Ao continuar, você concorda que este é um pedido de cotação sujeito à aprovação.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Suggestions Section */}
            {suggestions.length > 0 && (
                <div className="mt-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1 bg-primary"></div>
                        <h2 className="text-2xl font-bold">Sugestões para Você</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suggestions.map((product) => (
                            <Card key={product.id} className="overflow-hidden border-border/40 hover:border-primary/30 transition-all group rounded-none">
                                <Link to={`/produto/${product.id}`} className="block aspect-video bg-slate-900 relative overflow-hidden">
                                    {product.imagem ? (
                                        <img src={product.imagem} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                                            <ShoppingCart className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-primary/90 text-[10px] font-black px-2 py-0.5 uppercase tracking-tighter text-black rounded-none">Oportunidade</span>
                                    </div>
                                </Link>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-sm line-clamp-1 mb-2">{product.nome}</h3>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase">Condição de Início</span>
                                            <span className="font-black text-primary">
                                                {(() => {
                                                    const daily = product.commercial?.dailyRate || product.preco_diario;
                                                    const sale = product.commercial?.salePrice;

                                                    if (daily && Number(daily) > 0) {
                                                        return `R$ ${Number(daily).toLocaleString('pt-BR')} / dia`;
                                                    }
                                                    if (sale && Number(sale) > 0) {
                                                        return `R$ ${Number(sale).toLocaleString('pt-BR')}`;
                                                    }
                                                    return 'Sob Consulta';
                                                })()}
                                            </span>
                                        </div>
                                        <Link to={`/produto/${product.id}`}>
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-none border-primary/20 hover:bg-primary hover:text-black">
                                                +
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
