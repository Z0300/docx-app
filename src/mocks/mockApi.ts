/**
 * In-memory fake backend so the template runs with no server (VITE_ENABLE_MOCK=true).
 * Delete this folder — and the `enableMock` branch in main.tsx — once you have a real API.
 * It mimics the backend contract: ApiSuccess envelope, 0-based paging, Spring-style `sort=field,dir`.
 */
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/lib/api/types'
import type { AuthUser } from '@/stores/authStore'
import type { RecordItem, RecordStatus } from '@/features/records/types'

const USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: { password: 'password', user: { id: 1, username: 'admin', roles: ['ADMIN'] } },
  approver: { password: 'password', user: { id: 2, username: 'approver', roles: ['APPROVER'] } },
}

const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const fakeJwt = (sub: string) => `${b64url({ alg: 'none' })}.${b64url({ sub, exp: Math.floor(Date.now() / 1000) + 8 * 3600 })}.mock`

const STATUSES: RecordStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED']
let nextId = 1
const records: RecordItem[] = Array.from({ length: 57 }, () => {
  const id = nextId++
  return {
    id,
    code: `REC-${String(id).padStart(5, '0')}`,
    title: `Sample record ${id}`,
    status: STATUSES[id % 3]!,
    createdDate: new Date(Date.now() - id * 3_600_000 * 5).toISOString(),
  }
})

function ok<T>(config: InternalAxiosRequestConfig, body: ApiSuccess<T>, status = 200): AxiosResponse<ApiSuccess<T>> {
  return { data: body, status, statusText: 'OK', headers: {}, config }
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  const response: AxiosResponse = {
    data: { timestamp: new Date().toISOString(), status, message },
    status,
    statusText: String(status),
    headers: {},
    config,
  }
  throw new AxiosError(message, String(status), config, null, response)
}

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

export function installMockApi() {
  apiClient.defaults.adapter = async (config) => {
    await delay()
    const url = (config.url ?? '').replace(/^\/api/, '')
    const method = (config.method ?? 'get').toLowerCase()

    if (url === '/auth/login' && method === 'post') {
      const { userName, password } = JSON.parse(config.data as string) as { userName: string; password: string }
      const entry = USERS[userName.toLowerCase()]
      if (!entry || entry.password !== password) fail(config, 401, 'Invalid username or password')
      return ok(config, {
        success: true,
        message: 'Signed in',
        data: { accessToken: fakeJwt(entry.user.username), user: entry.user },
        meta: null,
      })
    }

    if (url === '/records' && method === 'get') {
      const p = (config.params ?? {}) as { page?: number; size?: number; sort?: string; status?: string }
      const page = Number(p.page ?? 0)
      const size = Number(p.size ?? 25)
      let rows = p.status ? records.filter((r) => r.status === p.status) : [...records]

      if (p.sort) {
        const [field, dir] = p.sort.split(',') as [keyof RecordItem, string | undefined]
        rows.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0) * (dir === 'desc' ? -1 : 1))
      }

      const totalElements = rows.length
      const totalPages = Math.ceil(totalElements / size)
      rows = rows.slice(page * size, page * size + size)

      return ok(config, {
        success: true,
        message: 'Records retrieved successfully',
        data: rows,
        meta: { page, size, totalElements, totalPages, hasNext: page + 1 < totalPages, hasPrevious: page > 0 },
      })
    }

    if (url === '/records' && method === 'post') {
      const input = JSON.parse(config.data as string) as { title: string; status: RecordStatus }
      const id = nextId++
      const record: RecordItem = {
        id,
        code: `REC-${String(id).padStart(5, '0')}`,
        title: input.title,
        status: input.status,
        createdDate: new Date().toISOString(),
      }
      records.unshift(record)
      return ok(config, { success: true, message: 'Created', data: record, meta: null }, 201)
    }

    return fail(config, 404, `No mock for ${method.toUpperCase()} ${url}`)
  }
}
