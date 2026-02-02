import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Sparkles, FileText, Settings, Clock } from 'lucide-react';
import { HeroEditor, SlideshowEditor, SettingsEditor } from '@/components/admin/SiteEditor';
import { useAllSiteContent } from '@/hooks/useSiteContent';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminSiteEditor() {
    const [activeTab, setActiveTab] = useState('home');
    const { sections, isLoading } = useAllSiteContent();

    const getLastUpdated = (sectionId: string) => {
        const section = sections.find(s => s?.id === sectionId);
        if (section?.updated_at) {
            try {
                const date = section.updated_at.toDate();
                return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
            } catch {
                return 'Nunca atualizado';
            }
        }
        return 'Nunca atualizado';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Editor do Site</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie todo o conteúdo dinâmico do site sem precisar editar código
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Home Hero</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">✓</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {getLastUpdated('home_hero')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Slideshow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {getLastUpdated('slideshow')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Páginas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Planos, Pacotes, Fidelidade
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Configurações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">✓</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {getLastUpdated('site_settings')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Editor Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="home" className="gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Home</span>
                    </TabsTrigger>
                    <TabsTrigger value="slideshow" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Slideshow</span>
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Páginas</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Configurações</span>
                    </TabsTrigger>
                </TabsList>

                {/* Home Tab */}
                <TabsContent value="home" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                Hero Section da Home
                            </CardTitle>
                            <CardDescription>
                                Edite o banner principal que aparece no topo da página inicial
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HeroEditor section="home_hero" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Slideshow Tab */}
                <TabsContent value="slideshow" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Slideshow Promocional
                            </CardTitle>
                            <CardDescription>
                                Gerencie os slides que aparecem na Home (adicionar, editar, deletar, reordenar)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SlideshowEditor />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pages Tab */}
                <TabsContent value="pages" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Hero - Página de Planos
                            </CardTitle>
                            <CardDescription>
                                Banner no topo da página /planos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HeroEditor section="plans_hero" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Hero - Página de Pacotes
                            </CardTitle>
                            <CardDescription>
                                Banner no topo da página /pacotes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HeroEditor section="packages_hero" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Hero - Programa de Fidelidade
                            </CardTitle>
                            <CardDescription>
                                Banner no topo da página /fidelidade
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HeroEditor section="loyalty_hero" includeFeatures={false} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Configurações do Site
                            </CardTitle>
                            <CardDescription>
                                Informações de contato e redes sociais exibidas no footer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsEditor />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Help Card */}
            <Card className="border-dashed bg-muted/30">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Alterações em Tempo Real</h3>
                            <p className="text-sm text-muted-foreground">
                                Todas as alterações feitas aqui são salvas no Firestore e refletidas automaticamente no site em até 5 minutos.
                                Se precisar ver as mudanças imediatamente, faça um refresh (F5) na página do site após salvar.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
