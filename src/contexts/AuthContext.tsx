import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    adminLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    adminLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);

    // Check if user is admin in Firestore
    const checkAdminStatus = async (userEmail: string | null) => {
        try {
            setAdminLoading(true);
            if (!userEmail) {
                setIsAdmin(false);
                return;
            }
            const adminDoc = await getDoc(doc(db, "admins", userEmail));
            setIsAdmin(adminDoc.exists());
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
        } finally {
            setAdminLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // Check admin status when user is authenticated
                await checkAdminStatus(user.email);
            } else {
                // Reset admin status when user logs out
                setIsAdmin(false);
                setAdminLoading(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, adminLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

