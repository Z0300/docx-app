import { useAppForm } from '@/components/form/form'
import { getErrorMessage } from '@/lib/api/errors'
import { ACTION_LABELS } from './constants'
import { applyActionSchema } from './schema'
import {useApplyAction} from './mutations'
import type { ApprovalActionCode } from './types'

const REVIEW_STEP_ACTIONS: ApprovalActionCode[] = ['REFER_RETURN', 'REFER_APPROVE', 'REFER_ABSTAIN']
const APPROVAL_STEP_ACTIONS: ApprovalActionCode[] = ['APPROVE', 'REJECT']

export function ApprovalActionForm({ documentId, stepId, currentStepName }: { documentId: number; stepId: number; currentStepName: string }) {
    const applyAction = useApplyAction(documentId)
    // Inferred from step naming convention (DocumentCreationService: step 1 = "Review") — see note in chat.
    const availableActions = currentStepName === 'Review' ? REVIEW_STEP_ACTIONS : APPROVAL_STEP_ACTIONS

    const form = useAppForm({
        defaultValues: { stepId, actionCode: '' as ApprovalActionCode | '', comments: '' },
        validators: { onChange: applyActionSchema },
        onSubmit: async ({ value }) => {
            await applyAction.mutateAsync(applyActionSchema.parse(value)).then(() => form.reset()).catch(() => undefined)
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
            <form.AppField name="actionCode">
                {(field) => (
                    <field.SelectField
                        label="Action"
                        required
                        options={availableActions.map((code) => ({ value: code, label: ACTION_LABELS[code] }))}
                    />
                )}
            </form.AppField>

            <form.AppField name="comments">{(field) => <field.TextAreaField label="Comments" hint="Optional" rows={3} />}</form.AppField>

            {applyAction.isError && (
                <p role="alert" className="alert alert-error alert-soft text-sm">
                    {getErrorMessage(applyAction.error)}
                </p>
            )}

            <form.AppForm>
                <form.SubmitButton>Submit decision</form.SubmitButton>
            </form.AppForm>
        </form>
    )
}