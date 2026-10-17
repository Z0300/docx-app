import { api } from '@/lib/api/request'
import type { PageParams } from '@/lib/api/types'
import type { AdminRole, AdminUser, AdminUserFilters } from './types'

export const adminUsersApi = {
    list: (params: PageParams & AdminUserFilters) => api.getPage<AdminUser, AdminUserFilters>('/admin/users', params),
    roles: () => api.get<AdminRole[]>('/admin/roles'),
    updateRoles: (userId: number, roleIds: number[]) =>
        api.put<AdminUser, { roleIds: number[] }>(`/admin/users/${userId}/roles`, { roleIds }),
}