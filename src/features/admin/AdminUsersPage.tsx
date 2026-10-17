import { getRouteApi } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from '@/components/table/DataTable'
import { createServerColumns } from '@/components/table/tableFeatures'
import { useUrlPageState } from '@/components/table/useUrlPageState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils/format'
import { useAdminRoles, useAdminUsers } from './queries'
import type { AdminUser } from './types'
import { UserRolesForm } from './UserRolesForm'

const route = getRouteApi('/_authenticated/admin/users')
const ACTIVE_TONES = { ACTIVE: 'approved', INACTIVE: 'draft' } as const
const col = createServerColumns<AdminUser>()

// A column's id is sent as `sort=`, so only columns that are real properties of the User entity stay sortable.
function buildColumns(onEditRoles: (user: AdminUser) => void) {
    return col.columns([
        col.accessor('displayName', {
            header: 'User',
            enableSorting: false,
            cell: (info) => (
                <div>
                    <div className="font-medium">{info.getValue()}</div>
                    {info.row.original.email && <div className="text-base-content/60 text-body-sm">{info.row.original.email}</div>}
                </div>
            ),
        }),
        col.accessor('userName', { header: 'Username' }),
        col.accessor('roles', {
            header: 'Roles',
            enableSorting: false,
            cell: (info) =>
                info.getValue().length === 0 ? (
                    <span className="text-base-content/50 text-body-sm">No roles</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {info.getValue().map((role) => (
                            <span key={role.roleId} className="border-base-300 bg-base-200 text-label-md rounded border px-1.5 py-0.5 font-semibold">
                {role.name}
              </span>
                        ))}
                    </div>
                ),
        }),
        col.accessor('active', {
            header: 'Status',
            enableSorting: false,
            cell: (info) => <StatusBadge code={info.getValue() ? 'ACTIVE' : 'INACTIVE'} tones={ACTIVE_TONES} />,
        }),
        col.accessor('createdDate', { header: 'Created', cell: (info) => formatDate(info.getValue()) }),
        col.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <button
                    type="button"
                    className="btn btn-surface btn-xs"
                    disabled={!row.original.active}
                    title={row.original.active ? undefined : 'Inactive accounts can’t have their roles changed'}
                    onClick={() => onEditRoles(row.original)}
                >
                    Edit roles
                </button>
            ),
        }),
    ])
}

export function AdminUsersPage() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const { user: me } = useAuth()
    const roles = useAdminRoles()
    const [editing, setEditing] = useState<AdminUser | null>(null)
    const columns = useMemo(() => buildColumns(setEditing), [])

    const update = useCallback(
        (patch: Partial<typeof search>, options?: { replace?: boolean }) =>
            void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: options?.replace }),
        [navigate],
    )
    const { pagination, sorting, onPaginationChange, onSortingChange, params } = useUrlPageState(search, update, 'userName,asc')

    // Typing updates the URL after a pause, and replaces the history entry so Back isn't flooded with keystrokes.
    const [text, setText] = useState(search.query ?? '')
    const debounce = useRef<number | undefined>(undefined)
    function onTextChange(value: string) {
        setText(value)
        window.clearTimeout(debounce.current)
        debounce.current = window.setTimeout(() => update({ query: value.trim() || undefined, page: 1 }, { replace: true }), 300)
    }
    useEffect(() => () => window.clearTimeout(debounce.current), [])
    // Back/forward changes the URL under us — pull the box in line, but never fight what's being typed.
    useEffect(() => {
        setText((prev) => (prev.trim() === (search.query ?? '') ? prev : (search.query ?? '')))
    }, [search.query])

    const query = useAdminUsers({ ...params, query: search.query, role: search.role, active: search.active })
    const hasFilters = Boolean(search.query || search.role || search.active !== undefined)

    return (
        <>
            <PageHeader title="Users & Roles" description="Who can sign in, and what each person is allowed to do." />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <label className="relative">
                    <span className="sr-only">Search users</span>
                    <Search size={15} className="text-base-content/50 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2" aria-hidden="true" />
                    <input
                        type="search"
                        className="input input-sm input-bordered w-64 pl-9"
                        placeholder="Search name, username or email"
                        value={text}
                        onChange={(e) => onTextChange(e.target.value)}
                    />
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/70">Role</span>
                    <select className="select select-sm select-bordered" value={search.role ?? ''} onChange={(e) => update({ role: e.target.value || undefined, page: 1 })}>
                        <option value="">All</option>
                        {roles.data?.map((r) => (
                            <option key={r.roleId} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/70">Status</span>
                    <select
                        className="select select-sm select-bordered"
                        value={search.active === undefined ? '' : String(search.active)}
                        onChange={(e) => update({ active: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 })}
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </label>
            </div>

            {query.isError && !query.data ? (
                <ErrorState error={query.error} onRetry={() => void query.refetch()} />
            ) : (
                <DataTable
                    caption="Users"
                    columns={columns}
                    data={query.data?.items ?? []}
                    meta={query.data?.meta}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    isLoading={query.isLoading}
                    isFetching={query.isFetching}
                    getRowId={(u) => String(u.userId)}
                    emptyState={
                        <EmptyState
                            title={hasFilters ? 'No users match these filters' : 'No users yet'}
                            description={hasFilters ? 'Try a different search, role or status.' : 'Accounts created through provisioning will appear here.'}
                            action={
                                hasFilters ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={() => {
                                            setText('')
                                            update({ query: undefined, role: undefined, active: undefined, page: 1 })
                                        }}
                                    >
                                        Clear filters
                                    </button>
                                ) : undefined
                            }
                        />
                    }
                />
            )}

            <Modal open={editing !== null} title={editing ? `Roles · ${editing.displayName}` : 'Roles'} onClose={() => setEditing(null)}>
                {editing && <UserRolesForm key={editing.userId} user={editing} isSelf={editing.userId === me?.id} onDone={() => setEditing(null)} />}
            </Modal>
        </>
    )
}