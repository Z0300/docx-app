import { api } from '@/lib/api/request'
import type { PageParams } from '@/lib/api/types'
import type { CreateRecordInput } from './schema'
import type { RecordFilters, RecordItem } from './types'

export const recordsApi = {
  list: (params: PageParams & RecordFilters) => api.getPage<RecordItem, RecordFilters>('/records', params),
  create: (input: CreateRecordInput) => api.post<RecordItem, CreateRecordInput>('/records', input),
}
