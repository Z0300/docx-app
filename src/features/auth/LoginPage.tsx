import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { env } from '@/config/env'
import { useAppForm } from '@/components/form/form'
import { getErrorMessage } from '@/lib/api/errors'
import { safeRedirect } from '@/lib/auth/guards'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema } from './schema'
import { useLogin } from './useLogin'

const REASON_TEXT = {
  expired: 'Your session has expired. Sign in again to continue.',
  unauthorized: 'You were signed out. Sign in again to continue.',
} as const

const route = getRouteApi('/login')

export function LoginPage() {
  const router = useRouter()
  const { redirect } = route.useSearch()
  const login = useLogin()
  const logoutReason = useAuthStore((s) => s.logoutReason)
  const clearLogoutReason = useAuthStore((s) => s.clearLogoutReason)

  const form = useAppForm({
    defaultValues: { username: '', password: '' },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      await login
        .mutateAsync(value)
        .then(() => router.navigate({ href: safeRedirect(redirect), replace: true }))
        .catch(() => undefined)
    },
  })

  useEffect(() => clearLogoutReason, [clearLogoutReason])

  return (
    <div className="bg-base-200 grid min-h-screen place-items-center p-4">
      <div className="bg-base-100 border-base-300 w-full max-w-sm rounded-box border p-7">
        <h1 className="text-xl font-semibold tracking-tight">Sign in to {env.appName}</h1>

        {logoutReason && !login.isError && (
          <p role="status" className="alert alert-info alert-soft mt-4 text-sm">
            {REASON_TEXT[logoutReason]}
          </p>
        )}

        <form
          className="mt-5 flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="username">
            {(field) => <field.TextField label="Username" autoComplete="username" required />}
          </form.AppField>

          <form.AppField name="password">
            {(field) => <field.TextField label="Password" type="password" autoComplete="current-password" required />}
          </form.AppField>

          {login.isError && (
            <p role="alert" className="alert alert-error alert-soft text-sm">
              {getErrorMessage(login.error)}
            </p>
          )}

          <form.AppForm>
            <form.SubmitButton className="btn-block">Sign in</form.SubmitButton>
          </form.AppForm>
        </form>
      </div>
    </div>
  )
}
