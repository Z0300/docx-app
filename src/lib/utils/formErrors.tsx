export function firstFieldError(errors: unknown[]): string | null {
    for (const e of errors) {
        if (typeof e === 'string' && e) return e
        if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') return e.message
    }
    return null
}