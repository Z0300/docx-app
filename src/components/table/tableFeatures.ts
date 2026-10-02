import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

/**
 * Every DataTable in the app is server-driven: the backend paginates and sorts, the table only
 * renders. That's why no row models (sorted/paginated) are registered — they'd re-do the work
 * client-side on a single page of data.
 */
export const serverTableFeatures = tableFeatures({ rowPaginationFeature, rowSortingFeature })
export type ServerTableFeatures = typeof serverTableFeatures

/** Typed column builder: `const col = createServerColumns<Row>()` then `col.accessor('field', {...})`. */
export const createServerColumns = <TData extends object>() =>
  createColumnHelper<ServerTableFeatures, TData>()
