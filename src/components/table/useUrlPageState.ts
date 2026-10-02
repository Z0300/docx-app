import { useCallback, useMemo } from 'react'
import type { PaginationState, SortingState, Updater } from '@tanstack/react-table'
import type { PageParams } from '@/lib/api/types'
import type { PageSearch } from './searchSchema'

/**
 * Drives a server-side table from the URL: page, size and sort live in the search params, so a
 * refresh, a shared link or the back button all restore exactly the same view.
 *
 * @param search       the validated search params (`Route.useSearch()`)
 * @param update       merges a patch into the URL (`navigate({ search: prev => ({ ...prev, ...patch }) })`)
 * @param defaultSort  sort applied when the URL has none, as "property,dir"
 */
export function useUrlPageState(
  search: PageSearch,
  update: (patch: Partial<PageSearch>) => void,
  defaultSort?: string,
) {
  const sort = search.sort ?? defaultSort

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: search.page - 1, pageSize: search.size }),
    [search.page, search.size],
  )

  const sorting = useMemo<SortingState>(() => {
    if (!sort) return []
    const [id, dir] = sort.split(',') as [string, string]
    return [{ id, desc: dir === 'desc' }]
  }, [sort])

  const onPaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      // A new page size invalidates the current page number, so go back to the first page.
      const page = next.pageSize !== pagination.pageSize ? 1 : next.pageIndex + 1
      update({ page, size: next.pageSize })
    },
    [pagination, update],
  )

  const onSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0]
      // Changing the sort always returns to the first page.
      update({ sort: first ? `${first.id},${first.desc ? 'desc' : 'asc'}` : undefined, page: 1 })
    },
    [sorting, update],
  )

  const params = useMemo<PageParams>(() => ({ page: search.page - 1, size: search.size, sort }), [search.page, search.size, sort])

  return { pagination, sorting, onPaginationChange, onSortingChange, params }
}
