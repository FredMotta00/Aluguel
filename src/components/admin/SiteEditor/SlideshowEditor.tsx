import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Plus, Edit, Trash2, GripVertical, Eye } from 'lucide-react';
import { useSiteContent, useUpdateSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_SLIDESHOW } from '@/lib/defaultContent';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Slide {
    id: string;
    badge: { icon: string; text: string; color: string };
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    gradient: string;
    order: number;
    hasLogo?: boolean;
}

const iconOptions = [
    { value: 'Zap', label: '⚡ Zap (Raio)' },
    { value: 'TrendingUp', label: '📈 TrendingUp (Crescimento)' },
    { value: 'Package', label: '📦 Package (Pacote)' },
    { value: 'GraduationCap', label: '🎓 GraduationCap (Formatura)' },
    { value: 'Star', label: '⭐ Star (Estrela)' },
    { value: 'Gift', label: '🎁 Gift (Presente)' },
];

const gradientOptions = [
    { value: 'from-purple-900 via-purple-800 to-slate-900', label: 'Roxo' },
    { value: 'from-blue-900 via-blue-800 to-slate-900', label: 'Azul' },
    { value: 'from-amber-900 via-orange-800 to-slate-900', label: 'Âmbar/Laranja' },
    { value: 'from-slate-900 via-slate-800 to-black', label: 'Cinza Escuro' },
    { value: 'from-green-900 via-green-800 to-slate-900', label: 'Verde' },
    { value: 'from-red-900 via-red-800 to-slate-900', label: 'Vermelho' },
];

export function SlideshowEditor() {
    const { content, isLoading: contentLoading } = useSiteContent('slideshow', DEFAULT_SLIDESHOW);
    const updateMutation = useUpdateSiteContent();

    const [slides, setSlides] = useState<Slide[]>([]);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (content.slides) {
            setSlides(content.slides);
        }
    }, [content]);

    const handleSaveSlides = () => {
        updateMutation.mutate({
            section: 'slideshow',
            data: { slides }
        });
    };

    const handleEditSlide = (slide: Slide) => {
        setEditingSlide({ ...slide });
        setIsDialogOpen(true);
    };

    const handleNewSlide = () => {
        const newSlide: Slide = {
            id: String(Date.now()),
            badge: { icon: 'Star', text: 'Novo Slide', color: 'bg-primary/20 text-primary' },
            title: 'Título do Slide',
            description: 'Descrição do slide',
            buttonText: 'Saiba Mais',
            buttonLink: '/',
            gradient: 'from-blue-900 via-blue-800 to-slate-900',
            order: slides.length + 1
        };
        setEditingSlide(newSlide);
        setIsDialogOpen(true);
    };

    const handleSaveSlide = () => {
        if (!editingSlide) return;

        const existingIndex = slides.findIndex(s => s.id === editingSlide.id);
        if (existingIndex >= 0) {
            // Update existing
            const newSlides = [...slides];
            newSlides[existingIndex] = editingSlide;
            setSlides(newSlides);
        } else {
            // Add new
            setSlides([...slides, editingSlide]);
        }
        setIsDialogOpen(false);
        setEditingSlide(null);
    };

    const handleDeleteSlide = (id: string) => {
        if (confirm('Tem certeza que deseja deletar este slide?')) {
            setSlides(slides.filter(s => s.id !== id));
        }
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        const newSlides = [...slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

        // Update order numbers
        newSlides.forEach((slide, idx) => {
            slide.order = idx + 1;
        });

        setSlides(newSlides);
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
            {/* Slides List */}
            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <Card key={slide.id} className="relative">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSlide(index, 'up')}
                                        disabled={index === 0}
                                        className="h-6 w-6 p-0"
                                    >
                                        ↑
                                    </Button>
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSlide(index, 'down')}
                                        disabled={index === slides.length - 1}
                                        className="h-6 w-6 p-0"
                                    >
                                        ↓
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-muted-foreground">#{slide.order}</span>
                                        <Badge variant="secondary">{slide.badge.text}</Badge>
                                    </div>
                                    <h3 className="font-bold text-lg">{slide.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{slide.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>btn: {slide.buttonText}</span>
                                        <span>→</span>
                                        <span>{slide.buttonLink}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditSlide(slide)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteSlide(slide.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
                <Button onClick={handleNewSlide} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Slide
                </Button>
                <Button
                    onClick={handleSaveSlides}
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
                            Salvar Todas as Alterações
                        </>
                    )}
                </Button>
            </div>

            {/* Edit Slide Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSlide?.id && slides.find(s => s.id === editingSlide.id) ? 'Editar Slide' : 'Novo Slide'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo para configurar o slide
                        </DialogDescription>
                    </DialogHeader>

                    {editingSlide && (
                        <div className="space-y-4 py-4">
                            {/* Badge Text */}
                            <div className="space-y-2">
                                <Label>Texto do Badge</Label>
                                <Input
                                    value={editingSlide.badge.text}
                                    onChange={(e) => setEditingSlide({
                                        ...editingSlide,
                                        badge: { ...editingSlide.badge, text: e.target.value }
                                    })}
                                    placeholder="Ex: Novidade"
                                />
                            </div>

                            {/* Badge Icon */}
                            <div className="space-y-2">
                                <Label>Ícone do Badge</Label>
                                <Select
                                    value={editingSlide.badge.icon}
                                    onValueChange={(value) => setEditingSlide({
                                        ...editingSlide,
                                        badge: { ...editingSlide.badge, icon: value }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map(icon => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input
                                    value={editingSlide.title}
                                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                    placeholder="Título do slide"
                                    className="text-lg font-bold"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    value={editingSlide.description}
                                    onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                                    placeholder="Descrição do slide"
                                    rows={3}
                                />
                            </div>

                            {/* Button */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Texto do Botão</Label>
                                    <Input
                                        value={editingSlide.buttonText}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                                        placeholder="Ex: Saiba Mais"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link do Botão</Label>
                                    <Input
                                        value={editingSlide.buttonLink}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, buttonLink: e.target.value })}
                                        placeholder="Ex: /planos"
                                    />
                                </div>
                            </div>

                            {/* Gradient */}
                            <div className="space-y-2">
                                <Label>Cor do Gradiente</Label>
                                <Select
                                    value={editingSlide.gradient}
                                    onValueChange={(value) => setEditingSlide({ ...editingSlide, gradient: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradientOptions.map(grad => (
                                            <SelectItem key={grad.value} value={grad.value}>
                                                {grad.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveSlide}>
                                    Salvar Slide
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
