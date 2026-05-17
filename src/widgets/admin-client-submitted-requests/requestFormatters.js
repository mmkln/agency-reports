export function formatDate(value) {
  if (!value) {
    return 'No date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

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

export function filterRequests(requests, statusFilter) {
  if (statusFilter === 'all') {
    return requests
  }

  if (statusFilter === 'open') {
    return requests.filter((request) => !['archived', 'completed', 'declined'].includes(request.status))
  }

  if (statusFilter === 'needs_review') {
    return requests.filter((request) => ['submitted', 'under_review'].includes(request.status))
  }

  return requests.filter((request) => request.status === statusFilter)
}
