import {z} from 'zod'
import {APPROVAL_ACTION_CODES, DOCUMENT_STATUSES} from './types'
import type {UserSummary} from "@/features/users/types.ts";
import { pageSearchSchema } from '@/components/table/searchSchema'

export const createDocumentSchema = z.object({
    documentTitle: z.string().trim().min(3, 'Title needs at least 3 characters').max(255),
    fileName: z.string().trim().min(1, 'Attach a file'),
    filePath: z.string().trim().min(1, 'Attach a file'),
    changeComments: z.string().max(1000),
    reviewer: z.custom<UserSummary>((v) => v !== null && typeof v === 'object', 'Choose a reviewer'),
    approvers: z.array(z.custom<UserSummary>()).min(1, 'Add at least one approver'),
})

export const applyActionSchema = z.object({
    stepId: z.number().int().positive(),
    actionCode: z.enum(APPROVAL_ACTION_CODES),
    comments: z.string().max(1000),
})
export type ApplyActionInput = z.infer<typeof applyActionSchema>

export const resubmitSchema = z.object({
    fileName: z.string().trim().min(1, 'Attach a file'),
    filePath: z.string().trim().min(1, 'Attach a file'),
    changeComments: z.string().max(1000),
})
export type ResubmitInput = z.infer<typeof resubmitSchema>

export const cancelDocumentSchema = z.object({
    reason: z.string().max(500).optional(),
})
export type CancelDocumentInput = z.infer<typeof cancelDocumentSchema>

export const documentSearchSchema = pageSearchSchema.extend({
    status: z.enum(DOCUMENT_STATUSES).optional().catch(undefined).optional(),
    originatorUserId: z.number().int().positive().optional().catch(undefined).optional(),
    from: z.string().optional().catch(undefined).optional(),
    to: z.string().optional().catch(undefined).optional(),
})


export const auditTransactionSearchSchema = pageSearchSchema.extend({
    documentId: z.number().int().positive().optional().catch(undefined).optional(),
    actionCode: z.enum(APPROVAL_ACTION_CODES).optional().catch(undefined).optional(),
    actionByUserId: z.number().int().positive().optional().catch(undefined).optional(),
    from: z.string().optional().catch(undefined).optional(),
    to: z.string().optional().catch(undefined).optional(),
})