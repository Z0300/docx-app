import type { StatusTone } from '@/components/ui/StatusBadge'
import type { ApprovalActionCode, DocumentStatus } from './types'

export const DOCUMENT_STATUS_TONES: Record<DocumentStatus, StatusTone> = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    COMPLETED: 'approved',
    RETURNED: 'referred',
    ABSTAINED: 'abstain',
    REJECTED: 'rejected',
    CANCELLED: 'draft',
}

export const ACTION_LABELS: Record<ApprovalActionCode, string> = {
    APPROVE: 'Approve',
    REJECT: 'Reject',
    REFER_RETURN: 'Refer and Return',
    REFER_APPROVE: 'Refer, Approved, Do Not Return',
    REFER_ABSTAIN: 'Refer, Abstain, Do Not Return',
}