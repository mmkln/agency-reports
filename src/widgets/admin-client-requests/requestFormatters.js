import {
  NEEDED_ACTION_STATUSES,
} from '../../entities/needed-from-client'

export const statusFilters = [
  { label: 'Open', value: 'open' },
  { label: 'Answered', value: NEEDED_ACTION_STATUSES.ANSWERED },
  { label: 'Resolved', value: NEEDED_ACTION_STATUSES.RESOLVED },
  { label: 'Cancelled', value: NEEDED_ACTION_STATUSES.CANCELLED },
  { label: 'All', value: 'all' },
]

export function formatDate(date) {
  if (!date) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  if (!date) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function getHistoryEventLabel(event) {
  const labels = {
    admin_cancelled: 'Request cancelled',
    admin_created: 'Request created',
    admin_reopened: 'Request reopened',
    admin_resolved: 'Request resolved',
    admin_updated: 'Request updated',
    client_answered: 'Client responded',
  }

  return labels[event?.type] ?? 'Request activity'
}

export function filterActions(actions, statusFilter) {
  if (statusFilter === 'all') {
    return actions
  }

  if (statusFilter === 'open') {
    return actions.filter((action) => [
      NEEDED_ACTION_STATUSES.PENDING,
      NEEDED_ACTION_STATUSES.ANSWERED,
    ].includes(action.status))
  }

  return actions.filter((action) => action.status === statusFilter)
}
