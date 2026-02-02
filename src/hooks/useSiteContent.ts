import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export interface SiteContentData {
    id: string;
    section: string;
    enabled: boolean;
    data: Record<string, any>;
    updated_at?: any;
    updated_by?: string;
}

/**
 * Hook to fetch site content from Firestore
 * Falls back to default values if document doesn't exist
 */
export function useSiteContent(section: string, defaultData: Record<string, any> = {}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['site-content', section],
        queryFn: async () => {
            try {
                const docRef = doc(db, 'site_content', section);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    return docSnap.data() as SiteContentData;
                }

                // Return default data if document doesn't exist
                return {
                    id: section,
                    section,
                    enabled: true,
                    data: defaultData
                } as SiteContentData;
            } catch (err) {
                console.error(`Error fetching site content for ${section}:`, err);
                // Return default data on error
                return {
                    id: section,
                    section,
                    enabled: true,
                    data: defaultData
                } as SiteContentData;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    });

    return {
        content: data?.data || defaultData,
        isEnabled: data?.enabled ?? true,
        isLoading,
        error,
        fullData: data
    };
}

/**
 * Hook to update site content in Firestore
 */
export function useUpdateSiteContent() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({
            section,
            data,
            enabled = true
        }: {
            section: string;
            data: Record<string, any>;
            enabled?: boolean;
        }) => {
            const docRef = doc(db, 'site_content', section);

            const contentData: SiteContentData = {
                id: section,
                section,
                enabled,
                data,
                updated_at: serverTimestamp(),
                updated_by: 'admin' // TODO: Get from auth context
            };

            await setDoc(docRef, contentData, { merge: true });
            return contentData;
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['site-content', variables.section] });
            toast.success('Conteúdo atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Error updating site content:', error);
            toast.error('Erro ao atualizar conteúdo');
        }
    });

    return mutation;
}

/**
 * Hook to fetch all site content sections
 */
export function useAllSiteContent() {
    const sections = [
        'home_hero',
        'slideshow',
        'plans_hero',
        'packages_hero',
        'loyalty_hero',
        'site_settings'
    ];

    const queries = sections.map(section =>
        useQuery({
            queryKey: ['site-content', section],
            queryFn: async () => {
                const docRef = doc(db, 'site_content', section);
                const docSnap = await getDoc(docRef);
                return docSnap.exists() ? docSnap.data() as SiteContentData : null;
            }
        })
    );

    return {
        sections: queries.map(q => q.data).filter(Boolean),
        isLoading: queries.some(q => q.isLoading),
        error: queries.find(q => q.error)?.error
    };
}
