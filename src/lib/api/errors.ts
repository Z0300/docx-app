import axios from 'axios'
import type { ApiErrorBody } from './types'

/** Normalised error thrown by every request helper, so UI code never touches raw Axios errors. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  get isUnauthorized() {
    return this.status === 401
  }
  get isForbidden() {
    return this.status === 403
  }
  get isClientError() {
    return this.status >= 400 && this.status < 500
  }
}

const FALLBACKS: Record<number, string> = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was not valid.',
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to do that.',
  404: 'That record could not be found.',
  409: 'That change conflicts with the current state of the record.',
  500: 'Something went wrong on the server. Try again in a moment.',
}

// Spring surfaces exceptions as "IllegalArgumentException: actual message" — strip the class prefix.
function cleanMessage(message: string): string {
  return message.replace(/^[A-Za-z]+(Exception|Error):\s*/, '')
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status ?? 0
    const body = error.response?.data
    const raw = typeof body?.message === 'string' && body.message.trim() ? body.message : undefined
    const message = raw ? cleanMessage(raw) : (FALLBACKS[status] ?? FALLBACKS[status >= 500 ? 500 : 400]!)

    const fieldErrors: Record<string, string> = {}
    if (body?.errors && !Array.isArray(body.errors)) Object.assign(fieldErrors, body.errors)

    return new ApiError(message, status, fieldErrors)
  }

  if (error instanceof Error) return new ApiError(error.message, 0)
  return new ApiError('An unexpected error occurred.', 0)
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message
}
