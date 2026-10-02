import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PageParams } from '@/lib/api/types'
import { recordsApi } from './api'
import type { RecordFilters } from './types'

/** Key factory: one place that decides what invalidates what. */
export const recordKeys = {
  all: ['records'] as const,
  list: (params: PageParams & RecordFilters) => [...recordKeys.all, 'list', params] as const,
}

export function useRecords(params: PageParams & RecordFilters) {
  return useQuery({
    queryKey: recordKeys.list(params),
    queryFn: () => recordsApi.list(params),
    // Keep showing the previous page while the next one loads — no flash of empty table.
    placeholderData: keepPreviousData,
  })
}

export function useCreateRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recordsApi.create,
    meta: { successMessage: 'Record created' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  })
}
