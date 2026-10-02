import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import type { ToastKind } from '@/stores/toastStore'

const STYLE: Record<ToastKind, { className: string; Icon: typeof Info }> = {
  success: { className: 'alert-success', Icon: CheckCircle2 },
  error: { className: 'alert-error', Icon: XCircle },
  info: { className: 'alert-info', Icon: Info },
  warning: { className: 'alert-warning', Icon: AlertTriangle },
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="toast toast-end toast-bottom z-50" aria-live="polite">
      {toasts.map((t) => {
        const { className, Icon } = STYLE[t.kind]
        return (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'} className={`alert ${className} max-w-sm shadow-lg`}>
            <Icon size={18} aria-hidden="true" />
            <span className="text-sm">{t.message}</span>
            <button type="button" className="btn btn-ghost btn-xs btn-circle" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
