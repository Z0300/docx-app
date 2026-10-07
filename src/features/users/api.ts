
import { api } from '@/lib/api/request'
import type { UserSummary } from './types'

export const usersApi = {
    searchByRole: (role: string, query: string) =>
        api.get<UserSummary[]>('/users/search', { params: { role, query } }),
}