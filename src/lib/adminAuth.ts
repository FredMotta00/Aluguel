import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Check if a user email is registered as an admin in Firestore
 * The 'admins' collection should have documents with email as the document ID
 * Example: admins/admin@exs.com.br { email: "admin@exs.com.br", role: "admin", name: "Admin User" }
 */
export async function checkIsAdmin(email: string | null): Promise<boolean> {
    if (!email) return false;

    try {
        // Check if there's a document in 'admins' collection with this email as ID
        const adminDocRef = doc(db, 'admins', email);
        const adminDoc = await getDoc(adminDocRef);

        return adminDoc.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
