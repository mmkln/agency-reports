import { ROUTE_PATHS, withSearchParams } from '@/domain/navigation/routePaths'
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

export function getPrimaryWorkspace(client) {
  return client?.workspaces?.[0] ?? null
}

export function getPreviewPortalHref(client) {
  const workspace = getPrimaryWorkspace(client)

  return workspace ? withSearchParams(ROUTE_PATHS.portalGrowthReview, { clientId: workspace.id }) : ''
}

export function getPrimaryContact(memberships) {
  return memberships.find((membership) => membership.status === 'active')
    ?? memberships[0]
    ?? null
}

export function buildPortalReadinessItems({ client, memberships }) {
  const primaryWorkspace = getPrimaryWorkspace(client)
  const hasActiveUser = memberships.some((membership) => membership.status === 'active')

  return [
    {
      label: 'Workspace',
      meta: primaryWorkspace
        ? { icon: 'checkCircle2', label: 'Ready', tone: 'green' }
        : { icon: 'circleX', label: 'Missing', tone: 'rose' },
    },
    {
      label: 'Portal preview',
      meta: primaryWorkspace
        ? { icon: 'checkCircle2', label: 'Ready', tone: 'green' }
        : { icon: 'circleX', label: 'Missing', tone: 'rose' },
    },
    {
      label: 'Client access',
      meta: hasActiveUser
        ? { icon: 'checkCircle2', label: 'Ready', tone: 'green' }
        : { icon: 'clock', label: 'Not invited', tone: 'amber' },
    },
    {
      label: 'Dashboard',
      meta: { icon: 'clock', label: 'Not checked', tone: 'neutral' },
    },
    {
      label: 'Latest report',
      meta: { icon: 'clock', label: 'Not checked', tone: 'neutral' },
    },
    {
      label: 'Needed actions',
      meta: { icon: 'clock', label: 'Not checked', tone: 'neutral' },
    },
  ]
}
