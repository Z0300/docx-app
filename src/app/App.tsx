import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/Toaster'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'

// Dev-only tools, lazy-loaded; the DEV guard lets the bundler drop them from production builds.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : () => null

const RouterDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtools })))
  : () => null

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <RouterDevtools router={router} position="bottom-right" />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
