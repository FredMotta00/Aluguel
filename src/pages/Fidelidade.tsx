import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Ticket,
    Gift,
    Share2,
    Copy,
    GraduationCap,
    TrendingUp,
    Star,
    Trophy,
    Zap,
    CheckCircle2,
    Percent,
    Users,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const Fidelidade = () => {
    const copyReferralLink = () => {
        navigator.clipboard.writeText('https://exs.com.br/convite/USER123');
        toast.success('Link de indicação copiado!');
    };

    const copyCoupon = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Cupom ${code} copiado!`);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 px-4">
                <div className="container max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Trophy className="h-12 w-12" />
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                                Programa de Fidelidade
                            </h1>
                        </div>
                        <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
                            Sua parceria com a EXS é recompensada. Descubra como ganhar benefícios exclusivos a cada locação.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container max-w-7xl mx-auto py-12 px-4 space-y-16">
                {/* How it Works Section */}
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">Como Funciona</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Nosso programa de fidelidade é simples: quanto mais você aluga, mais você ganha.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
                            <CardContent className="pt-8 text-center space-y-4">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <div className="h-8 w-8 rounded-full bg-primary text-white font-black flex items-center justify-center mx-auto mb-3">1</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Alugue Equipamentos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Cada locação acumula pontos automaticamente em sua conta EXS
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 2 */}
                        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
                            <CardContent className="pt-8 text-center space-y-4">
                                <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                                    <TrendingUp className="h-8 w-8 text-blue-500" />
                                </div>
                                <div>
                                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center mx-auto mb-3">2</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Acumule Pontos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        A cada R$ 100,00 em locações você ganha 10 pontos de fidelidade
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 3 */}
                        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
                            <CardContent className="pt-8 text-center space-y-4">
                                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
                                    <Gift className="h-8 w-8 text-amber-500" />
                                </div>
                                <div>
                                    <div className="h-8 w-8 rounded-full bg-amber-500 text-white font-black flex items-center justify-center mx-auto mb-3">3</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Resgate Benefícios</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Troque seus pontos por descontos, upgrades ou equipamentos grátis
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator className="opacity-10" />

                {/* Cashback Explanation Section */}
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">Como Funciona o Cashback</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Entenda como você ganha e usa seu cashback EXS
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* What is Cashback */}
                        <Card className="border-primary/20">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Percent className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase">O que é Cashback?</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    O cashback é um <strong>crédito em dinheiro</strong> que você ganha de volta a cada locação realizada.
                                    Quanto maior seu nível de fidelidade, maior a porcentagem de retorno.
                                </p>
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <p className="text-xs font-bold uppercase text-primary mb-2">Exemplo Prático:</p>
                                    <p className="text-sm">
                                        💰 Você alugou R$ 1.000,00 em equipamentos<br />
                                        ⭐ Seu nível: Gold (10% cashback)<br />
                                        <strong className="text-primary">✓ Você recebe: R$ 100,00 de volta</strong>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How to Use Cashback */}
                        <Card className="border-primary/20">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase">Como Usar?</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    O cashback fica disponível <strong>automaticamente</strong> em sua carteira EXS e pode ser usado como
                                    <strong> desconto em qualquer nova locação</strong>.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>Use no checkout da próxima locação</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>Sem limite mínimo para usar</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>Válido por 12 meses após o crédito</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <span>Acumula com outros descontos</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cashback Calculation Timeline */}
                    <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Linha do Tempo do Cashback
                            </h3>
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-primary text-white font-black flex items-center justify-center mx-auto text-lg">1</div>
                                    <p className="text-sm font-bold">Você Aluga</p>
                                    <p className="text-xs text-muted-foreground">Realiza uma locação</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-primary text-white font-black flex items-center justify-center mx-auto text-lg">2</div>
                                    <p className="text-sm font-bold">Equipamento Devolvido</p>
                                    <p className="text-xs text-muted-foreground">Devolução confirmada</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-primary text-white font-black flex items-center justify-center mx-auto text-lg">3</div>
                                    <p className="text-sm font-bold">Cashback Creditado</p>
                                    <p className="text-xs text-muted-foreground">Em até 48h após devolução</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-green-500 text-white font-black flex items-center justify-center mx-auto text-lg">✓</div>
                                    <p className="text-sm font-bold">Pronto para Usar</p>
                                    <p className="text-xs text-muted-foreground">Na próxima locação</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Notes */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm">Cashback Cumulativo</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Cada nova locação gera mais cashback. Seu saldo acumula e pode ser usado quando preferir,
                                            sem limite máximo de acúmulo.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Star className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm">Suba de Nível</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Quanto maior seu nível, maior seu cashback! Evolua de Silver (5%) para Gold (10%) ou Platinum (15%)
                                            alugando mais equipamentos.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator className="opacity-10" />

                {/* Loyalty Tiers Explanation */}
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">Níveis de Fidelidade</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Evolua através dos níveis e desbloqueie vantagens cada vez melhores
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Silver Tier */}
                        <Card className="relative overflow-hidden border-slate-400/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-600/10"></div>
                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Star className="h-8 w-8 text-slate-400" />
                                    <Badge variant="outline" className="border-slate-400 text-slate-400">Inicial</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black uppercase">Silver</CardTitle>
                                <p className="text-sm text-muted-foreground">De R$ 0 até R$ 2.499</p>
                            </CardHeader>
                            <CardContent className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>5% de cashback</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Suporte prioritário</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Cupons exclusivos</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gold Tier */}
                        <Card className="relative overflow-hidden border-amber-500/30 scale-105 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10"></div>
                            <div className="absolute -top-1 -right-1">
                                <Badge className="bg-amber-500 text-black font-black">POPULAR</Badge>
                            </div>
                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                                    <Badge variant="outline" className="border-amber-500 text-amber-500">Premium</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black uppercase">Gold</CardTitle>
                                <p className="text-sm text-muted-foreground">De R$ 2.500 até R$ 9.999</p>
                            </CardHeader>
                            <CardContent className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="font-bold">10% de cashback</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Entrega prioritária</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Check-in antecipado</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Upgrades gratuitos</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platinum Tier */}
                        <Card className="relative overflow-hidden border-purple-500/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10"></div>
                            <CardHeader className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Trophy className="h-8 w-8 text-purple-500" />
                                    <Badge variant="outline" className="border-purple-500 text-purple-500">Elite</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black uppercase">Platinum</CardTitle>
                                <p className="text-sm text-muted-foreground">Acima de R$ 10.000</p>
                            </CardHeader>
                            <CardContent className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="font-bold">15% de cashback</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Gerente de conta dedicado</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Acesso antecipado a novos equipamentos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Condições especiais personalizadas</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tier Evolution Explanation */}
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold">Como evoluir de nível?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Seu nível é calculado automaticamente com base no <strong>valor total das suas locações nos últimos 12 meses</strong>.
                                        Quanto mais você aluga, maior seu nível e melhores os benefícios. O cashback é aplicado automaticamente
                                        em sua carteira EXS e pode ser usado em qualquer nova locação.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Separator className="opacity-10" />

                {/* Coupons Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-primary"></div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Cupons Disponíveis</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Equipment Rentals */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Ticket className="h-4 w-4 text-primary" /> Locação de Equipamentos
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { code: 'WELCOME10', desc: '10% OFF na próxima locação', type: 'Exclusivo', color: 'primary' },
                                    { code: 'VIP200', desc: 'R$ 200,00 em créditos (membro VIP)', type: 'Premium', color: 'primary' },
                                    { code: 'PRIMEIRA15', desc: '15% OFF na primeira locação', type: 'Novo Cliente', color: 'primary' }
                                ].map((coupon, i) => (
                                    <div key={i} className="group relative flex items-center justify-between border border-primary/20 bg-card p-4 hover:border-primary transition-colors rounded-lg">
                                        <div className="absolute top-0 left-0 h-full w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform rounded-l-lg"></div>
                                        <div className="pl-2">
                                            <p className="text-lg font-black tracking-tight text-primary">{coupon.code}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{coupon.desc}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="font-bold uppercase text-xs"
                                            onClick={() => copyCoupon(coupon.code)}
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
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
                                    { code: 'SPCS30', desc: '30% OFF em qualquer certificação', type: 'Educação', color: 'blue-500' },
                                    { code: 'TECNICO20', desc: '20% OFF em treinamentos técnicos', type: 'Educação', color: 'blue-500' }
                                ].map((coupon, i) => (
                                    <div key={i} className="group relative flex items-center justify-between border border-blue-500/20 bg-card p-4 hover:border-blue-500 transition-colors rounded-lg">
                                        <div className="absolute top-0 left-0 h-full w-1 bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform rounded-l-lg"></div>
                                        <div className="pl-2">
                                            <p className="text-lg font-black tracking-tight text-blue-500">{coupon.code}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{coupon.desc}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="font-bold uppercase text-xs"
                                            onClick={() => copyCoupon(coupon.code)}
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copiar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <Separator className="opacity-10" />

                {/* Refer-a-friend Section */}
                <section className="bg-gradient-to-r from-purple-950 to-slate-950 p-8 md:p-12 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-colors"></div>
                    <div className="relative z-10 space-y-8">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Users className="h-10 w-10 text-purple-400" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Indique e Ganhe</h3>
                            <p className="text-slate-300 text-lg">
                                Compartilhe a EXS com seus parceiros e ganhe R$ 50,00 em créditos para cada indicação que realizar a primeira locação.
                                Seu amigo também ganha 15% de desconto!
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            <div className="bg-white/5 p-6 border border-purple-500/30 rounded-xl text-center backdrop-blur-sm">
                                <Percent className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                                <p className="text-sm text-purple-400 font-bold uppercase mb-2">Você Ganha</p>
                                <p className="text-3xl font-black text-white mb-1">R$ 50,00</p>
                                <p className="text-xs text-slate-400 uppercase">Crédito na Wallet</p>
                            </div>
                            <div className="bg-white/5 p-6 border border-purple-500/30 rounded-xl text-center backdrop-blur-sm">
                                <Gift className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                                <p className="text-sm text-purple-400 font-bold uppercase mb-2">Seu Amigo Ganha</p>
                                <p className="text-3xl font-black text-white mb-1">15% OFF</p>
                                <p className="text-xs text-slate-400 uppercase">Primeira Locação</p>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-black/30 p-4 text-sm font-mono border border-purple-500/30 rounded-lg flex items-center backdrop-blur-sm">
                                    <code className="text-purple-300">exs.com.br/convite/USER123</code>
                                </div>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-purple-500/30 hover:bg-purple-500/10"
                                    onClick={copyReferralLink}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                size="lg"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase shadow-lg"
                            >
                                <Share2 className="h-5 w-5 mr-2" />
                                Compartilhar Link
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Fidelidade;
