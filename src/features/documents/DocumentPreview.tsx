import { ExternalLink } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { usePdfPreview } from './queries'

export function DocumentPreview({ documentId, fileName }: { documentId: number; fileName: string }) {
    const preview = usePdfPreview(documentId)

    if (preview.isError) return <ErrorState error={preview.error} onRetry={() => void preview.refetch()} />

    // Also covers the one render between "blob arrived" and "object URL created".
    if (preview.isLoading || (preview.isPdf && !preview.url)) {
        return (
            <div role="status" className="border-base-300 bg-base-100 text-base-content/60 grid h-[75vh] place-items-center rounded-box border text-sm">
        <span className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm" aria-hidden="true" />
          Loading preview…
        </span>
            </div>
        )
    }

    if (!preview.isPdf || !preview.url) {
        return (
            <div className="border-base-300 bg-base-100 rounded-box border p-6 text-sm">
                <p className="font-medium">Preview isn&apos;t available for this file.</p>
                <p className="text-base-content/60 mt-1">Only PDF files can be previewed. Use Download to open it.</p>
            </div>
        )
    }

    return (
        <div className="border-base-300 bg-base-100 overflow-hidden rounded-box border">
            <div className="border-base-300 flex items-center justify-between gap-3 border-b px-4 py-2">
        <span className="text-body-sm truncate font-medium" title={fileName}>
          {fileName}
        </span>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs shrink-0">
                    Open in new tab <ExternalLink size={12} aria-hidden="true" />
                </a>
            </div>
            <iframe title={`Preview of ${fileName}`} src={preview.url} className="block h-[75vh] w-full" />
        </div>
    )
}