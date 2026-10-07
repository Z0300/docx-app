import {ClipboardList, History, LayoutDashboard, SendHorizonal, ShieldCheck, Table2} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import type {LinkProps} from '@tanstack/react-router'

export interface NavItem {
    label: string
    /** Type-checked against the route tree — a typo here is a compile error. */
    to: LinkProps['to']
    icon: LucideIcon
    /** Omit for "any signed-in user". Roles are matched case-insensitively, without the ROLE_ prefix. */
    roles?: string[]
}

/**
 * Single source of truth for the sidebar. Route access itself is enforced in `app/router.tsx`
 * (hiding a link is a courtesy, not security — the API is what actually protects the data).
 */
export const navigation: NavItem[] = [
    {label: 'Dashboard', to: '/', icon: LayoutDashboard},
    {label: 'My Queue', to: '/documents', icon: ClipboardList, roles: ['APPROVER']},
    {label: 'My Submissions', to: '/documents/mine', icon: SendHorizonal, roles: ['SUBMITTER']},
    {label: 'All Documents', to: '/documents/search', icon: Table2, roles: ['ADMIN']},
    {label: 'Audit · Documents', to: '/audit/documents', icon: ShieldCheck, roles: ['AUDITOR', 'ADMIN']},
    {label: 'Audit · Transactions', to: '/audit/transactions', icon: History, roles: ['AUDITOR', 'ADMIN']},
]
