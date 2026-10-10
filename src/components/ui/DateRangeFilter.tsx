import { DayPicker } from '@daypicker/react'
import type { DateRange } from '@daypicker/react'
import { Calendar, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'

interface DateRangeFilterProps {
    /** ISO datetime, e.g. "2026-09-01T00:00:00" — what the backend's @DateTimeFormat(ISO.DATE_TIME) expects. */
    from?: string
    /** ISO datetime, end of the chosen day, e.g. "2026-09-30T23:59:59". */
    to?: string
    onChange: (range: { from?: string; to?: string }) => void
}

// Everything here uses LOCAL calendar fields. Never `toISOString()`: it converts to UTC, which moves
// the date back a day for anyone east of UTC (a Manila midnight becomes the previous day).
const pad = (n: number) => String(n).padStart(2, '0')

function toDateOnly(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function fromDateOnly(s: string): Date {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y!, m! - 1, d!)
}

const parseIso = (iso?: string) => (iso ? fromDateOnly(iso.slice(0, 10)) : undefined)
const toIsoStart = (d: Date) => `${toDateOnly(d)}T00:00:00`
// "to" is inclusive: end of the chosen day, so picking one day returns that whole day's records.
const toIsoEnd = (d: Date) => `${toDateOnly(d)}T23:59:59`

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfToday = () => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

const display = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

function formatLabel(from?: Date, to?: Date): string {
    if (from && to) return toDateOnly(from) === toDateOnly(to) ? display.format(from) : `${display.format(from)} – ${display.format(to)}`
    if (from) return `From ${display.format(from)}`
    if (to) return `Until ${display.format(to)}`
    return 'Select Date Range'
}

const PRESETS: { label: string; range: (today: Date) => { from: Date; to: Date } }[] = [
    { label: 'Today', range: (t) => ({ from: t, to: t }) },
    { label: 'Last 7 days', range: (t) => ({ from: addDays(t, -6), to: t }) },
    { label: 'Last 30 days', range: (t) => ({ from: addDays(t, -29), to: t }) },
    { label: 'This month', range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }) },
    { label: 'Last month', range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }) },
]

function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (notify) => {
            const mql = window.matchMedia(query)
            mql.addEventListener('change', notify)
            return () => mql.removeEventListener('change', notify)
        },
        () => window.matchMedia(query).matches,
        () => false,
    )
}

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
    const panelId = useId()
    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const wide = useMediaQuery('(min-width: 768px)')

    const [open, setOpen] = useState(false)
    // First click of a new range. While set, the calendar shows only this day as selected.
    const [anchor, setAnchor] = useState<Date | null>(null)

    const committed = useMemo<DateRange | undefined>(() => {
        const f = parseIso(from)
        const t = parseIso(to)
        return f || t ? { from: f, to: t } : undefined
    }, [from, to])

    const hasValue = Boolean(from || to)
    const today = startOfToday()

    function close() {
        setOpen(false)
        setAnchor(null)
    }

    function commit(start: Date, end: Date) {
        onChange({ from: toIsoStart(start), to: toIsoEnd(end) })
        close()
    }

    function handleDayClick(day: Date) {
        // Always start a fresh range on the first click, even when a range is already applied — otherwise
        // DayPicker would stretch/shrink the existing one and apply it immediately.
        if (!anchor) {
            setAnchor(day)
            return
        }
        const [start, end] = day < anchor ? [day, anchor] : [anchor, day]
        commit(start, end)
    }

    useEffect(() => {
        if (!open) return
        const onMouseDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) close()
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close()
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    const selected: DateRange | undefined = anchor ? { from: anchor } : committed
    // With no range yet, open on last month + this month — the common case is looking back.
    const defaultMonth = committed?.from ?? (wide ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : today)

    return (
        <div ref={rootRef} className="relative flex items-center gap-1">
            <button
                ref={triggerRef}
                type="button"
                className="btn btn-surface btn-sm gap-2"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => (open ? close() : setOpen(true))}
            >
                <Calendar size={14} aria-hidden="true" />
                <span>{formatLabel(committed?.from, committed?.to)}</span>
            </button>

            {hasValue && (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square"
                    aria-label="Clear date range"
                    // Explicit undefined keys matter: callers merge this into the URL, and an absent key would keep the old value.
                    onClick={() => {
                        onChange({ from: undefined, to: undefined })
                        close()
                    }}
                >
                    <X size={14} />
                </button>
            )}

            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Choose a date range"
                    className="border-base-300 bg-base-100 absolute top-full left-0 z-30 mt-2 flex max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-box border p-3 shadow-[0_4px_4px_-2px_rgba(0,0,0,0.1)] md:flex-row"
                >
                    <div className="flex shrink-0 flex-wrap gap-1 md:w-32 md:flex-col" role="group" aria-label="Quick ranges">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                className="btn btn-ghost btn-sm justify-start font-normal"
                                onClick={() => {
                                    const r = preset.range(today)
                                    commit(r.from, r.to)
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <DayPicker
                            className="rdp-custom w-max"
                            mode="range"
                            selected={selected}
                            onDayClick={handleDayClick}
                            numberOfMonths={wide ? 2 : 1}
                            defaultMonth={defaultMonth}
                            endMonth={today}
                            disabled={{ after: today }}
                        />
                        <p aria-live="polite" className="text-base-content/60 px-1 pt-1 text-body-sm">
                            {anchor ? 'Now pick an end date.' : 'Pick a start date, then an end date.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}