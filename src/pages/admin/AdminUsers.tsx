import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, UserPlus, Trash2, Shield, Users } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Admin {
    email: string;
    name?: string;
    role: string;
    createdAt?: any;
    source?: string;
}

export default function AdminUsers() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // Form state
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const adminsRef = collection(db, 'admins');
            const snapshot = await getDocs(adminsRef);
            const adminsList: Admin[] = [];

            snapshot.forEach((doc) => {
                adminsList.push({ ...doc.data() as Admin, email: doc.id });
            });

            // Sort by email
            adminsList.sort((a, b) => a.email.localeCompare(b.email));
            setAdmins(adminsList);
        } catch (error) {
            console.error('Error loading admins:', error);
            toast.error('Erro ao carregar administradores');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEmail.trim()) {
            toast.error('Email é obrigatório');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error('Email inválido');
            return;
        }

        setAddingAdmin(true);

        try {
            const adminData: Admin = {
                email: newEmail.toLowerCase().trim(),
                name: newName.trim() || newEmail.split('@')[0],
                role: 'admin',
                createdAt: new Date(),
                source: 'EXS_Locacoes'
            };

            await setDoc(doc(db, 'admins', adminData.email), adminData);

            toast.success('Administrador adicionado com sucesso!');
            setNewEmail('');
            setNewName('');
            await loadAdmins();
        } catch (error: any) {
            console.error('Error adding admin:', error);
            toast.error('Erro ao adicionar administrador: ' + error.message);
        } finally {
            setAddingAdmin(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!deleteTarget) return;

        try {
            await deleteDoc(doc(db, 'admins', deleteTarget));
            toast.success('Administrador removido com sucesso!');
            await loadAdmins();
        } catch (error: any) {
            console.error('Error deleting admin:', error);
            toast.error('Erro ao remover administrador: ' + error.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Administradores</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie os usuários com acesso administrativo à plataforma
                </p>
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                Administradores Compartilhados
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Esta coleção é compartilhada com o <strong>Gpecx Flow (BOS)</strong>. Qualquer admin adicionado aqui
                                terá acesso administrativo em <strong>ambas as plataformas</strong>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total de Admins
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{admins.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Gpecx Flow
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {admins.filter(a => a.source === 'GPECX_Flow' || a.source === 'BOS').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            EXS Locação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {admins.filter(a => a.source === 'EXS_Locacoes').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Admin Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Adicionar Administrador
                    </CardTitle>
                    <CardDescription>
                        Adicione um novo usuário com permissões administrativas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@exemplo.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome (opcional)</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Nome do Administrador"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={addingAdmin} className="gap-2">
                            {addingAdmin ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adicionando...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Adicionar Admin
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Admins List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Administradores Cadastrados
                    </CardTitle>
                    <CardDescription>
                        {admins.length} administrador(es) com acesso ao sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {admins.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum administrador cadastrado
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {admins.map((admin) => (
                                <div
                                    key={admin.email}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{admin.name || admin.email}</div>
                                            <div className="text-sm text-muted-foreground">{admin.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {admin.source && (
                                            <Badge variant={admin.source === 'GPECX_Flow' || admin.source === 'BOS' ? 'default' : 'secondary'}>
                                                {admin.source === 'EXS_Locacoes' ? 'EXS Locação' : 'Gpecx Flow'}
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTarget(admin.email)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Administrador?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{deleteTarget}</strong> dos administradores?
                            <br /><br />
                            ⚠️ <strong>Esta ação afetará ambas as plataformas</strong> (Gpecx Flow e EXS Locação).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAdmin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
