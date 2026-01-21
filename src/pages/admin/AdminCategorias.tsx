import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';

interface CategoriaForm {
    nome: string;
}

const initialForm: CategoriaForm = {
    nome: '',
};

export default function AdminCategorias() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CategoriaForm>(initialForm);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: categorias, isLoading } = useQuery({
        queryKey: ['admin-categorias'],
        queryFn: async () => {
            const querySnapshot = await getDocs(collection(db, 'categories'));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (data: CategoriaForm) => {
            const slug = data.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const payload = {
                nome: data.nome,
                slug: slug,
                updatedAt: new Date().toISOString()
            };

            if (editingId) {
                const docRef = doc(db, 'categories', editingId);
                await updateDoc(docRef, payload);
            } else {
                (payload as any).createdAt = new Date().toISOString();
                await addDoc(collection(db, 'categories'), payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categorias'] });
            toast({
                title: 'Sucesso',
                description: editingId ? 'Categoria atualizada' : 'Categoria criada',
            });
            closeDialog();
        },
        onError: (error: any) => {
            console.error(error);
            toast({
                title: 'Erro ao salvar',
                description: error.message || 'Erro inesperado.',
                variant: 'destructive',
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'categories', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categorias'] });
            toast({ title: 'Sucesso', description: 'Categoria removida' });
            setDeleteDialog({ open: false, id: '' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Erro ao remover.', variant: 'destructive' });
        }
    });

    const openEditDialog = (categoria: any) => {
        setEditingId(categoria.id);
        setForm({ nome: categoria.nome });
        setIsDialogOpen(true);
    };

    const openNewDialog = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome) {
            toast({ title: 'Erro', description: 'Preencha o nome da categoria', variant: 'destructive' });
            return;
        }
        saveMutation.mutate(form);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Categorias</h1>
                    <p className="text-slate-500">Gerencie as categorias de filtros do catálogo</p>
                </div>
                <Button onClick={openNewDialog} className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-lg">Categorias Atuais</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : categorias && categorias.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categorias.map((categoria) => (
                                        <TableRow key={categoria.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900">{categoria.nome}</TableCell>
                                            <TableCell className="text-slate-500">{categoria.slug}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                                                        onClick={() => openEditDialog(categoria)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => setDeleteDialog({ open: true, id: categoria.id })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <Tag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma categoria encontrada</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome da Categoria</Label>
                            <Input
                                id="nome"
                                value={form.nome}
                                onChange={(e) => setForm({ nome: e.target.value })}
                                placeholder="Ex: Analisadores de Energia"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover esta categoria? Isso não removerá os produtos vinculados, mas eles ficarão sem categoria.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteDialog.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
