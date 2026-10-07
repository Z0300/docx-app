import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PageParams } from '@/lib/api/types'
import { toast } from '@/stores/toastStore'
import {auditApi, type CreateDocumentPayload} from './api'
import { documentsApi } from './api'
import type { ApplyActionInput, CancelDocumentInput, ResubmitInput } from './schema'
import type {AuditTransactionFilters, DocumentSearchFilters} from './types'
import {useState} from "react";

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


export function useCreateDocument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateDocumentPayload) => documentsApi.create(input),
        meta: { successMessage: 'Document submitted' },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
    })
}

/** Covers approve / reject / refer-return / refer-approve / refer-abstain — one action, one endpoint. */
export function useApplyAction(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: ApplyActionInput) => documentsApi.applyAction(documentId, input),
        onSuccess: (result) => {
            toast.success(`Action recorded — status is now ${result.newStatus}`)
            void queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) })
            void queryClient.invalidateQueries({ queryKey: documentKeys.queue() })
        },
    })
}

export function useResubmitDocument(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: ResubmitInput) => documentsApi.resubmit(documentId, input),
        meta: { successMessage: 'Document resubmitted for review' },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) })
            void queryClient.invalidateQueries({ queryKey: documentKeys.queue() })
        },
    })
}

export function useCancelDocument(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CancelDocumentInput) => documentsApi.cancel(documentId, input),
        meta: { successMessage: 'Document cancelled' },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) })
            void queryClient.invalidateQueries({ queryKey: documentKeys.queue() })
        },
    })
}

export function useUploadFile() {
    const [progress, setProgress] = useState(0)
    const mutation = useMutation({
        mutationFn: (file: File) => documentsApi.uploadFile(file, setProgress),
        meta: { silent: true },
        onMutate: () => setProgress(0),
    })
    return { ...mutation, progress }
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
