export function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function filterUpdates(updates, filter) {
  if (filter === 'all') {
    return updates
  }

  if (filter === 'client_visible') {
    return updates.filter((update) => update.visibility === 'client_visible')
  }

  if (filter === 'internal') {
    return updates.filter((update) => update.visibility === 'internal')
  }

  return updates.filter((update) => update.type === filter)
}
