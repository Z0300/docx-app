import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { SelectField, SubmitButton, TextAreaField, TextField } from './fields'

/**
 * App-wide form hook. Usage:
 *
 *   const form = useAppForm({ defaultValues, validators: { onChange: schema }, onSubmit })
 *   <form.AppField name="title">{(f) => <f.TextField label="Title" />}</form.AppField>
 *   <form.AppForm><form.SubmitButton>Save changes</form.SubmitButton></form.AppForm>
 *
 * Add new field types (checkbox, date, combobox…) in `fields.tsx` and register them here.
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextAreaField, SelectField },
  formComponents: { SubmitButton },
})
