import { api } from '@/lib/api/request'
import type { PageParams } from '@/lib/api/types'
import type { ApplyActionInput, CancelDocumentInput, ResubmitInput } from './schema'
import type { AxiosProgressEvent } from 'axios'
import type {
    ApprovalActionResult, AuditTransaction, AuditTransactionFilters,
    DocumentDetail,
    DocumentQueueItem,
    DocumentResponse,
    DocumentSearchFilters,
    DocumentSummary,
    DocumentVersionResponse,
    FileUploadResponse
} from './types'

export interface CreateDocumentPayload {
    documentTitle: string
    fileName: string
    filePath: string
    changeComments?: string
    reviewerUserId: number
    approverUserIds: number[]
}

export const documentsApi = {
    create: (input: CreateDocumentPayload) => api.post<DocumentResponse, CreateDocumentPayload>('/documents', input),

    getById: (documentId: number) => api.get<DocumentDetail>(`/documents/${documentId}`),

    getMyQueue: () => api.get<DocumentQueueItem[]>('/documents/queue'),

    // Admin-only; GET /api/documents/search
    search: (params: PageParams & DocumentSearchFilters) =>
        api.getPage<DocumentSummary, DocumentSearchFilters>('/documents/search', params),

    applyAction: (documentId: number, input: ApplyActionInput) =>
        api.post<ApprovalActionResult, ApplyActionInput>(`/documents/${documentId}/approval-actions`, input),

    resubmit: (documentId: number, input: ResubmitInput) =>
        api.post<DocumentVersionResponse, ResubmitInput>(`/documents/${documentId}/resubmit`, input),

    cancel: (documentId: number, input: CancelDocumentInput) =>
        api.post<DocumentResponse, CancelDocumentInput>(`/documents/${documentId}/cancel`, input),

    uploadFile: (file: File, onProgress?: (percent: number) => void) => {
        const formData = new FormData()
        formData.append('file', file)

        return api.post<FileUploadResponse, FormData>('/documents/files', formData, {
            headers: { 'Content-Type': undefined },
            onUploadProgress: (event: AxiosProgressEvent) => {
                if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
            },
        })
    },

    getMine: () => api.get<DocumentSummary[]>('/documents/mine'),

}

export const auditApi = {
    searchDocuments: (params: PageParams & DocumentSearchFilters) =>
        api.getPage<DocumentSummary, DocumentSearchFilters>('/audit/documents', params),

    searchTransactions: (params: PageParams & AuditTransactionFilters) =>
        api.getPage<AuditTransaction, AuditTransactionFilters>('/audit/transactions', params),
}