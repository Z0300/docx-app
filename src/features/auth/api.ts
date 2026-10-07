import {api} from '@/lib/api/request'
import type {AuthUser} from '@/stores/authStore'
import type {LoginInput} from './schema'
import type {LoginResponse, LoginResponseDto} from "@/features/auth/types.ts";

/**
 * ADAPT HERE: the shape your login endpoint returns.
 * Assumed: POST /auth/login { userName, password } -> ApiSuccess<{ accessToken, user }>
 * If your API returns only a token, decode the claims in `toSession` (see lib/auth/jwt.ts).
 */


export const authApi = {
    login: async (input: LoginInput): Promise<LoginResponse> => {
        const {accessToken, user} = await api.post<LoginResponseDto, LoginInput>('/auth/login', input)
        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                roles: (user.roles ?? []).map((r) => r.name),
            },
        }
    },
}

export function toSession(response: LoginResponse): { token: string; user: AuthUser } {
    return {token: response.accessToken, user: response.user}
}
