import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export const PromoBanner = () => {
    return (
        <section className="py-8 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950 via-blue-950 to-slate-950 shadow-2xl border border-white/10 group">

                    {/* Animated Background Effects */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">

                        {/* Text Content */}
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3 h-3 text-yellow-400" />
                                Novidade no Catálogo
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                Potencialize seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Testes Elétricos</span>
                            </h2>

                            <p className="text-lg text-blue-100/80 max-w-xl leading-relaxed">
                                Confira nossa nova linha de equipamentos de alta precisão disponíveis para locação imediata com condições especiais para contratos mensais.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                            <Button size="lg" className="relative h-14 px-8 text-lg bg-white text-blue-950 hover:bg-blue-50 font-bold border-none shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95">
                                <Zap className="w-5 h-5 mr-2 fill-blue-600 text-blue-600" />
                                Ver Ofertas
                                <ArrowRight className="w-5 h-5 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};
