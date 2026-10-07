import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { UserSummary } from '@/features/users/types'
import { UserCombobox } from './UserCombobox'

interface ApproverChainPickerProps {
    role: string
    value: UserSummary[]
    onChange: (users: UserSummary[]) => void
    excludeUserIds?: number[]
    error?: string | null
}

/** Order matters here — the last entry becomes Final Approval. Add via the combobox, reorder with arrows. */
export function ApproverChainPicker({ role, value, onChange, excludeUserIds = [], error }: ApproverChainPickerProps) {
    function move(index: number, dir: -1 | 1) {
        const next = [...value]
        const target = index + dir
        if (target < 0 || target >= next.length) return
            ;[next[index], next[target]] = [next[target]!, next[index]!]
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-3">
            {value.length > 0 && (
                <ol className="flex flex-col gap-2">
                    {value.map((u, i) => (
                        <li key={u.userId} className="border-base-300 bg-base-200/40 flex items-center gap-3 rounded-field border px-3 py-2">
              <span className="bg-primary text-primary-content flex size-6 shrink-0 items-center justify-center rounded-full text-label-sm font-bold">
                {i + 1}
              </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-body-sm font-medium">{u.displayName}</p>
                                <p className="text-base-content/50 text-body-sm">
                                    @{u.username} {i === value.length - 1 && '· Final Approval'}
                                </p>
                            </div>
                            <div className="flex gap-0.5">
                                <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs btn-square"
                                    aria-label="Move down"
                                    disabled={i === value.length - 1}
                                    onClick={() => move(i, 1)}
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs btn-square"
                                    aria-label={`Remove ${u.displayName}`}
                                    onClick={() => onChange(value.filter((x) => x.userId !== u.userId))}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            <UserCombobox
                role={role}
                value={null}
                onChange={(u) => u && onChange([...value, u])}
                label={value.length === 0 ? 'Approvers' : 'Add another approver'}
                placeholder="Search to add an approver…"
                excludeUserIds={[...excludeUserIds, ...value.map((u) => u.userId)]}
            />

            {error && (
                <p role="alert" className="text-error text-sm">
                    {error}
                </p>
            )}
        </div>
    )
}