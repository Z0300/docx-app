export interface AdminRole {
    roleId: number
    name: string
    description: string | null
}

export interface AdminUser {
    userId: number
    userName: string
    displayName: string
    employeeNo: string | null
    email: string | null
    active: boolean
    roles: AdminRole[]
    createdDate: string
}

export interface AdminUserFilters {
    query?: string
    role?: string
    active?: boolean
}