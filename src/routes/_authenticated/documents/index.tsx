import { createFileRoute } from '@tanstack/react-router'
import {DocumentsQueuePage} from "@/features/documents/DocumentsQueuePage.tsx";

export const Route = createFileRoute('/_authenticated/documents/')({
  component: DocumentsQueuePage,
})

