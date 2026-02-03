import { useQuery } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PackageCard from '@/components/packages/PackageCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package as PackageIcon, Sparkles, TrendingDown, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pacotes() {
    const { data: packages, isLoading } = useQuery({
        queryKey: ['public-packages'],
        queryFn: async () => {
            const q = query(
                collection(db, 'packages'),
                where('status', '==', 'active')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
    });

    const benefits = [
        {
            icon: TrendingDown,
            title: 'Economia Garantida',
            description: 'Até 30% de desconto vs. locação individual'
        },
        {
            icon: Clock,
            title: 'Tudo de Uma Vez',
            description: 'Equipamentos coordenados e prontos para uso'
        },
        {
            icon: Shield,
            title: 'Suporte Completo',
            description: 'Assistência técnica para todo o pacote'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

                <div className="container max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Combos Especiais
                        </Badge>
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <PackageIcon className="h-12 w-12" />
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                                Planos de Locação
                            </h1>
                        </div>
                        <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
                            Economize até 30% com nossas combinações especiais de equipamentos.
                            Pacotes criados para maximizar seu investimento.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <TrendingDown className="h-5 w-5" />
                                <span className="font-bold">Até 30% OFF</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <PackageIcon className="h-5 w-5" />
                                <span className="font-bold">Combos Prontos</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold">Suporte Incluso</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 px-4 bg-muted/30">
                <div className="container max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        {benefits.map((benefit, idx) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={idx} className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Icon className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg mb-1">{benefit.title}</h3>
                                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="py-12 px-4 bg-background">
                <div className="container max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                                <p className="text-muted-foreground">Carregando pacotes...</p>
                            </div>
                        </div>
                    ) : packages && packages.length > 0 ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Pacotes Disponíveis</h2>
                                <p className="text-muted-foreground">
                                    Encontramos {packages.length} {packages.length === 1 ? 'pacote' : 'pacotes'} para você
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {packages.map((pkg: any) => (
                                    <PackageCard
                                        key={pkg.id}
                                        id={pkg.id}
                                        name={pkg.name}
                                        description={pkg.description}
                                        products={pkg.products || []}
                                        pricing={pkg.pricing}
                                        image={pkg.image}
                                        rentalType={pkg.rentalType}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="h-24 w-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                                    <PackageIcon className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black">Nenhum Pacote Disponível</h3>
                                    <p className="text-muted-foreground">
                                        No momento não temos pacotes cadastrados. Confira nosso catálogo completo de equipamentos para locação individual.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link to="/">
                                        <Button size="lg" className="font-bold">
                                            <PackageIcon className="h-4 w-4 mr-2" />
                                            Ver Catálogo Completo
                                        </Button>
                                    </Link>
                                    <Link to="/planos">
                                        <Button size="lg" variant="outline" className="font-bold">
                                            Ver Planos de Locação
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="container max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-3xl rounded-full -mr-20 -mt-10"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Sparkles className="h-10 w-10" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                                Precisa de um Pacote Personalizado?
                            </h2>
                            <p className="text-lg opacity-90 max-w-2xl mx-auto">
                                Nossa equipe pode criar uma combinação exclusiva de equipamentos para atender
                                às necessidades específicas do seu projeto com condições especiais.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="font-black"
                                    onClick={() => window.open('https://wa.me/5519999999999?text=Olá! Gostaria de criar um pacote personalizado', '_blank')}
                                >
                                    Solicitar Pacote Customizado
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
