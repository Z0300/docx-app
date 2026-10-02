import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '@/components/table/DataTable'
import { createServerColumns } from '@/components/table/tableFeatures'
import type { PageSearch } from '@/components/table/searchSchema'
import { useUrlPageState } from '@/components/table/useUrlPageState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime, humanizeCode } from '@/lib/utils/format'
import { CreateRecordForm } from './CreateRecordForm'
import { useRecords } from './queries'
import { RECORD_STATUSES } from './types'
import type { RecordItem, RecordStatus } from './types'

// The route itself is registered in routes/_authenticated.records.tsx, which imports this component.
const route = getRouteApi('/_authenticated/records')

const DEFAULT_SORT = 'createdDate,desc'

const STATUS_TONES = { DRAFT: 'draft', ACTIVE: 'approved', ARCHIVED: 'pending' } as const

const col = createServerColumns<RecordItem>()

// Column ids double as the `sort=` property sent to the API, so they must match backend field names.
const columns = col.columns([
  col.accessor('code', { header: 'Code' }),
  col.accessor('title', { header: 'Title' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge code={info.getValue()} tones={STATUS_TONES} />,
  }),
  col.accessor('createdDate', {
    header: 'Created',
    cell: (info) => formatDateTime(info.getValue()),
  }),
])

export function RecordsPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [creating, setCreating] = useState(false)

  const status = search.status ?? ''
  const update = useCallback(
    (patch: Partial<PageSearch> & { status?: RecordStatus }) =>
      void navigate({ search: (prev) => ({ ...prev, ...patch }) }),
    [navigate],
  )
  const { pagination, sorting, onPaginationChange, onSortingChange, params } = useUrlPageState(search, update, DEFAULT_SORT)
  const setStatus = (value: RecordStatus | '') => update({ status: value || undefined, page: 1 })

  const query = useRecords({ ...params, status })
  const rows = useMemo(() => query.data?.items ?? [], [query.data])

  return (
    <>
      <PageHeader
        title="Records"
        description="A reference list: server-side paging and sorting, a filter, and a validated create form."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <Plus size={16} aria-hidden="true" /> New record
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-base-content/70">Status</span>
          <select
            className="select select-sm select-bordered"
            value={status}
            onChange={(e) => setStatus(e.target.value as RecordStatus | '')}
          >
            <option value="">All</option>
            {RECORD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanizeCode(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <DataTable
          caption="Records"
          columns={columns}
          data={rows}
          meta={query.data?.meta}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          getRowId={(r) => String(r.id)}
          emptyState={
            <EmptyState
              title={status ? 'No records match this status' : 'No records yet'}
              description={status ? 'Try a different status or clear the filter.' : 'Create the first record to see it here.'}
              action={
                status ? (
                  <button type="button" className="btn btn-sm" onClick={() => setStatus('')}>
                    Clear filter
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => setCreating(true)}>
                    New record
                  </button>
                )
              }
            />
          }
        />
      )}

      <Modal open={creating} title="New record" onClose={() => setCreating(false)}>
        <CreateRecordForm onDone={() => setCreating(false)} />
      </Modal>
    </>
  )
}
