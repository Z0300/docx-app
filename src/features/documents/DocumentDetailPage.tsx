import { getRouteApi } from '@tanstack/react-router'
import { Download, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/lib/utils/format'
import { ApprovalActionForm } from './ApprovalActionForm'
import { CancelDocumentButton } from './CancelDocumentButton'
import { DOCUMENT_STATUS_TONES } from './constants'
import { DocumentPreview } from './DocumentPreview'
import { DocumentTimeline } from './DocumentTimeline'
import { useDocument } from './queries'
import { ResubmitForm } from './ResubmitForm'
import { buildTimeline } from './timeline'
import type { DocumentVersionSummary } from './types'
import {useDownloadFile} from "./mutations";

const ACTIONABLE_STATUSES = new Set(['PENDING', 'APPROVED', 'ABSTAINED'])
const RESUBMITTABLE_STATUSES = new Set(['RETURNED', 'REJECTED'])
const FINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED'])

const route = getRouteApi('/_authenticated/documents/$documentId')

export function DocumentDetailPage() {
    const { documentId } = route.useParams()
    const id = Number(documentId)
    const { user } = useAuth()
    const query = useDocument(id)
    const download = useDownloadFile(id) // hooks stay above the early returns below
    // null = "no choice made yet", so the default can depend on data that arrives later.
    const [previewChoice, setPreviewChoice] = useState<boolean | null>(null)

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

    const latest = doc.versions.reduce<DocumentVersionSummary | null>((best, v) => (!best || v.versionNo > best.versionNo ? v : best), null)
    const canPreview = latest !== null && /\.pdf$/i.test(latest.fileName)
    // Open by default for whoever has to decide; everyone else opts in, since it downloads the whole file.
    const showPreview = canPreview && (previewChoice ?? canAct)

    const actionPanel =
        canAct || canResubmit ? (
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
        ) : null

    const activity = (
        <section>
            <h2 className="text-title-md mb-3 font-semibold">Activity</h2>
            <DocumentTimeline
                events={buildTimeline(doc)}
                onDownloadVersion={(versionNo) => download.mutate(versionNo)}
                downloadingVersion={download.isPending ? (download.variables ?? null) : null}
                downloadDisabled={download.isPending}
            />
        </section>
    )

    return (
        <>
            <PageHeader
                title={doc.documentTitle}
                description={`${doc.documentNo} · Submitted by ${doc.createdByName}, ${formatDateTime(doc.createdDate)}`}
                actions={
                    <>
                        <button
                            type="button"
                            className="btn btn-surface btn-sm"
                            disabled={!canPreview}
                            title={canPreview ? undefined : 'Preview is available for PDF files only'}
                            aria-pressed={showPreview}
                            onClick={() => setPreviewChoice(!showPreview)}
                        >
                            {showPreview ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                            {showPreview ? 'Hide preview' : 'Preview'}
                        </button>
                        <button type="button" className="btn btn-surface btn-sm" disabled={download.isPending} onClick={() => download.mutate(undefined)}>
                            {download.isPending && download.variables === undefined ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <Download size={14} aria-hidden="true" />
                            )}
                            Download latest
                        </button>
                        {canCancel && <CancelDocumentButton documentId={id} />}
                    </>
                }
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <StatusBadge code={doc.status} tones={DOCUMENT_STATUS_TONES} />
                {doc.currentStepName && <span className="text-base-content/70 text-body-sm">Currently at: {doc.currentStepName}</span>}
                {doc.completedDate && <span className="text-base-content/60 text-body-sm">Closed {formatDateTime(doc.completedDate)}</span>}
            </div>

            {showPreview && latest ? (
                // The document on the left, the decision beside it — the activity trail moves under the decision panel.
                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-20">
                            <DocumentPreview documentId={id} fileName={latest.fileName} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {actionPanel}
                        {activity}
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">{activity}</div>
                    {actionPanel}
                </div>
            )}
        </>
    )
}