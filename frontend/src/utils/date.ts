/**
 * Date and time formatting utilities.
 */

/**
 * Parses UTC string ensuring proper timezone handling even if ISO string is naive.
 */
function parseUtcDate(dateString?: string): Date | null {
  if (!dateString) return null
  const cleanStr = String(dateString).trim()
  const utcStr =
    cleanStr.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(cleanStr)
      ? cleanStr
      : `${cleanStr}Z`
  const date = new Date(utcStr)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formats a past timestamp into a relative human-readable string (e.g. "Just now", "5m ago", "2h ago").
 */
export function formatRelativeTime(dateString?: string): string {
  const date = parseUtcDate(dateString)
  if (!date) return "Recently"

  const now = new Date()
  const diffSec = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  )

  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Formats a date that may be in the future or past (e.g. "In 5m", "In 2h", "3m ago").
 */
export function formatFutureOrRelativeTime(dateString?: string): string {
  const date = parseUtcDate(dateString)
  if (!date) return "—"

  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSec = Math.floor(Math.abs(diffMs) / 1000)

  if (diffMs > 0) {
    if (diffSec < 60) return "In < 1 min"
    const min = Math.floor(diffSec / 60)
    if (min < 60) return `In ${min}m`
    const hours = Math.floor(min / 60)
    if (hours < 24) {
      const remainingMin = min % 60
      return remainingMin > 0 ? `In ${hours}h ${remainingMin}m` : `In ${hours}h`
    }
    const days = Math.floor(hours / 24)
    return `In ${days}d`
  }

  if (diffSec < 60) return "Just now"
  const min = Math.floor(diffSec / 60)
  if (min < 60) return `${min}m ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Formats an exact date-time stamp in local format with seconds.
 */
export function formatExactDateTime(dateString?: string): string {
  const date = parseUtcDate(dateString)
  if (!date) return "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
