import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useSiteContent, useUpdateSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_SITE_SETTINGS } from '@/lib/defaultContent';

export function SettingsEditor() {
    const { content, isLoading: contentLoading } = useSiteContent('site_settings', DEFAULT_SITE_SETTINGS);
    const updateMutation = useUpdateSiteContent();

    const [formData, setFormData] = useState(content);

    useEffect(() => {
        setFormData(content);
    }, [content]);

    const handleChange = (field: string, value: any) => {
        if (field.includes('.')) {
            // Nested field (e.g., socialMedia.facebook)
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent] || {}),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => {
        updateMutation.mutate({
            section: 'site_settings',
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
        <div className="space-y-8">
            {/* Company Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Informações da Empresa</h3>

                <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                        id="companyName"
                        value={formData.companyName || ''}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        placeholder="EXS Locação de Equipamentos"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="(19) 99999-9999"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp (com DDI)</Label>
                        <Input
                            id="whatsapp"
                            value={formData.whatsapp || ''}
                            onChange={(e) => handleChange('whatsapp', e.target.value)}
                            placeholder="5519999999999"
                        />
                        <p className="text-xs text-muted-foreground">
                            Formato: 55 (país) + 19 (DDD) + número
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="contato@exs.com.br"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="R. Antônio Gonzáles Vasques, 126 - Bosque da Saude, Americana - SP"
                    />
                </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Redes Sociais</h3>
                <p className="text-sm text-muted-foreground">
                    Deixe em branco os campos que não deseja exibir
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook (URL completa)</Label>
                        <Input
                            id="facebook"
                            value={formData.socialMedia?.facebook || ''}
                            onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                            placeholder="https://facebook.com/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram (URL completa)</Label>
                        <Input
                            id="instagram"
                            value={formData.socialMedia?.instagram || ''}
                            onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                            placeholder="https://instagram.com/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn (URL completa)</Label>
                        <Input
                            id="linkedin"
                            value={formData.socialMedia?.linkedin || ''}
                            onChange={(e) => handleChange('socialMedia.linkedin', e.target.value)}
                            placeholder="https://linkedin.com/company/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube (URL completa)</Label>
                        <Input
                            id="youtube"
                            value={formData.socialMedia?.youtube || ''}
                            onChange={(e) => handleChange('socialMedia.youtube', e.target.value)}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                </div>
            </div>

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
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
