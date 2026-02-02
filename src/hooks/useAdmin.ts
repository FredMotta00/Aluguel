import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to check if current user is an admin
 * @returns {isAdmin: boolean, adminLoading: boolean}
 */
export const useAdmin = () => {
    const { isAdmin, adminLoading } = useAuth();
    return { isAdmin, adminLoading };
};
