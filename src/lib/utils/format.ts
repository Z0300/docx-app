const dateTime = new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short'})
const dateOnly = new Intl.DateTimeFormat(undefined, {dateStyle: 'medium'})

export function formatDateTime(value: string | number | Date | null | undefined): string {
    if (!value) return '—'
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : dateTime.format(d)
}

export function formatDate(value: string | number | Date | null | undefined): string {
    if (!value) return '—'
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '—' : dateOnly.format(d)
}

/** "PENDING_REVIEW" -> "Pending review" */
export function humanizeCode(code: string): string {
    const s = code.replace(/_/g, ' ').toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    const units = ['KB', 'MB', 'GB']
    let value = bytes / 1024
    let i = 0
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024
        i++
    }
    return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`
}
