import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * AdminRoute component - Requires admin authentication
 * Redirects to /auth if not authenticated
 * Shows access denied if authenticated but not admin
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, loading, isAdmin, adminLoading } = useAuth();

    // Show loading while checking authentication and admin status
    if (loading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated - redirect to auth
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Authenticated but not admin - show access denied
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
                <Card className="w-full max-w-md shadow-xl border-border/50">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <ShieldX className="h-8 w-8 text-destructive" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Acesso Negado</CardTitle>
                            <CardDescription className="mt-2">
                                Você não tem permissão para acessar esta área.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Esta área é restrita a administradores do sistema.
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => window.location.href = '/'}
                        >
                            Voltar para Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User is authenticated and is admin - allow access
    return <>{children}</>;
};
