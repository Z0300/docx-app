/** Hands an in-memory Blob to the browser as a file download. */
export function saveBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Revoking synchronously can cancel the download in some browsers; give it time to start.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Reads the file name out of a Content-Disposition header. Handles Spring's RFC 5987 form
 *  (filename*=UTF-8''my%20file.pdf) as well as the plain filename="my file.pdf" form. */
export function fileNameFromDisposition(header: string | undefined | null): string | null {
    if (!header) return null

    const encoded = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)
    if (encoded?.[1]) {
        try {
            return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
        } catch {
            /* malformed escape sequence — fall through to the plain form */
        }
    }

    const plain = /filename="?([^";]+)"?/i.exec(header)
    return plain?.[1]?.trim() || null
}