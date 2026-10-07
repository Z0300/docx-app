import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils/format'
import { DOCUMENT_STATUS_TONES } from './constants'
import { useMySubmissions } from './queries'

export function MySubmissionsPage() {
    const query = useMySubmissions()
    const documents = query.data ?? []

    return (
        <>
            <PageHeader
                title="My Submissions"
                description="Documents you've submitted, and where each one currently stands."
                actions={
                    <Link to="/documents/new" className="btn btn-primary">
                        <Plus size={16} aria-hidden="true" /> New submission
                    </Link>
                }
            />

            {query.isError ? (
                <ErrorState error={query.error} onRetry={() => void query.refetch()} />
            ) : query.isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="skeleton h-16 w-full" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-base-100 border-base-300 rounded-box border p-10">
                    <EmptyState
                        title="No submissions yet"
                        description="Documents you submit will show up here, with their current status."
                        action={
                            <Link to="/documents/new" className="btn btn-sm btn-primary">
                                New submission
                            </Link>
                        }
                    />
                </div>
            ) : (
                <div className="bg-base-100 border-base-300 overflow-hidden rounded-box border">
                    <table className="table table-custom">
                        <caption className="sr-only">My submissions</caption>
                        <thead>
                        <tr>
                            <th scope="col">Document</th>
                            <th scope="col">Status</th>
                            <th scope="col">Submitted</th>
                            <th scope="col">Closed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.documentId}>
                                <td>
                                    <Link to="/documents/$documentId" params={{ documentId: String(doc.documentId) }} className="link link-primary font-medium">
                                        {doc.documentTitle}
                                    </Link>
                                    <div className="text-base-content/60 text-body-sm">{doc.documentNo}</div>
                                </td>
                                <td>
                                    <StatusBadge code={doc.status} tones={DOCUMENT_STATUS_TONES} />
                                </td>
                                <td>{formatDateTime(doc.createdDate)}</td>
                                <td>{doc.completedDate ? formatDateTime(doc.completedDate) : '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}