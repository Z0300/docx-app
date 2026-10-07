import {createFileRoute} from '@tanstack/react-router'
import {MySubmissionsPage} from "@/features/documents/MySubmissionsPage.tsx";

export const Route = createFileRoute('/_authenticated/documents/mine')({
    component: MySubmissionsPage,
})

