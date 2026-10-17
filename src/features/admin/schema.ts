import { z } from 'zod'
import { pageSearchSchema } from '@/components/table/searchSchema'

export const adminUsersSearchSchema = pageSearchSchema.extend({
    query: z.string().optional().catch(undefined).optional(),
    role: z.string().optional().catch(undefined).optional(),
    active: z.boolean().optional().catch(undefined).optional(),
})