import type { AxiosRequestConfig } from 'axios'
import { apiClient } from './client'
import type { ApiSuccess, Paged, PageParams } from './types'

/** Drops undefined / null / empty-string params so they never reach the query string. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>
}

async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const { data } = await promise
  return data.data as T
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(apiClient.get(url, config)),

  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.post(url, body, config)),

  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.put(url, body, config)),

  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.patch(url, body, config)),

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.delete(url, config)),

  /** For paginated endpoints: returns the rows plus the `meta` block in one object. */
  async getPage<T, F extends object = object>(
    url: string,
    params: PageParams & F,
  ): Promise<Paged<T>> {
    const { data } = await apiClient.get<ApiSuccess<T[]>>(url, { params: cleanParams(params) })
    if (!data.meta) throw new Error(`Expected pagination meta from ${url}`)
    return { items: data.data ?? [], meta: data.meta }
  },
}
