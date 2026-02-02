import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AdminDebug() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminDocExists, setAdminDocExists] = useState(false);
    const [adminData, setAdminData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserEmail(user.email);
                setUserId(user.uid);

                // Check if admin document exists
                try {
                    const adminDocRef = doc(db, 'admins', user.email || '');
                    const adminDoc = await getDoc(adminDocRef);
                    setAdminDocExists(adminDoc.exists());
                    if (adminDoc.exists()) {
                        setAdminData(adminDoc.data());
                    }
                } catch (error) {
                    console.error('Error checking admin:', error);
                }
            } else {
                setUserEmail(null);
                setUserId(null);
                setAdminDocExists(false);
                setAdminData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Card className="mt-4 border-blue-500">
                <CardContent className="pt-6 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                </CardContent>
            </Card>
        );
    }

    if (!userEmail) {
        return (
            <Card className="mt-4 border-orange-500">
                <CardHeader>
                    <CardTitle className="text-sm">🔍 Debug: Você não está logado</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="mt-4 border-blue-500">
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    🔍 Debug de Administrador
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                    <div className="font-semibold text-muted-foreground">Email Logado:</div>
                    <div className="font-mono bg-muted p-2 rounded">{userEmail}</div>
                </div>

                <div>
                    <div className="font-semibold text-muted-foreground">UID:</div>
                    <div className="font-mono bg-muted p-2 rounded text-xs">{userId}</div>
                </div>

                <div>
                    <div className="font-semibold text-muted-foreground">Documento Admin no Firestore:</div>
                    <div className="flex items-center gap-2 mt-1">
                        {adminDocExists ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <Badge variant="default">Encontrado em admins/{userEmail}</Badge>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-red-500" />
                                <Badge variant="destructive">NÃO encontrado em admins/{userEmail}</Badge>
                            </>
                        )}
                    </div>
                </div>

                {adminDocExists && adminData && (
                    <div>
                        <div className="font-semibold text-muted-foreground">Dados do Admin:</div>
                        <pre className="font-mono bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(adminData, null, 2)}
                        </pre>
                    </div>
                )}

                {!adminDocExists && (
                    <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-3 rounded">
                        <p className="font-semibold text-orange-900 dark:text-orange-100">
                            ⚠️ Problema Identificado
                        </p>
                        <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                            Para ter acesso admin, você precisa criar um documento em:<br />
                            <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">
                                admins/{userEmail}
                            </code>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
