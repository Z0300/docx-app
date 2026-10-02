import { useId } from 'react'
import { useStore } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { useFieldContext, useFormContext } from './form-context'

/** Standard Schema (zod) issues arrive as `{ message }`; plain validators may return strings. */
function firstError(errors: unknown[]): string | null {
  for (const e of errors) {
    if (typeof e === 'string' && e) return e
    if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') return e.message
  }
  return null
}

interface BaseFieldProps {
  label: string
  hint?: string
  required?: boolean
}

function FieldShell({
  id,
  label,
  hint,
  required,
  error,
  children,
}: BaseFieldProps & { id: string; error: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-base-content/60 text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function useFieldError() {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (s) => s.meta.errors)
  const touched = useStore(field.store, (s) => s.meta.isTouched)
  const submitted = useStore(field.form.store, (s) => s.submissionAttempts > 0)
  return { field, error: touched || submitted ? firstError(errors) : null }
}

export function TextField({
  label,
  hint,
  required,
  type = 'text',
  placeholder,
  autoComplete,
}: BaseFieldProps & { type?: 'text' | 'password' | 'email' | 'number'; placeholder?: string; autoComplete?: string }) {
  const id = useId()
  const { field, error } = useFieldError()
  const value = field.state.value

  return (
    <FieldShell id={id} label={label} hint={hint} required={required} error={error}>
      <input
        id={id}
        name={field.name}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn('input input-bordered w-full', error && 'input-error')}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  hint,
  required,
  rows = 4,
  placeholder,
}: BaseFieldProps & { rows?: number; placeholder?: string }) {
  const id = useId()
  const { field, error } = useFieldError()
  const value = field.state.value

  return (
    <FieldShell id={id} label={label} hint={hint} required={required} error={error}>
      <textarea
        id={id}
        name={field.name}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn('textarea textarea-bordered w-full', error && 'textarea-error')}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export function SelectField({
  label,
  hint,
  required,
  options,
  placeholder = 'Select an option',
}: BaseFieldProps & { options: SelectOption[]; placeholder?: string }) {
  const id = useId()
  const { field, error } = useFieldError()
  const value = field.state.value

  return (
    <FieldShell id={id} label={label} hint={hint} required={required} error={error}>
      <select
        id={id}
        name={field.name}
        value={value ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn('select select-bordered w-full', error && 'select-error')}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const form = useFormContext()
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)

  return (
    <button type="submit" className={cn('btn btn-primary', className)} disabled={isSubmitting}>
      {isSubmitting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
      {children}
    </button>
  )
}
