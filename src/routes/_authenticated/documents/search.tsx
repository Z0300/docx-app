import {createFileRoute} from '@tanstack/react-router'
import {requireRoles} from "@/lib/auth/guards.ts";
import {documentSearchSchema} from "@/features/documents/schema.ts";
import {AdminDocumentSearchPage} from "@/features/documents/AdminDocumentSearchPage.tsx";

export const Route = createFileRoute('/_authenticated/documents/search')({
    beforeLoad: requireRoles('ADMIN'),
    validateSearch: documentSearchSchema,
    component: AdminDocumentSearchPage,
})

