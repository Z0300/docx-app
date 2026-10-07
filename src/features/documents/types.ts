export const DOCUMENT_STATUSES = [
    'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'ABSTAINED', 'COMPLETED', 'CANCELLED',
] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

export const APPROVAL_ACTION_CODES = [
    'APPROVE', 'REJECT', 'REFER_RETURN', 'REFER_APPROVE', 'REFER_ABSTAIN',
] as const
export type ApprovalActionCode = (typeof APPROVAL_ACTION_CODES)[number]

export interface DocumentResponse {
    documentId: number
    documentNo: string
    documentTitle: string
    status: DocumentStatus
    currentStepId: number
    currentStepName: string
}

export interface ApprovalTransactionSummary {
    transactionId: number
    stepName: string
    actionCode: ApprovalActionCode
    actionByUserId: number
    actionDate: string
    comments: string | null
}

export interface DocumentDetail {
    documentId: number
    documentNo: string
    documentTitle: string
    status: DocumentStatus
    currentStepId: number | null
    currentStepName: string | null
    createdBy: number
    createdDate: string
    completedDate: string | null
    history: ApprovalTransactionSummary[]
}

export interface DocumentQueueItem {
    documentId: number
    documentNo: string
    documentTitle: string
    status: DocumentStatus
    currentStepName: string
    createdDate: string
}

export interface DocumentSummary {
    documentId: number
    documentNo: string
    documentTitle: string
    status: DocumentStatus
    originatorUserId: number
    createdDate: string
    completedDate: string | null
}

export interface ApprovalActionResult {
    transactionId: number
    documentId: number
    actionCode: ApprovalActionCode
    newStatus: DocumentStatus
    newStepId: number | null
    documentCompleted: boolean
}

export interface DocumentVersionResponse {
    versionId: number
    versionNo: number
    fileName: string
}

export interface DocumentSearchFilters {
    status?: DocumentStatus
    originatorUserId?: number
}

export interface FileUploadResponse {
    fileName: string
    filePath: string
    fileSizeBytes: number
    contentType: string | null
}

export interface AuditTransaction {
    transactionId: number
    documentId: number
    documentNo: string
    stepName: string
    actionCode: ApprovalActionCode
    actionByUserId: number
    actionDate: string
    comments: string | null
}

export interface AuditTransactionFilters {
    documentId?: number
    actionCode?: ApprovalActionCode
    actionByUserId?: number
    from?: string
    to?: string
}

export interface AuditTransactionFilters {
    documentId?: number
    actionCode?: ApprovalActionCode
    actionByUserId?: number
    from?: string
    to?: string
}
