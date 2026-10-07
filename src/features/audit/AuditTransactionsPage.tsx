import { getRouteApi, Link } from '@tanstack/react-router'
import { DataTable } from '@/components/table/DataTable'
import { createServerColumns } from '@/components/table/tableFeatures'
import { useUrlPageState } from '@/components/table/useUrlPageState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ACTION_LABELS } from '@/features/documents/constants'
import {APPROVAL_ACTION_CODES, type AuditTransaction} from '@/features/documents/types'
import { formatDateTime } from '@/lib/utils/format'
import {useAuditTransactionSearch} from "@/features/documents/queries.ts";


const route = getRouteApi('/_authenticated/audit/transactions')
const col = createServerColumns<AuditTransaction>()
const columns = col.columns([
    col.accessor('documentNo', {
        header: 'Document',
        cell: (info) => (
            <Link to="/documents/$documentId" params={{ documentId: String(info.row.original.documentId) }} className="link link-primary font-medium">
                {info.getValue()}
            </Link>
        ),
    }),
    col.accessor('stepName', { header: 'Step' }),
    col.accessor('actionCode', { header: 'Action', cell: (info) => ACTION_LABELS[info.getValue()] }),
    col.accessor('actionByUserId', { header: 'Actor', cell: (info) => `User #${info.getValue()}` }),
    col.accessor('actionDate', { header: 'Date', cell: (info) => formatDateTime(info.getValue()) }),
    col.accessor('comments', { header: 'Comments', cell: (info) => info.getValue() ?? '—' }),
])

export function AuditTransactionsPage() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const update = (patch: Partial<typeof search>) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })
    const { pagination, sorting, onPaginationChange, onSortingChange, params } = useUrlPageState(search, update, 'actionDate,desc')

    const query = useAuditTransactionSearch({ ...params, actionCode: search.actionCode })

    return (
        <>
            <PageHeader title="Audit · Transactions" description="Every approval action taken across every document." />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/70">Action</span>
                    <select
                        className="select select-sm select-bordered"
                        value={search.actionCode ?? ''}
                        onChange={(e) => update({ actionCode: (e.target.value || undefined) as (typeof APPROVAL_ACTION_CODES)[number] | undefined, page: 1 })}
                    >
                        <option value="">All</option>
                        {APPROVAL_ACTION_CODES.map((code) => (
                            <option key={code} value={code}>
                                {ACTION_LABELS[code]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {query.isError ? (
                <ErrorState error={query.error} onRetry={() => void query.refetch()} />
            ) : (
                <DataTable
                    caption="Transactions"
                    columns={columns}
                    data={query.data?.items ?? []}
                    meta={query.data?.meta}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    isLoading={query.isLoading}
                    isFetching={query.isFetching}
                    getRowId={(r) => String(r.transactionId)}
                />
            )}
        </>
    )
}