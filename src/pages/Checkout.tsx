import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    CreditCard,
    QrCode,
    FileText,
    CheckCircle2,
    Plus,
    Check,
    ShieldCheck,
    BookOpen,
    Headphones,
    ShoppingBag,
    Loader2,
    User,
    ClipboardIcon,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { db, auth, functions } from '@/integrations/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

interface Addon {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: React.ElementType;
}

const AVAILABLE_ADDONS: Addon[] = [
    {
        id: 'curso-uts',
        name: 'Curso de Operação UTS',
        description: 'Capacite sua equipe para operar o equipamento com segurança e eficiência.',
        price: 450,
        icon: BookOpen
    },
    {
        id: 'suporte-premium',
        name: 'Suporte Técnico Premium 24h',
        description: 'Assistência prioritária via WhatsApp e telefone para qualquer emergência.',
        price: 150,
        icon: Headphones
    },
    {
        id: 'seguro-extendido',
        name: 'Proteção EXS (Seguro)',
        description: 'Cobertura contra danos acidentais e avarias durante o período de locação.',
        price: 280,
        icon: ShieldCheck
    },
    {
        id: 'consultoria-projeto',
        name: 'Consultoria técnica de Projeto',
        description: 'Auxílio na configuração e dimensionamento ideal para sua obra.',
        price: 320,
        icon: FileText
    }
];

