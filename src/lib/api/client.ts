import axios from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'
import { toApiError } from './errors'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : ''
    const isLoginCall = url.includes('/auth/login')

    // An expired/invalid token anywhere except the login call itself ends the session.
    // <RequireAuth> reacts to the store change and redirects to /login.
    if (apiError.isUnauthorized && !isLoginCall && useAuthStore.getState().token) {
      useAuthStore.getState().logout('unauthorized')
    }
    return Promise.reject(apiError)
  },
)
