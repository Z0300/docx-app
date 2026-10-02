import { createRouter } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { NotFoundPage } from '@/features/errors/ErrorPages'
import { RouteErrorPage } from '@/features/errors/ErrorPages'
import { routeTree } from './routeTree.gen'

/** Available as `context` in every route's `beforeLoad` / `loader`. */
export interface RouterContext {
  queryClient: QueryClient
}

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: RouteErrorPage,
  scrollRestoration: true,
})

// Makes every <Link>, navigate() and useSearch() in the app type-checked against the route tree.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
