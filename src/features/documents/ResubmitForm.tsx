// ============================================================
// src/features/documents/ResubmitForm.tsx
// ============================================================

import { useAppForm } from '@/components/form/form'
import { getErrorMessage } from '@/lib/api/errors'
import { resubmitSchema } from './schema'
import { useResubmitDocument } from './queries'

export function ResubmitForm({ documentId }: { documentId: number }) {
    const resubmit = useResubmitDocument(documentId)

    const form = useAppForm({
        defaultValues: { fileName: '', filePath: '', changeComments: '' },
        validators: { onChange: resubmitSchema },
        onSubmit: async ({ value }) => {
            await resubmit.mutateAsync(resubmitSchema.parse(value)).then(() => form.reset()).catch(() => undefined)
        },
    })

    return (
        <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
            }}
        >
            {/* Standing in for a real file upload — see note on CreateDocumentPage below. */}
            <form.AppField name="fileName">{(field) => <field.TextField label="File name" required />}</form.AppField>
            <form.AppField name="filePath">{(field) => <field.TextField label="File path" required />}</form.AppField>
            <form.AppField name="changeComments">
                {(field) => <field.TextAreaField label="What changed" hint="Optional, but reviewers will want to know" rows={3} />}
            </form.AppField>

            {resubmit.isError && (
                <p role="alert" className="alert alert-error alert-soft text-sm">
                    {getErrorMessage(resubmit.error)}
                </p>
            )}

            <form.AppForm>
                <form.SubmitButton>Resubmit for review</form.SubmitButton>
            </form.AppForm>
        </form>
    )
}