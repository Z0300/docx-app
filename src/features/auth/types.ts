import type {AuthUser} from "@/stores/authStore.ts";

interface RoleDto {
    id: number
    name: string
    description?: string | null
}

export interface LoginResponseDto {
    accessToken: string
    expiresIn: number // ms
    user: { id: number; username: string; roles?: RoleDto[] | null }
}

export interface LoginResponse {
    accessToken: string
    user: AuthUser
}