import { createFileRoute } from '@tanstack/react-router'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { adminUsersSearchSchema } from '@/features/admin/schema'
import { requireRoles } from '@/lib/auth/guards'

export const Route = createFileRoute('/_authenticated/admin/users')({
    beforeLoad: requireRoles('ADMIN'),
    validateSearch: adminUsersSearchSchema,
    component: AdminUsersPage,
})