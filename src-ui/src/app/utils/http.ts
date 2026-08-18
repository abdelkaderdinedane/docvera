/**
 * Extracts a support-friendly technical string from an HTTP error for use in
 * an error-state component's collapsed details section. Never returns raw
 * HTML (e.g. a Django debug page) — falls back to the HTTP status line.
 */
export function getHttpErrorDetail(error: any): string {
  if (!error) {
    return ''
  }
  if (typeof error === 'string') {
    return error
  }

  let detail: unknown = error?.error?.detail ?? error?.error ?? error?.message

  if (typeof detail === 'string' && /^\s*<(!doctype|html)/i.test(detail)) {
    detail = null
  }

  if (detail == null) {
    detail = [error.status, error.statusText].filter(Boolean).join(' ')
  }

  if (typeof detail === 'object') {
    try {
      detail = JSON.stringify(detail)
    } catch {
      detail = String(detail)
    }
  }

  return String(detail)
}

export function getFilenameFromContentDisposition(header: string): string {
  if (!header) {
    return null
  }

  // Try filename* (RFC 5987)
  const filenameStar = header.match(/filename\*=(?:UTF-\d['']*)?([^;]+)/i)
  if (filenameStar?.[1]) {
    try {
      return decodeURIComponent(filenameStar[1])
    } catch (e) {
      // Ignore decoding errors and fall through
    }
  }

  // Fallback to filename=
  const filenameMatch = header.match(/filename="?([^"]+)"?/)
  if (filenameMatch?.[1]) {
    return filenameMatch[1]
  }

  return null
}
