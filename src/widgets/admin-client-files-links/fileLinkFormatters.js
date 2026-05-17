export function formatDateTime(value) {
  if (!value) {
    return 'No date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function filterFileLinks(fileLinks, statusFilter) {
  if (statusFilter === 'all') {
    return fileLinks
  }

  if (statusFilter === 'client_visible') {
    return fileLinks.filter((fileLink) => fileLink.visibility === 'client_visible')
  }

  if (statusFilter === 'internal') {
    return fileLinks.filter((fileLink) => fileLink.visibility === 'internal')
  }

  return fileLinks.filter((fileLink) => fileLink.status === statusFilter)
}
