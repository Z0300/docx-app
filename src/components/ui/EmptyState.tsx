import type { ReactNode } from 'react'

/** An empty screen is an invitation to act: say what's missing and offer the next step. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-medium">{title}</p>
      {description && <p className="text-base-content/60 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
