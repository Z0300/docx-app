import { useQuery } from '@tanstack/react-query'
import type { PageParams } from '@/lib/api/types'
import {auditApi} from './api'
import { documentsApi } from './api'
import type {AuditTransactionFilters, DocumentSearchFilters} from './types'

export const documentKeys = {
    all: ['documents'] as const,
    queue: () => [...documentKeys.all, 'queue'] as const,
    detail: (id: number) => [...documentKeys.all, 'detail', id] as const,
    search: (params: PageParams & DocumentSearchFilters) => [...documentKeys.all, 'search', params] as const,
    mine: () => [...documentKeys.all, 'mine'] as const,
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
