import type { LucideIcon } from 'lucide-react'
import { CircleDot, FileEdit, RefreshCw, ShieldCheck, TriangleAlert, XCircle } from 'lucide-react'
import { humanizeCode } from '@/lib/utils/format'

export type StatusTone = 'referred' | 'approved' | 'abstain' | 'pending' | 'rejected' | 'draft'

// Spec: 1px border + 10% fill + 100%-opacity text, all the same color. color-mix() gives the
// 10% fill without a second hardcoded hex per tone.
const TONE_STYLE: Record<StatusTone, { color: string; Icon: LucideIcon }> = {
  referred: { color: 'var(--color-info)', Icon: RefreshCw },
  approved: { color: 'var(--color-success)', Icon: ShieldCheck },
  abstain: { color: 'var(--color-tone-abstain)', Icon: CircleDot },
  pending: { color: 'var(--color-warning)', Icon: TriangleAlert },
  rejected: { color: 'var(--color-error)', Icon: XCircle },
  draft: { color: 'var(--color-tone-draft)', Icon: FileEdit },
}

export function StatusBadge({ code, tones }: { code: string; tones: Record<string, StatusTone> }) {
  const tone = tones[code] ?? 'draft'
  const { color, Icon } = TONE_STYLE[tone]

  return (
      <span
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-label-md font-semibold"
          style={{ color, borderColor: color, backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`, borderWidth: 1 }}
      >
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
        {humanizeCode(code)}
    </span>
  )
}