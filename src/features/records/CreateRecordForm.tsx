import { useAppForm } from '@/components/form/form'
import { getErrorMessage } from '@/lib/api/errors'
import { humanizeCode } from '@/lib/utils/format'
import { createRecordSchema } from './schema'
import { useCreateRecord } from './queries'
import { RECORD_STATUSES } from './types'

const STATUS_OPTIONS = RECORD_STATUSES.map((s) => ({ value: s, label: humanizeCode(s) }))

export function CreateRecordForm({ onDone }: { onDone: () => void }) {
  const create = useCreateRecord()

  const form = useAppForm({
    defaultValues: { title: '', description: '', status: '' as string },
    validators: { onChange: createRecordSchema },
    onSubmit: async ({ value }) => {
      await create.mutateAsync(createRecordSchema.parse(value)).then(onDone).catch(() => undefined)
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
      <form.AppField name="title">{(f) => <f.TextField label="Title" required />}</form.AppField>
      <form.AppField name="description">
        {(f) => <f.TextAreaField label="Description" hint="Optional. Up to 500 characters." />}
      </form.AppField>
      <form.AppField name="status">
        {(f) => <f.SelectField label="Status" options={STATUS_OPTIONS} required />}
      </form.AppField>

      {create.isError && (
        <p role="alert" className="alert alert-error alert-soft text-sm">
          {getErrorMessage(create.error)}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn" onClick={onDone}>
          Cancel
        </button>
        <form.AppForm>
          <form.SubmitButton>Create record</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  )
}
