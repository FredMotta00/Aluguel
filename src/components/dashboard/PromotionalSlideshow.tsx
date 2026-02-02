import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, GraduationCap, Package, CreditCard, Zap } from 'lucide-react';
import logoSpcs from '@/assets/logo-spcs.png';

const slides = [
    {
        id: 1,
        badge: { icon: Package, text: 'Novidade no Catálogo', color: 'bg-purple-500/20 text-purple-400' },
        title: 'Potencialize seus Testes Elétricos',
        description: 'Confira nossa nova linha de equipamentos de alta precisão disponíveis para locação imediata com condições especiais para contratos mensais.',
        buttonText: 'Ver Ofertas',
        buttonLink: '/',
        gradient: 'from-purple-900 via-purple-800 to-slate-900',
        accentColor: 'purple'
    },
    {
        id: 2,
        badge: { icon: CreditCard, text: 'Planos Empresariais', color: 'bg-blue-500/20 text-blue-400' },
        title: 'Planos Customizados para sua Empresa',
        description: 'Reduza custos com nossos planos mensais e anuais. Equipamentos de ponta com suporte técnico especializado e manutenção inclusa.',
        buttonText: 'Conhecer Planos',
        buttonLink: '/planos',
        gradient: 'from-blue-900 via-blue-800 to-slate-900',
        accentColor: 'blue'
    },
    {
        id: 3,
        badge: { icon: Zap, text: 'Pacotes Exclusivos', color: 'bg-amber-500/20 text-amber-400' },
        title: 'Pacotes de Locação com Desconto',
        description: 'Combine equipamentos e economize! Pacotes especiais com até 20% de desconto para locações de múltiplos equipamentos.',
        buttonText: 'Ver Pacotes',
        buttonLink: '/pacotes',
        gradient: 'from-amber-900 via-orange-800 to-slate-900',
        accentColor: 'amber'
    },
    {
        id: 4,
        badge: { icon: GraduationCap, text: 'Educação Técnica', color: 'bg-primary/20 text-primary' },
        title: 'Cursos do Instituto SPCS',
        description: 'Especialize sua equipe com os melhores treinamentos técnicos do mercado. Conheça nossa grade completa de cursos e certificações.',
        buttonText: 'Conhecer Cursos',
        buttonLink: '/cursos',
        gradient: 'from-slate-900 to-black',
        accentColor: 'primary',
        logo: logoSpcs
    }
];

export const PromotionalSlideshow = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-play effect - pauses when hovered
    useEffect(() => {
        console.log('🎠 Slideshow mounted - starting auto-play');

        // Don't auto-play if user is hovering
        if (isHovered) {
            console.log('⏸️ Auto-play paused - user hovering');
            return;
        }

        const timer = setInterval(() => {
            handleSlideChange((prev) => (prev + 1) % slides.length);
        }, 5000);

        // Cleanup on unmount or when hover state changes
        return () => {
            clearInterval(timer);
        };
    }, [isHovered]); // Re-run when hover state changes

    // Log whenever slide changes
    useEffect(() => {
        console.log(`📍 Current slide is now: ${currentSlide}`);
    }, [currentSlide]);

    // Handle slide change with animation
    const handleSlideChange = (newSlideOrFn: number | ((prev: number) => number)) => {
        setIsTransitioning(true);

        setTimeout(() => {
            if (typeof newSlideOrFn === 'function') {
                setCurrentSlide(newSlideOrFn);
            } else {
                setCurrentSlide(newSlideOrFn);
            }

            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300);
    };

    const nextSlide = () => {
        handleSlideChange((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        handleSlideChange((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        if (index !== currentSlide) {
            handleSlideChange(index);
        }
    };

    const slide = slides[currentSlide];
    const BadgeIcon = slide.badge.icon;

    return (
        <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            onMouseEnter={() => {
                console.log('🖱️ Mouse entered - pausing auto-play');
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                console.log('🖱️ Mouse left - resuming auto-play');
                setIsHovered(false);
            }}
        >
            {/* Main Card */}
            <Card className="rounded-2xl border-none overflow-hidden relative group">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700`}></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full -mr-20 -mt-10"></div>

                <CardContent className="p-0 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 min-h-[320px]">
                        {/* Logo Section (only for SPCS slide) */}
                        {slide.logo && (
                            <div className="w-full md:w-1/3 flex justify-center bg-white/5 p-8 border border-white/10 backdrop-blur-sm rounded-xl">
                                <img src={slide.logo} alt="Instituto SPCS" className="max-h-24 w-auto object-contain" />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className={`flex-1 space-y-6 text-center ${slide.logo ? 'md:text-left' : 'md:text-center'} pb-12 md:pb-0 transition-all duration-500 ${isTransitioning
                                ? 'opacity-0 translate-y-4'
                                : 'opacity-100 translate-y-0'
                                }`}
                            key={slide.id}
                        >
                            <div className={`inline-flex items-center gap-2 ${slide.badge.color} text-xs font-black px-4 py-1.5 uppercase tracking-widest rounded-full mb-2`}>
                                <BadgeIcon className="h-3.5 w-3.5" />
                                {slide.badge.text}
                            </div>
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                                {slide.title}
                            </h3>
                            <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                                {slide.description}
                            </p>
                            <Button
                                onClick={() => navigate(slide.buttonLink)}
                                className="rounded-xl font-bold gap-2 px-8 h-12 text-black bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mt-4"
                                size="lg"
                            >
                                {slide.buttonText} →
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Controls - Positioned outside card */}
            <div className="flex items-center justify-center gap-6 mt-6">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    className="h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-black transition-all"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2.5 rounded-full transition-all ${index === currentSlide
                                ? 'w-10 bg-primary'
                                : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    className="h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-black transition-all"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
