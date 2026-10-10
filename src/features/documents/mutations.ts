import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type CreateDocumentPayload, documentsApi} from "@/features/documents/api.ts";
import {saveBlob} from "@/lib/utils/download.ts";
import type {ApplyActionInput, CancelDocumentInput, ResubmitInput} from "@/features/documents/schema.ts";
import {documentKeys} from "@/features/documents/queries.ts";
import {useState} from "react";
import {toast} from "@/stores/toastStore.ts";

export function useCreateDocument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateDocumentPayload) => documentsApi.create(input),
        meta: {successMessage: 'Document submitted'},
        onSuccess: () => queryClient.invalidateQueries({queryKey: documentKeys.all}),
    })
}

export function useDownloadFile(documentId: number) {
    return useMutation({
        mutationFn: (version?: number) => documentsApi.downloadFile(documentId, version),
        onSuccess: ({blob, fileName}) => saveBlob(blob, fileName),
    })
}

/** Covers approve / reject / refer-return / refer-approve / refer-abstain — one action, one endpoint. */
export function useApplyAction(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: ApplyActionInput) => documentsApi.applyAction(documentId, input),
        onSuccess: (result) => {
            toast.success(`Action recorded — status is now ${result.newStatus}`)
            void queryClient.invalidateQueries({queryKey: documentKeys.detail(documentId)})
            void queryClient.invalidateQueries({queryKey: documentKeys.queue()})
        },
    })
}

export function useResubmitDocument(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: ResubmitInput) => documentsApi.resubmit(documentId, input),
        meta: {successMessage: 'Document resubmitted for review'},
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: documentKeys.detail(documentId)})
            void queryClient.invalidateQueries({queryKey: documentKeys.queue()})
        },
    })
}

export function useCancelDocument(documentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CancelDocumentInput) => documentsApi.cancel(documentId, input),
        meta: {successMessage: 'Document cancelled'},
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: documentKeys.detail(documentId)})
            void queryClient.invalidateQueries({queryKey: documentKeys.queue()})
        },
    })
}

export function useUploadFile() {
    const [progress, setProgress] = useState(0)
    const mutation = useMutation({
        mutationFn: (file: File) => documentsApi.uploadFile(file, setProgress),
        meta: {silent: true},
        onMutate: () => setProgress(0),
    })
    return {...mutation, progress}
}
