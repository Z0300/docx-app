export const RECORD_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const
export type RecordStatus = (typeof RECORD_STATUSES)[number]

export interface RecordItem {
  id: number
  code: string
  title: string
  status: RecordStatus
  createdDate: string
}

export interface RecordFilters {
  status?: RecordStatus | ''
}
