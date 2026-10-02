import { createFormHookContexts } from '@tanstack/react-form'

// Kept in its own file so field components can import the context hooks
// without creating a circular import with `form.ts`.
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()
