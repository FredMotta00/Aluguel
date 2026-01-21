import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Ticket,
    Gift,
    Share2,
    Wallet,
    CheckCircle2,
    Copy,
    Info,
    GraduationCap,
    Flame,
    TrendingUp,
    Star
} from 'lucide-react';
import { toast } from 'sonner';

const Fidelidade = () => {
    const { company } = useWallet();
    const cashbackBalance = company?.wallet_balance || 0;
    const pointsToNextAward = 1500; // Requirement logic
    const currentPoints = company?.loyalty_points || 0;
    const progress = Math.min((currentPoints / pointsToNextAward) * 100, 100);

    const copyReferralLink = () => {
        navigator.clipboard.writeText('https://exs.com.br/convite/USER123');
        toast.success('Link de indicação copiado!');
    };

    return (
        <div className="container py-8 space-y-10 animate-fade-in max-w-6xl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Programa de Fidelidade</h1>
                    <p className="text-muted-foreground text-lg">
                        Sua lealdade transformada em benefícios exclusivos.
                    </p>
                </div>
                <Badge variant="outline" className="h-8 border-primary text-primary font-bold uppercase tracking-widest px-4">
                    Membro {company?.tier || 'Silver'}
                </Badge>
            </div>

            {/* Main Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Cashback Card */}
                <Card className="rounded-none border-primary/20 bg-primary/5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="h-16 w-16" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Meu Cashback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-4xl font-black text-primary">R$ {cashbackBalance.toLocaleString('pt-BR')}</span>
                            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Saldo disponível para uso imediato</p>
                        </div>
                        <Button className="w-full rounded-none font-bold uppercase text-xs h-10" variant="default">
                            Usar no Próximo Pedido
                        </Button>
                    </CardContent>
                </Card>

                {/* Progress to Next Reward */}
                <Card className="rounded-none border-blue-500/20 bg-blue-500/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Próximo Prêmio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span>Progresso ({currentPoints} pts)</span>
                                <span>{pointsToNextAward} pts</span>
                            </div>
                            <Progress value={progress} className="h-2 rounded-none bg-blue-500/20" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-none bg-blue-500/20 flex items-center justify-center">
                                <Gift className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase leading-none">Diária Grátis UTS 500</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Faltam {pointsToNextAward - currentPoints} pontos para desbloquear</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Referral Link Quick Access */}
                <Card className="rounded-none border-purple-500/20 bg-purple-500/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Indique e Ganhe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">Ganhe **R$ 50,00** em cashback por cada novo parceiro indicado que realizar a primeira locação.</p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/20 p-2 text-[10px] font-mono border border-purple-500/30 truncate flex items-center">
                                exs.com.br/convite/USER123
                            </div>
                            <Button size="icon" variant="outline" className="rounded-none h-10 w-10 shrink-0" onClick={copyReferralLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coupons Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-primary"></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Meus Cupons</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Equipment Rentals */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-primary" /> Locação de Equipamentos
                        </h3>
                        <div className="space-y-3">
                            {[
                                { code: 'WELCOME10', desc: '10% OFF na próxima locação', type: 'Exclusivo' },
                                { code: 'VIP200', desc: 'R$ 200,00 em créditos (membro VIP)', type: 'Premium' }
                            ].map((coupon, i) => (
                                <div key={i} className="group relative flex items-center justify-between border border-primary/20 bg-card p-4 hover:border-primary transition-colors">
                                    <div className="absolute top-0 left-0 h-full w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                                    <div>
                                        <p className="text-lg font-black tracking-tighter text-primary">{coupon.code}</p>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">{coupon.desc}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-none font-bold uppercase text-[10px]">
                                        Copiar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instituto Courses */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-500" /> Cursos Instituto SPCS
                        </h3>
                        <div className="space-y-3">
                            {[
                                { code: 'SPCS30', desc: '30% OFF em qualquer certificação', type: 'Educação' }
                            ].map((coupon, i) => (
                                <div key={i} className="group relative flex items-center justify-between border border-blue-500/20 bg-card p-4 hover:border-blue-500 transition-colors">
                                    <div className="absolute top-0 left-0 h-full w-1 bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                                    <div>
                                        <p className="text-lg font-black tracking-tighter text-blue-500">{coupon.code}</p>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">{coupon.desc}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-none font-bold uppercase text-[10px]">
                                        Copiar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loyalty Levels Info */}
            <Card className="rounded-none border-dashed border-border/50 bg-muted/20">
                <CardContent className="p-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <h4 className="font-bold uppercase text-xs text-primary flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> Vantagens {company?.tier || 'Silver'}
                            </h4>
                            <ul className="text-xs space-y-2 text-muted-foreground font-medium uppercase tracking-tight">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 5% Cashback em todas locações</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Suporte prioritário via WhatsApp</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Check-in antecipado sem custos</li>
                            </ul>
                        </div>
                        <div className="md:col-span-3 flex flex-col justify-center border-l-0 md:border-l pl-0 md:pl-8 border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <h4 className="font-bold uppercase text-xs italic">Caminho para o Gold</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Realize mais 3 locações ou fature R$ 5.000,00 adicionais para subir de nível e ganhar **10% de cashback** em tudo.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator className="opacity-10" />

            {/* Refer-a-friend detailed section */}
            <section className="bg-slate-950 p-8 md:p-12 border border-white/5 relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Expanda nossa rede parceira</h3>
                            <p className="text-slate-400 text-lg">
                                Ao indicar um novo cliente, vocês dois ganham. Ele recebe um cupom de boas-vindas e você recebe créditos diretos na sua Wallet para usar como quiser.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white/5 p-4 border border-white/10">
                                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Você ganha</p>
                                <p className="text-xl font-black text-white italic">R$ 50,00</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-1">Crédito Wallet</p>
                            </div>
                            <div className="bg-white/5 p-4 border border-white/10">
                                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Ele ganha</p>
                                <p className="text-xl font-black text-white italic">15% OFF</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-1">Primeira locação</p>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Button size="lg" className="rounded-none bg-purple-600 hover:bg-purple-500 text-white font-black uppercase px-10 h-14 shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]">
                            Indicar Agora <Share2 className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Fidelidade;
