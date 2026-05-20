import {
  DASHBOARD_LINK_STATUSES,
  DASHBOARD_LINK_STATUS_META,
  DASHBOARD_PROVIDERS,
  DASHBOARD_PROVIDER_META,
} from '../../entities/dashboard-link'
import { USER_ROLES } from '../../entities/profile'
import { VISIBILITY } from '../../entities/update'

const VALID_DASHBOARD_PROVIDERS = new Set(Object.values(DASHBOARD_PROVIDERS))
const VALID_DASHBOARD_STATUSES = new Set(Object.values(DASHBOARD_LINK_STATUSES))
const VALID_VISIBILITY = new Set(Object.values(VISIBILITY))

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only admins can manage dashboard links.')
  }
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function normalizeText(value = '') {
  return String(value).trim()
}

function normalizeOptionalUrl(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol.')
    }
  } catch {
    throw new Error(`${fieldName} must be a valid http(s) URL.`)
  }

  return normalizedValue
}

function normalizeStatus(value, allowedStatuses, fallback, fieldName) {
  const normalizedValue = value || fallback

  if (!allowedStatuses.has(normalizedValue)) {
    throw new Error(`${fieldName} is invalid.`)
  }

  return normalizedValue
}

function normalizeDisplayOrder(value) {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.max(0, Math.round(parsedValue))
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Account was not found.')
  }

  return client
}

function getEditableDashboardLink({ dashboardLinkId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const dashboardLink = repositories.dashboardLinks.findById(dashboardLinkId)

  if (!dashboardLink) {
    throw new Error('Dashboard link was not found.')
  }

  getAdminClient({
    clientId: dashboardLink.client_id,
    repositories,
    viewer,
  })

  return dashboardLink
}

function mapDashboardLink({ client, dashboardLink }) {
  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    clientId: dashboardLink.client_id,
    createdAt: dashboardLink.created_at,
    description: dashboardLink.description ?? '',
    displayOrder: dashboardLink.display_order ?? 0,
    embedUrl: dashboardLink.embed_url ?? '',
    fallbackMessage: dashboardLink.fallback_message ?? '',
    id: dashboardLink.id,
    lastCheckedAt: dashboardLink.last_checked_at ?? null,
    name: dashboardLink.name,
    provider: dashboardLink.provider,
    providerMeta: DASHBOARD_PROVIDER_META[dashboardLink.provider] ?? {
      label: dashboardLink.provider,
    },
    publicUrl: dashboardLink.public_url ?? '',
    showOnOverview: Boolean(dashboardLink.show_on_overview),
    status: dashboardLink.status,
    statusMeta: DASHBOARD_LINK_STATUS_META[dashboardLink.status] ?? {
      label: dashboardLink.status,
      tone: 'neutral',
    },
    updatedAt: dashboardLink.updated_at,
    visibility: dashboardLink.visibility,
  }
}

function sortDashboardLinks(a, b) {
  return a.client.name.localeCompare(b.client.name)
    || Number(b.showOnOverview) - Number(a.showOnOverview)
    || a.displayOrder - b.displayOrder
    || a.name.localeCompare(b.name)
}

