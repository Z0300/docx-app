import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { RouterContext } from '@/router'

/**
 * Root of the route tree. Every other file under src/routes/ is a descendant of this one.
 * Keep this file free of app logic — it exists so `RouterContext` has somewhere to attach.
 */
export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
})
