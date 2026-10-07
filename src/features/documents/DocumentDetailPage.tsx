import { getRouteApi } from '@tanstack/react-router'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/lib/utils/format'
import { ApprovalActionForm } from './ApprovalActionForm'
import { CancelDocumentButton } from './CancelDocumentButton'
import { ACTION_LABELS, DOCUMENT_STATUS_TONES } from './constants'
import { useDocument } from './queries'
import { ResubmitForm } from './ResubmitForm'

const ACTIONABLE_STATUSES = new Set(['PENDING', 'APPROVED', 'ABSTAINED'])
const RESUBMITTABLE_STATUSES = new Set(['RETURNED', 'REJECTED'])
const FINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED'])

const route = getRouteApi('/_authenticated/documents/$documentId')

export function DocumentDetailPage() {
    const { documentId } = route.useParams()
    const id = Number(documentId)
    const { user } = useAuth()
    const query = useDocument(id)

    if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
    if (query.isLoading || !query.data) {
        return (
            <div className="flex flex-col gap-3">
                <div className="skeleton h-8 w-72" />
                <div className="skeleton h-48 w-full" />
            </div>
        )
    }

    const doc = query.data
    const isOriginator = user?.id === doc.createdBy
    const canAct = ACTIONABLE_STATUSES.has(doc.status) && doc.currentStepId !== null
    const canResubmit = isOriginator && RESUBMITTABLE_STATUSES.has(doc.status)
    const canCancel = isOriginator && !FINAL_STATUSES.has(doc.status)

    return (
        <>
            <PageHeader
                title={doc.documentTitle}
                description={`${doc.documentNo} · Submitted ${formatDateTime(doc.createdDate)}`}
                actions={canCancel ? <CancelDocumentButton documentId={id} /> : undefined}
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <StatusBadge code={doc.status} tones={DOCUMENT_STATUS_TONES} />
                {doc.currentStepName && <span className="text-base-content/70 text-body-sm">Currently at: {doc.currentStepName}</span>}
                {doc.completedDate && <span className="text-base-content/60 text-body-sm">Closed {formatDateTime(doc.completedDate)}</span>}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="text-title-md mb-3 font-semibold">History</h2>
                    {doc.history.length === 0 ? (
                        <p className="text-base-content/60 text-sm">No actions recorded yet.</p>
                    ) : (
                        <ol className="flex flex-col gap-3">
                            {doc.history.map((tx) => (
                                <li key={tx.transactionId} className="bg-base-100 border-base-300 rounded-box border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">{ACTION_LABELS[tx.actionCode]}</span>
                                        <span className="text-base-content/60 text-body-sm">{formatDateTime(tx.actionDate)}</span>
                                    </div>
                                    <p className="text-base-content/60 text-body-sm">{tx.stepName} · User #{tx.actionByUserId}</p>
                                    {tx.comments && <p className="text-body-sm mt-2">{tx.comments}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                {(canAct || canResubmit) && (
                    <div className="bg-base-100 border-base-300 h-fit rounded-box border p-5">
                        {canAct && (
                            <>
                                <h2 className="text-title-md mb-3 font-semibold">Take action</h2>
                                <ApprovalActionForm documentId={id} stepId={doc.currentStepId!} currentStepName={doc.currentStepName!} />
                            </>
                        )}
                        {canResubmit && (
                            <>
                                <h2 className="text-title-md mb-3 font-semibold">Revise and resubmit</h2>
                                <ResubmitForm documentId={id} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}