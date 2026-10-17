import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PageParams } from '@/lib/api/types'
import { adminUsersApi } from './api'
import type { AdminUserFilters } from './types'

export const adminKeys = {
    all: ['admin'] as const,
    users: (params: PageParams & AdminUserFilters) => [...adminKeys.all, 'users', params] as const,
    roles: () => [...adminKeys.all, 'roles'] as const,
}

export function useAdminUsers(params: PageParams & AdminUserFilters) {
    return useQuery({
        queryKey: adminKeys.users(params),
        queryFn: () => adminUsersApi.list(params),
        placeholderData: keepPreviousData,
    })
}

export function useAdminRoles() {
    return useQuery({ queryKey: adminKeys.roles(), queryFn: adminUsersApi.roles, staleTime: 5 * 60_000 })
}

