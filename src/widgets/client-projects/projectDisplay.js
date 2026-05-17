import { CLIENT_WORK_ITEM_STATUS_META } from '../../entities/client-work-item'

export function formatDate(date) {
  if (!date) {
    return 'No target date'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No target date'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export function getStatusMeta(status) {
  return CLIENT_WORK_ITEM_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
}
