/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023, 12:00 PM")
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'

  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date string or Date object into a date-only string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDateOnly = (date) => {
  if (!date) return 'N/A'

  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get the time difference from now in a human-readable format
 * @param {string|Date} date - The date to compare with current time
 * @returns {string} Time difference string (e.g., "2 days ago", "5 minutes ago")
 */
export const timeAgo = (date) => {
  if (!date) return 'N/A'

  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  const seconds = Math.floor((new Date() - d) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)

    if (interval >= 1) {
      return interval === 1
        ? `${interval} ${unit} ago`
        : `${interval} ${unit}s ago`
    }
  }

  return 'just now'
}
