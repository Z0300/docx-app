import { createFileRoute } from '@tanstack/react-router'
import {CreateDocumentPage} from "@/features/documents/CreateDocumentPage.tsx";

export const Route = createFileRoute('/_authenticated/documents/new')({
  component: CreateDocumentPage,
})

