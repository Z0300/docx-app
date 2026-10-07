import {createFileRoute} from '@tanstack/react-router'
import {requireRoles} from "@/lib/auth/guards.ts";
import {auditTransactionSearchSchema} from "@/features/documents/schema.ts";
import {AuditTransactionsPage} from "@/features/audit/AuditTransactionsPage.tsx";

export const Route = createFileRoute('/_authenticated/audit/transactions')({
    beforeLoad: requireRoles('ADMIN', 'AUDITOR'),
    validateSearch: auditTransactionSearchSchema,
    component: AuditTransactionsPage,
})

