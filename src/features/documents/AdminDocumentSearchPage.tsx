
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { useUrlPageState } from '@/components/table/useUrlPageState'
import { useDocumentSearch } from './queries'
import { DocumentSearchTable } from './DocumentSearchTable'

const route = getRouteApi('/_authenticated/documents/search')

export function AdminDocumentSearchPage() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const update = (patch: Partial<typeof search>) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })
    const { pagination, sorting, onPaginationChange, onSortingChange, params } = useUrlPageState(search, update, 'createdDate,desc')

    const query = useDocumentSearch({ ...params, status: search.status, originatorUserId: search.originatorUserId })

    return (
        <>
            <PageHeader title="All Documents" description="Every document in the system, across every originator and status." />
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