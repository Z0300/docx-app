/**
 * Response contract shared with the backend ("result pattern").
 * If your API wraps responses differently, this file and `request.ts` are the only places to change.
 */
export interface PageMeta {
  page: number // 0-based, matches Spring's Pageable
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ApiSuccess<T> {
  success: boolean
  message: string
  data: T | null
  meta: PageMeta | null
}

/** Error body returned by the backend's global exception handler. */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  /** Optional field-level validation errors, if the backend sends them. */
  errors?: Record<string, string> | string[]
}

export interface Paged<T> {
  items: T[]
  meta: PageMeta
}

/** Query params understood by every Spring `Pageable` endpoint. */
export interface PageParams {
  page: number
  size: number
  /** "property,asc" | "property,desc" */
  sort?: string
}
