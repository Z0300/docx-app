import {createFileRoute} from '@tanstack/react-router'
import {requireRoles} from "@/lib/auth/guards.ts";
import {documentSearchSchema} from "@/features/documents/schema.ts";
import {AuditDocumentsPage} from "@/features/audit/AuditDocumentsPage.tsx";

export const Route = createFileRoute('/_authenticated/audit/documents')({
    beforeLoad: requireRoles('ADMIN', 'AUDITOR'),
    validateSearch: documentSearchSchema,
    component: AuditDocumentsPage,
})

