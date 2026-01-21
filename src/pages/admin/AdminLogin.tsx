import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { checkIsAdmin } from '@/lib/adminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import logoExs from '@/assets/logo-exs-new.png';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);

    // Check if already logged in AND is admin
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email) {
                // Check if user is admin
                const isAdmin = await checkIsAdmin(user.email);
                if (isAdmin) {
                    navigate('/admin');
                } else {
                    // Logged in but not admin - show access denied
                    setAccessDenied(true);
                    setCheckingAuth(false);
                }
            } else {
                setCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAccessDenied(false);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userEmail = userCredential.user.email;

            // Check if user is admin
            const isAdmin = await checkIsAdmin(userEmail);

            if (isAdmin) {
                toast.success('Admin: Acesso concedido');
                navigate('/admin');
            } else {
                // Not an admin - sign out and show error
                await signOut(auth);
                setAccessDenied(true);
                toast.error('Acesso negado. Você não tem permissão de administrador.');
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Credenciais inválidas.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutAndRetry = async () => {
        await signOut(auth);
        setAccessDenied(false);
        setEmail('');
        setPassword('');
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm shadow-xl border-border/50">
                <CardHeader className="text-center space-y-4">
                    <img src={logoExs} alt="EXS Solutions" className="h-16 mx-auto" />
                    <div>
                        <CardTitle className="text-xl flex items-center justify-center gap-2">
                            {accessDenied ? (
                                <>
                                    <ShieldX className="h-5 w-5 text-destructive" />
                                    Acesso Negado
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Painel Administrativo
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {accessDenied
                                ? 'Você não tem permissão de administrador'
                                : 'Acesso restrito a gerenciadores'
                            }
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {accessDenied ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Esta conta ({auth.currentUser?.email}) não está cadastrada como administrador.
                            </p>
                            <Button onClick={handleLogoutAndRetry} variant="outline" className="w-full">
                                Tentar com outra conta
                            </Button>
                            <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
                                Voltar ao site
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@exs.com.br"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </Button>

                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
