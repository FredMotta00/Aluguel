import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute component - Requires user authentication
 * Redirects to /auth if user is not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // Redirect to auth page but save the location they were trying to access
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
