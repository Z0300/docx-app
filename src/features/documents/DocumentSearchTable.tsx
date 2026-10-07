import type { PaginationState, SortingState, Updater } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { DataTable } from '@/components/table/DataTable'
import { createServerColumns } from '@/components/table/tableFeatures'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, humanizeCode } from '@/lib/utils/format'
import type { Paged } from '@/lib/api/types'
import { DOCUMENT_STATUS_TONES } from './constants'
import { DOCUMENT_STATUSES } from './types'
import type { DocumentStatus, DocumentSummary } from './types'

const col = createServerColumns<DocumentSummary>()
const columns = col.columns([
    col.accessor('documentNo', { header: 'Ref #' }),
    col.accessor('documentTitle', {
        header: 'Title',
        cell: (info) => (
            <Link to="/documents/$documentId" params={{ documentId: String(info.row.original.documentId) }} className="link link-primary font-medium">
                {info.getValue()}
            </Link>
        ),
    }),
    col.accessor('status', { header: 'Status', cell: (info) => <StatusBadge code={info.getValue()} tones={DOCUMENT_STATUS_TONES} /> }),
    col.accessor('originatorUserId', { header: 'Originator', cell: (info) => `User #${info.getValue()}` }),
    col.accessor('createdDate', { header: 'Submitted', cell: (info) => formatDateTime(info.getValue()) }),
    col.accessor('completedDate', { header: 'Closed', cell: (info) => (info.getValue() ? formatDateTime(info.getValue()) : '—') }),
])

export function DocumentSearchTable({
                                        query,
                                        pagination,
                                        onPaginationChange,
                                        sorting,
                                        onSortingChange,
                                        status,
                                        onStatusChange,
                                    }: {
    query: { data?: Paged<DocumentSummary>; isLoading: boolean; isFetching: boolean; isError: boolean; error: unknown; refetch: () => void }
    pagination: PaginationState
    onPaginationChange: (u: Updater<PaginationState>) => void
    sorting: SortingState
    onSortingChange: (u: Updater<SortingState>) => void
    status: DocumentStatus | ''
    onStatusChange: (s: DocumentStatus | '') => void
}) {
    return (
        <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/70">Status</span>
                    <select className="select select-sm select-bordered" value={status} onChange={(e) => onStatusChange(e.target.value as DocumentStatus | '')}>
                        <option value="">All</option>
                        {DOCUMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {humanizeCode(s)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {query.isError ? (
                <ErrorState error={query.error} onRetry={query.refetch} />
            ) : (
                <DataTable
                    caption="Documents"
                    columns={columns}
                    data={query.data?.items ?? []}
                    meta={query.data?.meta}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    isLoading={query.isLoading}
                    isFetching={query.isFetching}
                    getRowId={(r) => String(r.documentId)}
                />
            )}
        </>
    )
}