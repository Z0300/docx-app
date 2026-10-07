import { useQuery } from '@tanstack/react-query'
import { usersApi } from './api'

export function useUserSearch(role: string, query: string) {
    return useQuery({
        queryKey: ['users', 'search', role, query],
        queryFn: () => usersApi.searchByRole(role, query),
        staleTime: 15_000,
    })
}