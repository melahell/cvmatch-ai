import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

interface Document {
    id: string;
    filename: string;
    file_type: string;
    created_at: string;
    extraction_status: string;
}

interface UseDocumentsReturn {
    data: Document[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    deleteDocument: (id: string) => Promise<boolean>;
}

/**
 * Custom hook to fetch and manage uploaded documents
 * Centralizes the documents fetching logic used across profile and upload pages
 * 
 * @param userId - The authenticated user's ID
 * @param limit - Optional limit for number of documents to fetch
 * @returns Documents with loading/error states and management functions
 * 
 * @example
 * ```tsx
 * const { data: documents, loading, deleteDocument } = useDocuments(userId, 5);
 * 
 * // Delete a document
 * const success = await deleteDocument(docId);
 * if (success) {
 *   // Document deleted and list refreshed
 * }
 * ```
 */
export function useDocuments(userId: string | null, limit?: number): UseDocumentsReturn {
    const [data, setData] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDocuments = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createSupabaseClient();
            let query = supabase
                .from("uploaded_documents")
                .select("id, filename, file_type, created_at, extraction_status")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data: docs, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            setData(docs || []);
            logger.debug('Documents fetched successfully', { count: docs?.length || 0 });
        } catch (e) {
            const errorObj = e as Error;
            logger.error('Error fetching documents:', errorObj);
            setError(errorObj);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, limit]);

    const deleteDocument = async (docId: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/documents/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete document");
            }

            // Refresh list after deletion
            await fetchDocuments();
            logger.debug('Document deleted', { id: docId });
            return true;
        } catch (e) {
            logger.error('Error deleting document:', e);
            setError(e as Error);
            return false;
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchDocuments,
        deleteDocument,
    };
}
