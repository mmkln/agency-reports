export function formatDate(value) {
  if (!value) {
    return 'Not set'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatPeriod(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`
}

export function takeRecent(items, limit = 3) {
  return [...items].slice(0, limit)
}
