import { useQuery } from '@tanstack/react-query'
import type { PageParams } from '@/lib/api/types'
import {auditApi} from './api'
import { documentsApi } from './api'
import type {AuditTransactionFilters, DocumentSearchFilters} from './types'
import {useEffect, useState} from "react";

export const documentKeys = {
    all: ['documents'] as const,
    queue: () => [...documentKeys.all, 'queue'] as const,
    detail: (id: number) => [...documentKeys.all, 'detail', id] as const,
    search: (params: PageParams & DocumentSearchFilters) => [...documentKeys.all, 'search', params] as const,
    mine: () => [...documentKeys.all, 'mine'] as const,
    preview: (id: number) => [...documentKeys.all, 'preview', id] as const,
}

export function useMyQueue() {
    return useQuery({ queryKey: documentKeys.queue(), queryFn: documentsApi.getMyQueue })
}

export function useDocument(documentId: number) {
    return useQuery({
        queryKey: documentKeys.detail(documentId),
        queryFn: () => documentsApi.getById(documentId),
    })
}

export function useMySubmissions() {
    return useQuery({ queryKey: documentKeys.mine(), queryFn: documentsApi.getMine })
}

export function useDocumentSearch(params: PageParams & DocumentSearchFilters) {
    return useQuery({ queryKey: documentKeys.search(params), queryFn: () => documentsApi.search(params) })
}

export function useAuditDocumentSearch(params: PageParams & DocumentSearchFilters) {
    return useQuery({ queryKey: ['audit', 'documents', params], queryFn: () => auditApi.searchDocuments(params) })
}

export function useAuditTransactionSearch(params: PageParams & AuditTransactionFilters) {
    return useQuery({ queryKey: ['audit', 'transactions', params], queryFn: () => auditApi.searchTransactions(params) })
}

export function usePdfPreview(documentId: number) {
    const query = useQuery({
        queryKey: documentKeys.preview(documentId),
        queryFn: () => documentsApi.downloadFile(documentId),
        staleTime: 5 * 60_000,
        gcTime: 60_000, // don't keep large blobs around once the preview is closed
        meta: { silent: true }, // the preview shows its own inline error
    })

    const blob = query.data?.blob
    // Trust the Content-Type the server derived from the stored file, not the client-supplied name.
    const isPdf = Boolean(blob?.type.startsWith('application/pdf'))
    const [url, setUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!blob || !isPdf) {
            setUrl(null)
            return
        }
        // Re-wrap with an explicit type so what the iframe renders never depends on a header we didn't set.
        const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [blob, isPdf])

    return { ...query, url, isPdf }
}
