import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/lib/api/errors'
import {useCancelDocument} from "./mutations";

export function CancelDocumentButton({ documentId }: { documentId: number }) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const cancel = useCancelDocument(documentId)

    return (
        <>
            <button type="button" className="btn btn-surface btn-sm" onClick={() => setOpen(true)}>
                Cancel document
            </button>

            <Modal open={open} title="Cancel this document?" onClose={() => setOpen(false)}>
                <p className="text-base-content/70 mb-4 text-sm">
                    This cannot be undone. The document will be marked cancelled and removed from everyone's queue.
                </p>
                <label className="mb-1 block text-sm font-medium">Reason (optional)</label>
                <textarea className="textarea textarea-bordered mb-4 w-full" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />

                {cancel.isError && (
                    <p role="alert" className="alert alert-error alert-soft mb-4 text-sm">
                        {getErrorMessage(cancel.error)}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-surface" onClick={() => setOpen(false)}>
                        Keep document
                    </button>
                    <button
                        type="button"
                        className="btn btn-error"
                        disabled={cancel.isPending}
                        onClick={() => cancel.mutateAsync({ reason: reason || undefined }).then(() => setOpen(false)).catch(() => undefined)}
                    >
                        {cancel.isPending && <span className="loading loading-spinner loading-sm" />}
                        Confirm cancellation
                    </button>
                </div>
            </Modal>
        </>
    )
}