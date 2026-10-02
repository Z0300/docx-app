import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown } from 'lucide-react'
import { useTable } from '@tanstack/react-table'
import type { ColumnDef, PaginationState, SortingState, Updater } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import type { PageMeta } from '@/lib/api/types'
import { cn } from '@/lib/utils/cn'
import { serverTableFeatures } from './tableFeatures'
import type { ServerTableFeatures } from './tableFeatures'

const PAGE_SIZES = [10, 25, 50, 100]

interface DataTableProps<TData extends object> {
  columns: ColumnDef<ServerTableFeatures, TData>[]
  data: TData[]
  meta?: PageMeta
  pagination: PaginationState
  onPaginationChange: (updater: Updater<PaginationState>) => void
  sorting: SortingState
  onSortingChange: (updater: Updater<SortingState>) => void
  /** True only on the very first load (no rows to show yet). */
  isLoading?: boolean
  /** True on every refetch, including page changes while previous rows are still shown. */
  isFetching?: boolean
  getRowId?: (row: TData) => string
  onRowClick?: (row: TData) => void
  emptyState?: ReactNode
  caption: string
}

const EMPTY: never[] = []

export function DataTable<TData extends object>({
  columns,
  data,
  meta,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
  isFetching,
  getRowId,
  onRowClick,
  emptyState,
  caption,
}: DataTableProps<TData>) {
  const table = useTable({
    features: serverTableFeatures,
    columns,
    data: data ?? EMPTY,
    rowCount: meta?.totalElements ?? 0,
    manualPagination: true,
    manualSorting: true,
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
    ...(getRowId ? { getRowId } : {}),
  })

  const rows = table.getRowModel().rows
  const colCount = columns.length
  const from = meta && meta.totalElements > 0 ? meta.page * meta.size + 1 : 0
  const to = meta ? Math.min((meta.page + 1) * meta.size, meta.totalElements) : 0

  return (
    <div className="bg-base-100 border-base-300 overflow-hidden rounded-box border">
      <div className="relative overflow-x-auto">
        {isFetching && !isLoading && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden" role="progressbar" aria-label="Loading">
            <div className="bg-primary h-full w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}

        <table className="table table-custom">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : canSort ? 'none' : undefined}
                      className="bg-base-200/60 text-base-content/70 font-medium whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="hover:text-base-content -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp size={14} aria-hidden="true" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={14} aria-hidden="true" />
                          ) : (
                            <ChevronsUpDown size={14} className="opacity-40" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i} aria-hidden="true">
                  {Array.from({ length: colCount }, (_, j) => (
                    <td key={j}>
                      <div className="skeleton h-4 w-full max-w-40" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-14 text-center">
                  {emptyState ?? <span className="text-base-content/60">No records to show.</span>}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(onRowClick && 'hover:bg-base-200/60 cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="border-base-300 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <p className="text-base-content/70" aria-live="polite">
            {meta.totalElements === 0 ? 'No results' : `Showing ${from}–${to} of ${meta.totalElements}`}
          </p>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-base-content/70">Rows per page</span>
              <select
                className="select select-sm select-bordered"
                value={pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <div className="join" role="group" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-sm join-item"
                aria-label="First page"
                disabled={!meta.hasPrevious}
                onClick={() => table.setPageIndex(0)}
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm join-item"
                aria-label="Previous page"
                disabled={!meta.hasPrevious}
                onClick={() => table.setPageIndex(meta.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="btn btn-sm join-item pointer-events-none">
                Page {meta.totalPages === 0 ? 0 : meta.page + 1} of {meta.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm join-item"
                aria-label="Next page"
                disabled={!meta.hasNext}
                onClick={() => table.setPageIndex(meta.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm join-item"
                aria-label="Last page"
                disabled={!meta.hasNext}
                onClick={() => table.setPageIndex(Math.max(meta.totalPages - 1, 0))}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
