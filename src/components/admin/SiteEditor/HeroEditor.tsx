import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X } from 'lucide-react';
import { useSiteContent, useUpdateSiteContent } from '@/hooks/useSiteContent';
import {
    DEFAULT_HOME_HERO,
    DEFAULT_PLANS_HERO,
    DEFAULT_PACKAGES_HERO,
    DEFAULT_LOYALTY_HERO
} from '@/lib/defaultContent';

interface HeroEditorProps {
    section: 'home_hero' | 'plans_hero' | 'packages_hero' | 'loyalty_hero';
    includeFeatures?: boolean;
}

export function HeroEditor({ section, includeFeatures = true }: HeroEditorProps) {
    const defaultData = {
        home_hero: DEFAULT_HOME_HERO,
        plans_hero: DEFAULT_PLANS_HERO,
        packages_hero: DEFAULT_PACKAGES_HERO,
        loyalty_hero: DEFAULT_LOYALTY_HERO
    }[section];

    const { content, isLoading: contentLoading } = useSiteContent(section, defaultData);
    const updateMutation = useUpdateSiteContent();

    const [formData, setFormData] = useState(content);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        setFormData(content);
    }, [content]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            const features = formData.features || [];
            handleChange('features', [...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        const features = [...(formData.features || [])];
        features.splice(index, 1);
        handleChange('features', features);
    };

    const handleSave = () => {
        updateMutation.mutate({
            section,
            data: formData
        });
    };

    if (contentLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Badge */}
            {formData.badge !== undefined && (
                <div className="space-y-2">
                    <Label htmlFor="badge">Badge/Tag</Label>
                    <Input
                        id="badge"
                        value={formData.badge || ''}
                        onChange={(e) => handleChange('badge', e.target.value)}
                        placeholder="Ex: Novidade 2026"
                        maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                        Pequeno texto que aparece acima do título principal
                    </p>
                </div>
            )}

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Título Principal</Label>
                <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Digite o título principal"
                    className="text-lg font-bold"
                    maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                    {formData.title?.length || 0}/100 caracteres
                </p>
            </div>

            {/* Subtitle */}
            {formData.subtitle !== undefined && (
                <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo/Descrição</Label>
                    <Textarea
                        id="subtitle"
                        value={formData.subtitle || ''}
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        placeholder="Digite a descrição que aparecerá abaixo do título"
                        rows={3}
                        maxLength={250}
                    />
                    <p className="text-xs text-muted-foreground">
                        {formData.subtitle?.length || 0}/250 caracteres
                    </p>
                </div>
            )}

            {/* CTA Button */}
            {formData.ctaText !== undefined && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ctaText">Texto do Botão</Label>
                        <Input
                            id="ctaText"
                            value={formData.ctaText || ''}
                            onChange={(e) => handleChange('ctaText', e.target.value)}
                            placeholder="Ex: Explorar Catálogo"
                            maxLength={30}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ctaLink">Link do Botão</Label>
                        <Input
                            id="ctaLink"
                            value={formData.ctaLink || ''}
                            onChange={(e) => handleChange('ctaLink', e.target.value)}
                            placeholder="Ex: / ou /planos"
                        />
                    </div>
                </div>
            )}

            {/* Features */}
            {includeFeatures && formData.features !== undefined && (
                <div className="space-y-4">
                    <Label>Features/Destaques</Label>
                    <div className="flex flex-wrap gap-2">
                        {formData.features?.map((feature: string, index: number) => (
                            <Badge key={index} variant="secondary" className="gap-2 pr-1">
                                {feature}
                                <button
                                    onClick={() => handleRemoveFeature(index)}
                                    className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Nova feature (Ex: Entrega Rápida)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFeature();
                                }
                            }}
                            maxLength={40}
                        />
                        <Button type="button" onClick={handleAddFeature} variant="outline">
                            Adicionar
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pequenos destaques que aparecem em badges/pills
                    </p>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
                <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    size="lg"
                    className="gap-2"
                >
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
