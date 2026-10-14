import type { ApprovalTransactionSummary, DocumentDetail, DocumentVersionSummary } from './types'

export type TimelineEvent =
    | { kind: 'version'; key: string; date: string; version: DocumentVersionSummary; isFirst: boolean; isCurrent: boolean }
    | { kind: 'action'; key: string; date: string; transaction: ApprovalTransactionSummary }

/**
 * Merges file versions and approval actions into one chronological list, oldest first.
 *
 * Dates are LocalDateTime strings with no offset ("2026-10-04T10:10:00" or with a fractional second),
 * so plain string comparison orders them correctly: the fields are fixed-width and a fraction compares
 * digit by digit, which matches numeric order.
 */
export function buildTimeline(doc: Pick<DocumentDetail, 'versions' | 'history'>): TimelineEvent[] {
    const latest = doc.versions.reduce((max, v) => Math.max(max, v.versionNo), 0)

    const events: TimelineEvent[] = [
        ...doc.versions.map(
            (version): TimelineEvent => ({
                kind: 'version',
                key: `version-${version.versionNo}`,
                date: version.createdDate,
                version,
                isFirst: version.versionNo === 1,
                isCurrent: version.versionNo === latest,
            }),
        ),
        ...doc.history.map(
            (transaction): TimelineEvent => ({
                kind: 'action',
                key: `action-${transaction.transactionId}`,
                date: transaction.actionDate,
                transaction,
            }),
        ),
    ]

    return events.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        // Same instant: the file goes in before anyone acts on it.
        if (a.kind !== b.kind) return a.kind === 'version' ? -1 : 1
        return 0
    })
}