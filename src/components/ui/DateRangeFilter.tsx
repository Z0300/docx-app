import { X } from 'lucide-react'

interface DateRangeFilterProps {
    from?: string // ISO datetime (e.g. "2026-09-01T00:00:00") — what the backend/schema expects
    to?: string
    onChange: (range: { from?: string; to?: string }) => void
}

/** Converts a plain <input type="date"> value (YYYY-MM-DD) to the start/end-of-day ISO
 *  datetime the backend's @DateTimeFormat(iso = ISO.DATE_TIME) expects. "to" is treated as
 *  inclusive — end of that day, not midnight at its start — so picking the same day for
 *  both fields actually includes that whole day's results. */
function toIsoStart(dateOnly: string): string {
    return `${dateOnly}T00:00:00`
}
function toIsoEnd(dateOnly: string): string {
    return `${dateOnly}T23:59:59`
}
function toDateOnly(iso: string | undefined): string {
    return iso ? iso.slice(0, 10) : ''
}

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
    const hasValue = Boolean(from || to)

    return (
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
                <span className="text-base-content/70">From</span>
                <input
                    type="date"
                    className="input input-sm input-bordered"
                    value={toDateOnly(from)}
                    max={toDateOnly(to) || undefined}
                    onChange={(e) => onChange({ from: e.target.value ? toIsoStart(e.target.value) : undefined, to })}
                />
            </label>

            <label className="flex items-center gap-2 text-sm">
                <span className="text-base-content/70">To</span>
                <input
                    type="date"
                    className="input input-sm input-bordered"
                    value={toDateOnly(to)}
                    min={toDateOnly(from) || undefined}
                    onChange={(e) => onChange({ from, to: e.target.value ? toIsoEnd(e.target.value) : undefined })}
                />
            </label>

            {hasValue && (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square"
                    aria-label="Clear date range"
                    onClick={() => onChange({ from: undefined, to: undefined })}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}