import { z } from 'zod'

/**
 * URL search params shared by every paginated list. Extend it per page:
 *   const schema = pageSearchSchema.extend({ status: z.enum([...]).optional().catch(undefined) })
 *
 * `page` is 1-based in the URL (people read it), 0-based when sent to the API.
 * `.catch()` makes a hand-edited or stale URL fall back to a default instead of erroring; the trailing
 * `.default()` / `.optional()` keeps the param optional in `<Link search>` types (`.catch()` alone makes it required).
 */
export const pageSearchSchema = z.object({
  page: z.number().int().min(1).catch(1).default(1),
  size: z.number().int().min(1).max(200).catch(25).default(25),
  sort: z
    .string()
    .regex(/^[A-Za-z_][\w.]*,(asc|desc)$/)
    .optional()
    .catch(undefined)
    .optional(),
})

export type PageSearch = z.infer<typeof pageSearchSchema>
