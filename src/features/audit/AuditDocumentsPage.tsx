import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { useUrlPageState } from '@/components/table/useUrlPageState'
import { DocumentSearchTable } from '@/features/documents/DocumentSearchTable'
import {useAuditDocumentSearch} from "@/features/documents/queries.ts";

const route = getRouteApi('/_authenticated/audit/documents')

export function AuditDocumentsPage() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const update = (patch: Partial<typeof search>) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })
    const { pagination, sorting, onPaginationChange, onSortingChange, params } = useUrlPageState(search, update, 'createdDate,desc')

    const query = useAuditDocumentSearch({ ...params, status: search.status, originatorUserId: search.originatorUserId })

    return (
        <>
            <PageHeader title="Audit · Documents" description="Read-only view of every document for compliance review." />
            <DocumentSearchTable
                query={query}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                sorting={sorting}
                onSortingChange={onSortingChange}
                status={search.status ?? ''}
                onStatusChange={(status) => update({ status: status || undefined, page: 1 })}
            />
        </>
    )
}