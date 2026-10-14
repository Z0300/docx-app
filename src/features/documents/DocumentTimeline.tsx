import { CircleArrowRight, CircleCheck, CircleSlash, CircleX, Download, FilePlus2, FileText, RefreshCw, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/format'
import { ACTION_LABELS } from './constants'
import type { TimelineEvent } from './timeline'
import type { ApprovalActionCode } from './types'

type Tone = 'primary' | 'success' | 'error' | 'info' | 'abstain'

// Full literal class names, not built from a variable, so Tailwind's scanner can see every one.
const BUBBLE: Record<Tone, string> = {
    primary: 'border-primary/30 bg-primary/10 text-primary',
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-error/30 bg-error/10 text-error',
    info: 'border-info/30 bg-info/10 text-info',
    abstain: 'border-tone-abstain/30 bg-tone-abstain/10 text-tone-abstain',
}

const QUOTE_BORDER: Record<Tone, string> = {
    primary: 'border-primary',
    success: 'border-success',
    error: 'border-error',
    info: 'border-info',
    abstain: 'border-tone-abstain',
}

// Same colour language as the status badges: blue = referred/returned, green = approved, orange = abstain, red = rejected.
const ACTION_STYLE: Record<ApprovalActionCode, { Icon: LucideIcon; tone: Tone }> = {
    APPROVE: { Icon: CircleCheck, tone: 'success' },
    REJECT: { Icon: CircleX, tone: 'error' },
    REFER_RETURN: { Icon: Undo2, tone: 'info' },
    REFER_APPROVE: { Icon: CircleArrowRight, tone: 'success' },
    REFER_ABSTAIN: { Icon: CircleSlash, tone: 'abstain' },
}

function describe(event: TimelineEvent): { Icon: LucideIcon; tone: Tone; title: string } {
    if (event.kind === 'version') {
        return event.isFirst
            ? { Icon: FilePlus2, tone: 'primary', title: 'Document created and submitted' }
            : { Icon: RefreshCw, tone: 'primary', title: 'Revised and resubmitted' }
    }
    const { Icon, tone } = ACTION_STYLE[event.transaction.actionCode]
    return { Icon, tone, title: ACTION_LABELS[event.transaction.actionCode] }
}

interface DocumentTimelineProps {
    events: TimelineEvent[]
    onDownloadVersion: (versionNo: number) => void
    /** The version whose download is in flight, so its button can show a spinner. */
    downloadingVersion: number | null
    /** True while any download is running, so a second click can't start an overlapping one. */
    downloadDisabled: boolean
}

export function DocumentTimeline({ events, onDownloadVersion, downloadingVersion, downloadDisabled }: DocumentTimelineProps) {
    if (events.length === 0) return <p className="text-base-content/60 text-sm">No activity yet.</p>

    return (
        <ol
            aria-label="Document activity"
            className="before:bg-base-300 relative flex flex-col gap-4 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-px"
        >
            {events.map((event) => {
                const { Icon, tone, title } = describe(event)
                const comment = event.kind === 'version' ? event.version.changeComments : event.transaction.comments

                return (
                    <li key={event.key} className="flex gap-3">
                        {/* The opaque wrapper hides the connector line behind the translucent tinted bubble. */}
                        <div className="bg-base-100 relative z-10 h-fit rounded-full">
                            <div className={`flex size-8 items-center justify-center rounded-full border ${BUBBLE[tone]}`}>
                                <Icon size={16} aria-hidden="true" />
                            </div>
                        </div>

                        <div className="bg-base-100 border-base-300 min-w-0 flex-1 rounded-box border p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h3 className="font-medium">{title}</h3>
                                <time dateTime={event.date} className="text-base-content/60 text-body-sm whitespace-nowrap">
                                    {formatDateTime(event.date)}
                                </time>
                            </div>

                            {event.kind === 'version' ? (
                                <>
                                    <p className="text-base-content/60 text-body-sm mt-1 flex flex-wrap items-center gap-2">
                    <span className="border-base-300 bg-base-200 text-label-sm rounded border px-1.5 py-0.5 font-semibold">
                      v{event.version.versionNo}
                    </span>
                                        {event.isCurrent && (
                                            <span className="border-primary/30 bg-primary/10 text-primary text-label-sm rounded border px-1.5 py-0.5 font-semibold">
                        Current
                      </span>
                                        )}
                                        <span>{event.version.createdByName}</span>
                                    </p>

                                    <div className="border-base-300 bg-base-200/50 mt-3 flex items-center gap-2 rounded-field border px-3 py-2">
                                        <FileText size={16} className="text-base-content/50 shrink-0" aria-hidden="true" />
                                        <span className="text-body-sm min-w-0 flex-1 truncate" title={event.version.fileName}>
                      {event.version.fileName}
                    </span>
                                        <button
                                            type="button"
                                            className="btn btn-surface btn-xs"
                                            disabled={downloadDisabled}
                                            aria-label={`Download version ${event.version.versionNo}`}
                                            onClick={() => onDownloadVersion(event.version.versionNo)}
                                        >
                                            {downloadingVersion === event.version.versionNo ? (
                                                <span className="loading loading-spinner loading-xs" />
                                            ) : (
                                                <Download size={12} aria-hidden="true" />
                                            )}
                                            Download
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-base-content/60 text-body-sm mt-1">
                                    {event.transaction.stepName} · {event.transaction.actionByName}
                                </p>
                            )}

                            {comment && (
                                <blockquote className={`bg-base-200/60 text-body-sm mt-3 border-l-2 px-3 py-2 break-words whitespace-pre-wrap italic ${QUOTE_BORDER[tone]}`}>
                                    {comment}
                                </blockquote>
                            )}
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}