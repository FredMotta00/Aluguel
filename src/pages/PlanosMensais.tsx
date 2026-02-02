import { useState } from 'react';
import { Calendar, Check, Shield, Clock, Headphones, ChevronRight, Zap, TrendingUp, Building2, Star, Briefcase, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const PlanosMensais = () => {
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profissional' | 'empresarial'>('profissional');
  const navigate = useNavigate();

  // Plan types configuration
  const planTypes = [
    {
      id: 'basico',
      name: 'Plano Básico',
      icon: Zap,
      badge: 'Popular',
      badgeColor: 'bg-blue-500',
      description: 'Ideal para pequenas empresas e projetos pontuais',
      price: 'Sob Consulta',
      period: 'por período',
      color: 'from-blue-900 via-blue-800 to-slate-900',
      features: [
        'Locação a partir de 7 dias',
        'Até 2 equipamentos simultâneos',
        'Desconto de 10% sobre diária',
        'Suporte técnico por email',
        'Retirada na sede',
        'Manual de operação digital'
      ],
      highlight: false
    },
    {
      id: 'profissional',
      name: 'Plano Profissional',
      icon: TrendingUp,
      badge: 'Mais Escolhido',
      badgeColor: 'bg-primary',
      description: 'Para profissionais que precisam de equipamentos regularmente',
      price: 'Sob Consulta',
      period: 'mensal',
      color: 'from-primary/90 via-primary/80 to-blue-900',
      features: [
        'Locação mensal (mínimo 30 dias)',
        'Até 5 equipamentos simultâneos',
        'Desconto de 25% sobre diária',
        'Suporte técnico prioritário 24/7',
        'Entrega e retirada incluídas',
        'Manutenção preventiva inclusa',
        'Treinamento operacional gratuito',
        'Relatórios técnicos mensais'
      ],
      highlight: true
    },
    {
      id: 'empresarial',
      name: 'Plano Empresarial',
      icon: Building2,
      badge: 'Customizado',
      badgeColor: 'bg-amber-500',
      description: 'Soluções sob medida para grandes empresas e contratos de longo prazo',
      price: 'Personalizado',
      period: 'anual',
      color: 'from-amber-900 via-orange-800 to-slate-900',
      features: [
        'Locação de longo prazo (12+ meses)',
        'Equipamentos ilimitados',
        'Desconto de até 40% sobre diária',
        'Gerente de conta dedicado',
        'SLA personalizado com garantias',
        'Entrega e logística dedicada',
        'Treinamento completo da equipe',
        'Consultoria técnica especializada',
        'Pool de equipamentos reservados',
        'Faturamento personalizado'
      ],
      highlight: false
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Equipamentos Certificados',
      description: 'Todos calibrados com certificação RBC válida',
    },
    {
      icon: Clock,
      title: 'Disponibilidade Garantida',
      description: 'Equipamentos reservados para você',
    },
    {
      icon: Headphones,
      title: 'Suporte Especializado',
      description: 'Time técnico sempre disponível',
    },
    {
      icon: Star,
      title: 'Flexibilidade',
      description: 'Troca de equipamentos durante o contrato',
    },
  ];

  const handleContactSales = (planId: string) => {
    // Navigate to contact or open WhatsApp
    window.open(`https://wa.me/5519999999999?text=Olá! Gostaria de saber mais sobre o ${planTypes.find(p => p.id === planId)?.name}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Briefcase className="h-3 w-3 mr-1" />
              Soluções Corporativas
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">
              Planos de Locação
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              Escolha o plano ideal para suas necessidades. Do básico ao empresarial,
              temos a solução perfeita para seu projeto.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Check className="h-5 w-5" />
                <span>Descontos progressivos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Check className="h-5 w-5" />
                <span>Sem taxas ocultas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Check className="h-5 w-5" />
                <span>Suporte incluso</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Escolha Seu Plano</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todos os planos incluem equipamentos certificados, suporte técnico e flexibilidade para trocar equipamentos
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {planTypes.map((plan) => {
              const PlanIcon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden ${plan.highlight
                      ? 'border-primary shadow-2xl scale-105 md:scale-110'
                      : 'border-border/50 hover:border-primary/50'
                    } transition-all duration-300 cursor-pointer group`}
                  onClick={() => setSelectedPlan(plan.id as any)}
                >
                  {/* Highlight Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`${plan.badgeColor} text-white text-xs font-black px-4 py-1.5 uppercase tracking-wider shadow-lg`}>
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                        <PlanIcon className="h-7 w-7 text-white" />
                      </div>
                      {!plan.highlight && (
                        <Badge variant="outline" className={`${plan.badgeColor} text-white border-none`}>
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* Pricing */}
                    <div>
                      <div className="text-4xl font-black text-foreground">
                        {plan.price}
                      </div>
                      <div className="text-sm text-muted-foreground">{plan.period}</div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative z-10">
                    <Button
                      className="w-full font-bold"
                      variant={plan.highlight ? 'default' : 'outline'}
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactSales(plan.id);
                      }}
                    >
                      Solicitar Orçamento
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por Que Escolher Nossos Planos?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vantagens exclusivas em todos os planos de locação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const BenefitIcon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8 pb-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <BenefitIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-3xl rounded-full -mr-20 -mt-10"></div>
            <CardContent className="p-8 md:p-12 relative z-10 text-center">
              <Users className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
                Precisa de um Plano Personalizado?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Nossa equipe pode criar uma solução sob medida para atender às necessidades específicas
                da sua empresa. Entre em contato e descubra como podemos ajudar.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-bold"
                  onClick={() => window.open('https://wa.me/5519999999999?text=Olá! Gostaria de um plano personalizado', '_blank')}
                >
                  <Headphones className="h-5 w-5 mr-2" />
                  Falar com Especialista
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={() => navigate('/')}
                >
                  Ver Equipamentos
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PlanosMensais;
