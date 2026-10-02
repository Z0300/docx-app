import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toApiError, ApiError } from '@/lib/api/errors'
import { toast } from '@/stores/toastStore'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Skip the automatic error toast (e.g. the form shows the error inline). */
      silent?: boolean
      /** Shown as a toast when the mutation succeeds. */
      successMessage?: string
    }
    queryMeta: {
      silent?: boolean
    }
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const e = toApiError(error)
      // 401 is handled by the auth interceptor (redirects to login) — don't also toast it.
      if (!query.meta?.silent && !e.isUnauthorized) toast.error(e.message)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      const e = toApiError(error)
      if (!mutation.meta?.silent && !e.isUnauthorized) toast.error(e.message)
    },
    onSuccess: (_data, _vars, _ctx, mutation) => {
      if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Don't hammer the server with retries for errors that a retry can't fix.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.isClientError) return false
        return failureCount < 2
      },
    },
  },
})
