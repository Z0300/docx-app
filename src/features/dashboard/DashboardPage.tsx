import { Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/hooks/useAuth'

/** Placeholder landing page — replace with real widgets (queue counts, recent activity, …). */
export function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader title={`Welcome, ${user?.userName}`} description="This is the starter dashboard. Replace it with what your users open the app for." />
      <div className="bg-base-100 border-base-300 rounded-box border p-6">
        <p className="text-sm">
          The <Link className="link link-primary" to="/records">Records</Link> page is a complete reference feature:
          server-side pagination and sorting, a filter, a validated create form, and error handling. Copy it
          when you add your own.
        </p>
      </div>
    </>
  )
}
