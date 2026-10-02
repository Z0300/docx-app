import { Link } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'

function FullScreen({ title, body, action }: { title: string; body: string; action?: () => void }) {
  return (
    <div className="bg-base-200 grid min-h-screen place-items-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-base-content/70 mt-2 text-sm">{body}</p>
        <div className="mt-6 flex justify-center gap-2">
          {action && (
            <button type="button" className="btn" onClick={action}>
              Try again
            </button>
          )}
          <Link to="/" className="btn btn-primary">
            Back to the dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Renders inside the app shell, so the sidebar stays available. */
export function ForbiddenPage() {
  return (
    <>
      <PageHeader title="You don't have access to this page" />
      <p className="text-base-content/70 max-w-prose text-sm">
        Your account's roles don't include this area. Ask an administrator if you need it.
      </p>
    </>
  )
}

export const NotFoundPage = () => <FullScreen title="Page not found" body="The address may be mistyped, or the page may have moved." />

/** Route-level error boundary: shown instead of a blank screen when a route or component throws. */
export function RouteErrorPage({ error, reset }: ErrorComponentProps) {
  return <FullScreen title="Something went wrong" body={error instanceof Error && error.message ? error.message : 'Unknown error'} action={reset} />
}
