import { TriangleAlert } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/errors'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="border-error/30 bg-error/5 flex flex-col items-start gap-3 rounded-box border p-5">
      <div className="text-error flex items-center gap-2 font-medium">
        <TriangleAlert size={18} aria-hidden="true" />
        Could not load this data
      </div>
      <p className="text-sm">{getErrorMessage(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
