import { CLIENT_STATUS_META } from '@/entities/client'
import { WORKSPACE_STATUS_META } from '@/entities/workspace'

export const UNKNOWN_STATUS_META = Object.freeze({
  label: 'Unknown',
  tone: 'neutral',
})

export function formatDetailDate(value) {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getStatusMeta(metaMap, status) {
  return metaMap[status] ?? {
    ...UNKNOWN_STATUS_META,
    label: status || UNKNOWN_STATUS_META.label,
  }
}

export function getClientStatusMeta(client) {
  return getStatusMeta(CLIENT_STATUS_META, client?.status)
}

export function getWorkspaceStatusMeta(workspace) {
  return getStatusMeta(WORKSPACE_STATUS_META, workspace?.status)
}
