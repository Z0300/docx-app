import { useMutation } from '@tanstack/react-query'
import { authApi, toSession } from './api'
import { useAuthStore } from '@/stores/authStore'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: authApi.login,
    // The login form shows the error inline, so skip the global toast.
    meta: { silent: true },
    onSuccess: (response) => {
      const { token, user } = toSession(response)
      setSession(token, user)
    },
  })
}
