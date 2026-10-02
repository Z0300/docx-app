import { api } from '@/lib/api/request'
import type { AuthUser } from '@/stores/authStore'
import type { LoginInput } from './schema'

/**
 * ADAPT HERE: the shape your login endpoint returns.
 * Assumed: POST /auth/login { userName, password } -> ApiSuccess<{ accessToken, user }>
 * If your API returns only a token, decode the claims in `toSession` (see lib/auth/jwt.ts).
 */
export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export const authApi = {
  login: (input: LoginInput) => api.post<LoginResponse, LoginInput>('/auth/login', input),
}

export function toSession(response: LoginResponse): { token: string; user: AuthUser } {
  return { token: response.accessToken, user: response.user }
}
