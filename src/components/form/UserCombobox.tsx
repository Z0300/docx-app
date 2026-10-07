import { Check, Loader2, Search, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useUserSearch } from '@/features/users/queries'
import type { UserSummary } from '@/features/users/types'
import { cn } from '@/lib/utils/cn'

interface UserComboboxProps {
    role: string
    value: UserSummary | null
    onChange: (user: UserSummary | null) => void
    label: string
    placeholder?: string
    excludeUserIds?: number[]
    error?: string | null
}

/** Debounced search-as-you-type combobox over GET /api/users/search. Single selection. */
export function UserCombobox({ role, value, onChange, label, placeholder, excludeUserIds = [], error }: UserComboboxProps) {
    const id = useId()
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const debounceRef = useRef<number>(0)
    const [debouncedQuery, setDebouncedQuery] = useState('')

    const results = useUserSearch(role, debouncedQuery)
    const options = (results.data ?? []).filter((u) => !excludeUserIds.includes(u.userId))

    function handleInput(v: string) {
        setQuery(v)
        window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(() => setDebouncedQuery(v), 250)
    }

    if (value) {
        return (
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{label}</label>
                <div className="border-base-300 bg-base-200/40 flex items-center justify-between gap-2 rounded-field border px-3 py-2">
                    <div>
                        <p className="text-body-sm font-medium">{value.displayName}</p>
                        <p className="text-base-content/50 text-body-sm">@{value.username}</p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-xs btn-circle" aria-label={`Remove ${value.displayName}`} onClick={() => onChange(null)}>
                        <X size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <Search size={15} className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" aria-hidden="true" />
                <input
                    id={id}
                    type="text"
                    value={query}
                    placeholder={placeholder ?? 'Search by username…'}
                    className={cn('input input-bordered w-full pl-9', error && 'input-error')}
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                    onChange={(e) => handleInput(e.target.value)}
                />
                {results.isFetching && <Loader2 size={15} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin" aria-hidden="true" />}
            </div>

            {open && (
                <ul className="bg-base-100 border-base-300 absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-field border shadow-lg">
                    {options.length === 0 ? (
                        <li className="text-base-content/50 px-3 py-2 text-body-sm">
                            {results.isFetching ? 'Searching…' : 'No matching users'}
                        </li>
                    ) : (
                        options.map((u) => (
                            <li key={u.userId}>
                                <button
                                    type="button"
                                    className="hover:bg-base-200 flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                                    onMouseDown={(e) => e.preventDefault()} // keep input's onBlur from closing the list before the click registers
                                    onClick={() => {
                                        onChange(u)
                                        setQuery('')
                                        setOpen(false)
                                    }}
                                >
                  <span>
                    <span className="text-body-sm font-medium">{u.displayName}</span>
                    <span className="text-base-content/50 ml-1 text-body-sm">@{u.username}</span>
                  </span>
                                    <Check size={14} className="text-primary opacity-0" aria-hidden="true" />
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}

            {error && (
                <p role="alert" className="text-error text-sm">
                    {error}
                </p>
            )}
        </div>
    )
}