const Checkout = () => {
    const { items, total, clearCart } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'cartao'>('pix');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Asaas Billing Data
    const [customerName, setCustomerName] = useState('');
    const [customerCpfCnpj, setCustomerCpfCnpj] = useState('');
    const [paymentResult, setPaymentResult] = useState<{ id: string, link: string, pix?: string } | null>(null);

    const addonsTotal = useMemo(() => {
        return AVAILABLE_ADDONS
            .filter(addon => selectedAddons.includes(addon.id))
            .reduce((acc, current) => acc + current.price, 0);
    }, [selectedAddons]);

    const finalTotal = total + addonsTotal;

    const toggleAddon = (addonId: string) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    const handleConfirmOrder = async () => {
        if (items.length === 0) {
            toast({
                title: "Carrinho vazio",
                description: "Adicione itens ao carrinho antes de finalizar.",
                variant: "destructive"
            });
            return;
        }

        if (!customerName || !customerCpfCnpj) {
            toast({
                title: "Dados incompletos",
                description: "Por favor, preencha o nome e CPF/CNPJ para cobrança.",
                variant: "destructive"
            });
            return;
        }

        if (!auth.currentUser) {
            toast({
                title: "Login necessário",
                description: "Você precisa estar logado para finalizar o pedido.",
                variant: "destructive"
            });
            navigate('/auth', { state: { from: '/checkout' } });
            return;
        }

        setIsSubmitting(true);

        try {
            // Mapping payment methods for Asaas
            const asaasBillingType = {
                'pix': 'PIX',
                'boleto': 'BOLETO',
                'cartao': 'CREDIT_CARD'
            }[paymentMethod];

            // 1. Call Asaas Payment Cloud Function
            const createAsaasPayment = httpsCallable(functions, 'criarCobrancaAsaas');
            const paymentResponse = await createAsaasPayment({
                valor: finalTotal,
                cpfCnpj: customerCpfCnpj.replace(/\D/g, ''),
                nome: customerName,
                formaPagamento: asaasBillingType
            });

            const asaasData = paymentResponse.data as any;

            if (!asaasData.sucesso) {
                throw new Error("Falha ao gerar cobrança no Asaas");
            }

            const orderAddons = AVAILABLE_ADDONS.filter(a => selectedAddons.includes(a.id));

            // 2. Create the Main Order
            const orderRef = await addDoc(collection(db, 'orders'), {
                userId: auth.currentUser.uid,
                status: 'pending_payment',
                paymentMethod,
                baseTotal: total,
                addonsTotal,
                finalTotal,
                createdAt: serverTimestamp(),
                customer: {
                    name: customerName,
                    cpfCnpj: customerCpfCnpj
                },
                payment: {
                    asaasId: asaasData.id,
                    invoiceUrl: asaasData.link,
                    bankSlipUrl: asaasData.pix || null
                },
                items: items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity || 1,
                    type: item.type,
                    price: item.price,
                    rentalPeriod: item.rentalPeriod || null
                })),
                addons: orderAddons.map(a => ({
                    id: a.id,
                    name: a.name,
                    price: a.price
                }))
            });

            // 3. Create individual reservations for each rental item
            for (const item of items) {
                if (item.type === 'rent' && item.rentalPeriod) {
                    await addDoc(collection(db, 'reservas'), {
                        orderId: orderRef.id,
                        usuario_id: auth.currentUser.uid,
                        produto_id: item.productId,
                        produto_nome: item.productName,
                        data_inicio: item.rentalPeriod.start.toISOString().split('T')[0],
                        data_fim: item.rentalPeriod.end.toISOString().split('T')[0],
                        quantidade: item.quantity || 1,
                        tipo_locacao: item.rentalPeriod.monthlyPlan ? 'monthly' : 'daily',
                        status: 'pending_approval',
                        valor_total: item.rentalPeriod.monthlyPlan
                            ? item.price * (item.quantity || 1)
                            : item.price * item.rentalPeriod.days * (item.quantity || 1),
                        createdAt: serverTimestamp()
                    });
                }
            }

            toast({
                title: "Pedido Realizado! 🚀",
                description: "Sua cobrança foi gerada com sucesso via Asaas.",
            });

            setPaymentResult({
                id: asaasData.id,
                link: asaasData.link,
                pix: asaasData.pix
            });

            clearCart();

        } catch (error: any) {
            console.error("Error creating order:", error);
            toast({
                title: "Erro ao finalizar",
                description: error.message || "Ocorreu um problema ao processar seu pedido.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (paymentResult) {
        return (
            <div className="container mx-auto px-4 py-16 animate-fade-in max-w-2xl">
                <Card className="border-green-500/30 bg-black/40 rounded-none text-center">
                    <CardHeader className="pt-10">
                        <div className="mx-auto bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <CardTitle className="text-3xl font-black uppercase tracking-tighter">Pedido Confirmado!</CardTitle>
                        <p className="text-muted-foreground mt-2">Sua reserva foi pré-aprovada e a cobrança gerada.</p>
                    </CardHeader>
                    <CardContent className="space-y-8 py-10">
                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-none">
                            <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
                                <QrCode className="h-5 w-5 text-primary" />
                                Link de Pagamento Asaas
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Clique no botão abaixo para acessar o PDF do boleto ou o QR Code do PIX diretamente no portal oficial.
                            </p>
                            <Button asChild className="w-full h-14 text-lg font-bold uppercase rounded-none" size="lg">
                                <a href={paymentResult.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    Pagar Agora
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="rounded-none h-12 gap-2" asChild>
                                <Link to="/minhas-reservas">Ver Minhas Reservas</Link>
                            </Button>
                            <Button variant="ghost" className="rounded-none h-12 gap-2" asChild>
                                <Link to="/">Voltar para a Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (items.length === 0 && !isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
                <h2 className="text-2xl font-bold">Seu carrinho está vazio</h2>
                <p className="text-muted-foreground">Adicione produtos para chegar ao checkout.</p>
                <Button asChild rounded-none>
                    <Link to="/">Voltar ao Catálogo</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/carrinho')}>
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Carrinho
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Meio: Checkout e Upsell */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Finalizar Pedido</h1>
                        <p className="text-muted-foreground">Revise seus itens e escolha opcionais para sua locação.</p>
                    </div>

                    {/* Section: Dados do Pagador */}
                    <Card className="border-white/5 bg-white/5 rounded-none">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Dados de Cobrança (Asaas)
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Esses dados serão usados para emitir seu PIX ou Boleto.</p>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Nome Completo / Razão Social</Label>
                                    <Input
                                        id="customerName"
                                        placeholder="EXS LTDA ou João Silva"
                                        className="rounded-none h-12 border-white/10 bg-black/20 focus:border-primary"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerCpfCnpj">CPF ou CNPJ</Label>
                                    <Input
                                        id="customerCpfCnpj"
                                        placeholder="00.000.000/0000-00"
                                        className="rounded-none h-12 border-white/10 bg-black/20 focus:border-primary"
                                        value={customerCpfCnpj}
                                        onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Turbine seu Combo (Upsell) */}
                    <Card className="border-blue-500/30 bg-blue-950/10 rounded-none overflow-hidden ring-1 ring-blue-500/20">
                        <CardHeader className="bg-blue-600/10 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-blue-400" />
                                    Turbine seu Combo 🚀
                                </CardTitle>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400 font-bold uppercase text-[10px]">OFERTA EXCLUSIVA</Badge>
                            </div>
                            <p className="text-sm text-blue-300/80">Adicione serviços essenciais para sua operação e economize tempo.</p>
                        </CardHeader>
                        <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
                            {AVAILABLE_ADDONS.map((addon) => {
                                const Icon = addon.icon;
                                const isSelected = selectedAddons.includes(addon.id);
                                return (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`relative group cursor-pointer border p-4 transition-all rounded-none flex flex-col justify-between ${isSelected
                                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                            : 'bg-black/20 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2 rounded-none ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleAddon(addon.id)}
                                                className="rounded-none border-blue-500 data-[state=checked]:bg-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>{addon.name}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                {addon.description}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs font-black text-primary">
                                                + R$ {addon.price.toLocaleString('pt-BR')}
                                            </span>
                                            {isSelected && (
                                                <span className="text-[8px] font-black text-blue-400 uppercase flex items-center gap-1">
                                                    <Check className="h-2 w-2" /> Incluso
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Section: Forma de Pagamento */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Método de Pagamento
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div
                                onClick={() => setPaymentMethod('pix')}
                                className={`p-6 border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 rounded-none ${paymentMethod === 'pix' ? 'bg-primary/10 border-primary ring-1 ring-primary/50' : 'bg-black/20 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <QrCode className={`h-8 w-8 ${paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="text-center">
                                    <span className="block font-bold">PIX</span>
                                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Aprovação Imediata</span>
                                </div>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('boleto')}
                                className={`p-6 border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 rounded-none ${paymentMethod === 'boleto' ? 'bg-primary/10 border-primary ring-1 ring-primary/50' : 'bg-black/20 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <FileText className={`h-8 w-8 ${paymentMethod === 'boleto' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="text-center">
                                    <span className="block font-bold">Boleto</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">1 a 2 dias úteis</span>
                                </div>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('cartao')}
                                className={`p-6 border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 rounded-none ${paymentMethod === 'cartao' ? 'bg-primary/10 border-primary ring-1 ring-primary/50' : 'bg-black/20 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="relative">
                                    <CreditCard className={`h-8 w-8 ${paymentMethod === 'cartao' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <Badge className="absolute -top-2 -right-6 h-4 text-[8px] bg-blue-600 rounded-none border-none">12x</Badge>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold">Cartão</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Até 12x parcelado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direita: Resumo */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-border/50 bg-black/40 rounded-none backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-lg uppercase font-black tracking-widest">Resumo do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Itens do Carrinho */}
                            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold line-clamp-1">{item.productName}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">
                                                {item.quantity}x {item.type === 'rent' ? 'Locação' : 'Venda'}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold">
                                            R$ {(item.type === 'rent' && item.rentalPeriod && !item.rentalPeriod.monthlyPlan
                                                ? item.price * item.rentalPeriod.days * (item.quantity || 1)
                                                : item.price * (item.quantity || 1)
                                            ).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Addons Extra */}
                            {selectedAddons.length > 0 && (
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Opcionais Adicionados</span>
                                    {AVAILABLE_ADDONS.filter(a => selectedAddons.includes(a.id)).map(addon => (
                                        <div key={addon.id} className="flex justify-between items-center text-xs animate-in slide-in-from-right-2 duration-300">
                                            <div className="flex items-center gap-2 text-blue-100">
                                                <Plus className="h-3 w-3" />
                                                {addon.name}
                                            </div>
                                            <span className="font-bold">R$ {addon.price.toLocaleString('pt-BR')}</span>
                                        </div>
                                    ))}
                                    <Separator className="bg-white/5" />
                                </div>
                            )}

                            {/* Totais */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>R$ {total.toLocaleString('pt-BR')}</span>
                                </div>
                                {addonsTotal > 0 && (
                                    <div className="flex justify-between text-sm text-blue-400">
                                        <span>Serviços Extras</span>
                                        <span className="font-bold">+ R$ {addonsTotal.toLocaleString('pt-BR')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-lg font-black uppercase">Total Final</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-4xl font-black text-primary glow-text">
                                            R$ {finalTotal.toLocaleString('pt-BR')}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Valor à vista</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/5 pt-6">
                            <div className="flex items-center gap-3 text-muted-foreground bg-black/40 p-3 w-full">
                                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                                <span className="text-[10px] font-medium leading-tight">
                                    Ambiente 100% seguro. Seus dados estão protegidos por criptografia de ponta a ponta.
                                </span>
                            </div>
                            <Button
                                className="w-full h-16 text-xl font-black uppercase tracking-tighter rounded-none shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_10px_40px_rgba(34,197,94,0.5)] transition-all bg-green-600 hover:bg-green-500 text-white"
                                onClick={handleConfirmOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar e Pagar
                                        <CheckCircle2 className="ml-2 h-6 w-6" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
