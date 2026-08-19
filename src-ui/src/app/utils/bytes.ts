/**
 * Formats a byte count as a short human-readable string (e.g. "12.4 GB").
 * Uses binary (1024) steps, matching how disk usage is typically reported.
 */
export function formatBytes(bytes: number): string {
  if (bytes == null || isNaN(bytes)) {
    return ''
  }
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, exponent)

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}
