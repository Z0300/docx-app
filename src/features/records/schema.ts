import { z } from 'zod'
import { pageSearchSchema } from '@/components/table/searchSchema'
import { RECORD_STATUSES } from './types'

export const createRecordSchema = z.object({
  title: z.string().trim().min(3, 'Title needs at least 3 characters').max(120, 'Title can be at most 120 characters'),
  description: z.string().max(500, 'Description can be at most 500 characters'),
  status: z.enum(RECORD_STATUSES, 'Choose a status'),
})

export type CreateRecordInput = z.infer<typeof createRecordSchema>

/** The list page's URL: paging + sort + the status filter. */
export const recordsSearchSchema = pageSearchSchema.extend({
  status: z.enum(RECORD_STATUSES).optional().catch(undefined).optional(),
})
