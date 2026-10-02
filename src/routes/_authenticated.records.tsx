import { createFileRoute } from '@tanstack/react-router'
import { RecordsPage } from '@/features/records/RecordsPage'
import { recordsSearchSchema } from '@/features/records/schema'

// autoCodeSplitting (vite.config.ts) turns this into its own chunk automatically —
// no manual createLazyRoute/lazy() needed here.
export const Route = createFileRoute('/_authenticated/records')({
  validateSearch: recordsSearchSchema,
  component: RecordsPage,
})
