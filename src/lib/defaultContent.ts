// Default content for all editable sections
// Used as fallback when Firestore data is not available

export const DEFAULT_HOME_HERO = {
    badge: 'Excelência em Locação',
    title: 'Locação Profissional de Equipamentos Elétricos',
    subtitle: 'Equipamentos calibrados e certificados RBC. Alugue com segurança e economia para seus projetos de manutenção e testes.',
    ctaText: 'Explorar Catálogo',
    ctaLink: '/',
    features: [
        'Entrega Rápida em SP',
        'Suporte Técnico 24/7',
        'Melhor Custo-Benefício'
    ]
};

export const DEFAULT_SLIDESHOW = {
    slides: [
        {
            id: '1',
            badge: { icon: 'Zap', text: 'Novidade no Catálogo', color: 'bg-purple-500/20 text-purple-400' },
            title: 'Novos Equipamentos de Testes Elétricos',
            description: 'Ampliamos nosso catálogo com os mais modernos equipamentos para testes elétricos. CMC, Sverker e muito mais!',
            buttonText: 'Conhecer Equipamentos',
            buttonLink: '/',
            gradient: 'from-purple-900 via-purple-800 to-slate-900',
            order: 1
        },
        {
            id: '2',
            badge: { icon: 'TrendingUp', text: 'Planos Empresariais', color: 'bg-blue-500/20 text-blue-400' },
            title: 'Planos de Locação Customizados',
            description: 'Precisa de equipamentos com frequência? Confira nossos planos empresariais com descontos especiais e condições exclusivas.',
            buttonText: 'Ver Planos',
            buttonLink: '/planos',
            gradient: 'from-blue-900 via-blue-800 to-slate-900',
            order: 2
        },
        {
            id: '3',
            badge: { icon: 'Package', text: 'Pacotes Exclusivos', color: 'bg-amber-500/20 text-amber-400' },
            title: 'Pacotes de Locação com Desconto',
            description: 'Combine equipamentos e economize! Pacotes especiais com até 20% de desconto para locações de múltiplos equipamentos.',
            buttonText: 'Ver Pacotes',
            buttonLink: '/pacotes',
            gradient: 'from-amber-900 via-orange-800 to-slate-900',
            order: 3
        },
        {
            id: '4',
            badge: { icon: 'GraduationCap', text: 'Educação Técnica', color: 'bg-slate-500/20 text-slate-300' },
            title: 'Cursos Instituto SPCS',
            description: 'Capacitação profissional em proteção de sistemas elétricos. Cursos certificados e reconhecidos nacionalmente.',
            buttonText: 'Conhecer Cursos',
            buttonLink: 'https://institutospcs.com.br',
            gradient: 'from-slate-900 via-slate-800 to-black',
            order: 4,
            hasLogo: true
        }
    ]
};

export const DEFAULT_PLANS_HERO = {
    badge: 'Soluções Corporativas',
    title: 'Planos de Locação',
    subtitle: 'Escolha o plano ideal para suas necessidades. Do básico ao empresarial, temos a solução perfeita para seu projeto.',
    features: [
        'Descontos progressivos',
        'Sem taxas ocultas',
        'Suporte incluso'
    ]
};

export const DEFAULT_PACKAGES_HERO = {
    badge: 'Combos Especiais',
    title: 'Pacotes e Combos',
    subtitle: 'Economize até 30% com nossas combinações especiais de equipamentos. Pacotes criados para maximizar seu investimento.',
    features: [
        'Até 30% OFF',
        'Combos Prontos',
        'Suporte Incluso'
    ]
};

export const DEFAULT_LOYALTY_HERO = {
    title: 'Programa de Fidelidade',
    subtitle: 'Sua parceria com a EXS é recompensada. Descubra como ganhar benefícios exclusivos a cada locação.'
};

export const DEFAULT_SITE_SETTINGS = {
    companyName: 'EXS Locação de Equipamentos',
    phone: '(19) 99999-9999',
    whatsapp: '5519999999999',
    email: 'contato@exs.com.br',
    address: 'R. Antônio Gonzáles Vasques, 126 - Bosque da Saude, Americana - SP',
    socialMedia: {
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: ''
    }
};