export function listAdminDashboardLinks({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const clientsById = new Map(
    repositories.clients
      .list()
      .filter((client) => client.agency_id === viewer.agencyId)
      .map((client) => [client.id, client]),
  )

  return repositories.dashboardLinks
    .list()
    .filter((dashboardLink) => clientsById.has(dashboardLink.client_id))
    .map((dashboardLink) => mapDashboardLink({
      client: clientsById.get(dashboardLink.client_id),
      dashboardLink,
    }))
    .sort(sortDashboardLinks)
}

export function getAdminDashboardLink({ dashboardLinkId, repositories, viewer }) {
  const dashboardLink = getEditableDashboardLink({
    dashboardLinkId,
    repositories,
    viewer,
  })
  const client = getAdminClient({
    clientId: dashboardLink.client_id,
    repositories,
    viewer,
  })

  return mapDashboardLink({ client, dashboardLink })
}

export function saveAdminDashboardLink({
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const existingDashboardLink = input.id
    ? getEditableDashboardLink({
        dashboardLinkId: input.id,
        repositories,
        viewer,
      })
    : null
  const clientId = input.clientId || input.client_id || existingDashboardLink?.client_id
  const client = getAdminClient({ clientId, repositories, viewer })
  const status = normalizeStatus(
    input.status,
    VALID_DASHBOARD_STATUSES,
    existingDashboardLink?.status || DASHBOARD_LINK_STATUSES.DRAFT,
    'Dashboard status',
  )
  const visibility = normalizeStatus(
    input.visibility,
    VALID_VISIBILITY,
    existingDashboardLink?.visibility || VISIBILITY.CLIENT_VISIBLE,
    'Dashboard visibility',
  )
  const embedUrl = normalizeOptionalUrl(input.embedUrl ?? input.embed_url, 'Dashboard embed URL')
  const publicUrl = normalizeOptionalUrl(input.publicUrl ?? input.public_url, 'Dashboard public URL')
  const name = normalizeText(input.name)

  if (!name) {
    throw new Error('Dashboard name is required.')
  }

  if (
    [DASHBOARD_LINK_STATUSES.ACTIVE, DASHBOARD_LINK_STATUSES.UNAVAILABLE].includes(status)
    && !embedUrl
    && !publicUrl
  ) {
    throw new Error('Active or unavailable dashboards must include a public or embed URL.')
  }

  const timestamp = now()
  const id = existingDashboardLink?.id || idGenerator()
  const showOnOverview = Boolean(input.showOnOverview ?? input.show_on_overview)

  if (showOnOverview) {
    repositories.dashboardLinks
      .listByClientId(client.id)
      .forEach((dashboardLink) => {
        if (dashboardLink.id !== id && dashboardLink.show_on_overview) {
          repositories.dashboardLinks.upsert({
            ...dashboardLink,
            show_on_overview: false,
            updated_at: timestamp,
          })
        }
      })
  }

  const dashboardLink = {
    client_id: client.id,
    created_at: existingDashboardLink?.created_at || timestamp,
    created_by: existingDashboardLink?.created_by || viewer.userId,
    description: normalizeText(input.description),
    display_order: normalizeDisplayOrder(input.displayOrder ?? input.display_order),
    embed_url: embedUrl,
    fallback_message: normalizeText(input.fallbackMessage ?? input.fallback_message)
      || 'Dashboard is temporarily unavailable. The latest monthly summary is still available below.',
    id,
    last_checked_at: input.lastCheckedAt ?? input.last_checked_at ?? existingDashboardLink?.last_checked_at ?? null,
    name,
    provider: normalizeStatus(
      input.provider,
      VALID_DASHBOARD_PROVIDERS,
      existingDashboardLink?.provider || DASHBOARD_PROVIDERS.LOOKER_STUDIO,
      'Dashboard provider',
    ),
    public_url: publicUrl,
    show_on_overview: showOnOverview,
    status,
    updated_at: timestamp,
    updated_by: viewer.userId,
    visibility,
  }

  repositories.dashboardLinks.upsert(dashboardLink)

  return mapDashboardLink({ client, dashboardLink })
}

export function updateAdminDashboardLinkStatus({
  dashboardLinkId,
  now = () => new Date().toISOString(),
  repositories,
  status,
  viewer,
}) {
  const dashboardLink = getEditableDashboardLink({
    dashboardLinkId,
    repositories,
    viewer,
  })

  return saveAdminDashboardLink({
    idGenerator: () => dashboardLink.id,
    input: {
      ...dashboardLink,
      embedUrl: dashboardLink.embed_url,
      fallbackMessage: dashboardLink.fallback_message,
      publicUrl: dashboardLink.public_url,
      showOnOverview: dashboardLink.show_on_overview,
      status,
    },
    now,
    repositories,
    viewer,
  })
}

export function deleteAdminDashboardLink({ dashboardLinkId, repositories, viewer }) {
  getEditableDashboardLink({
    dashboardLinkId,
    repositories,
    viewer,
  })

  return repositories.dashboardLinks.deleteById(dashboardLinkId)
}
