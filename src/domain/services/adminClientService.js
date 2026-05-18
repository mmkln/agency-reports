import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import { createClientInvitation } from './clientInviteService'
import { USER_ROLES } from '../../entities/profile'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PORTAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_CLIENT_STATUSES = new Set(Object.values(CLIENT_STATUSES))
const VALID_CLIENT_TYPES = new Set(Object.values(CLIENT_TYPES))

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage clients.')
  }
}

export function normalizePortalSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function requireText(value, fieldName) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function assertEmail(value, fieldName) {
  const normalizedValue = requireText(value, fieldName)

  if (!EMAIL_PATTERN.test(normalizedValue)) {
    throw new Error(`${fieldName} must be a valid email address.`)
  }

  return normalizedValue
}

function assertLogoValue(value) {
  const normalizedValue = value?.trim() ?? ''

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.startsWith('data:image/')) {
    return normalizedValue
  }

  try {
    const url = new URL(normalizedValue)

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return normalizedValue
    }
  } catch {
    // Fall through to the shared validation error.
  }

  throw new Error('Logo must be an image upload or a valid http(s) URL.')
}

function assertClientStatus(status) {
  const normalizedStatus = status || CLIENT_STATUSES.SETUP

  if (!VALID_CLIENT_STATUSES.has(normalizedStatus)) {
    throw new Error('Client status is invalid.')
  }

  return normalizedStatus
}

function assertClientType(type) {
  const normalizedType = type || CLIENT_TYPES.GENERIC

  if (!VALID_CLIENT_TYPES.has(normalizedType)) {
    throw new Error('Client type is invalid.')
  }

  return normalizedType
}

export function getPortalSlugIssue({ ignoreClientId = null, repositories, viewer, portalSlug }) {
  assertAgencyAdmin(viewer)

  const normalizedSlug = normalizePortalSlug(portalSlug)

  if (!normalizedSlug) {
    return 'Portal slug is required.'
  }

  if (normalizedSlug.length < 3) {
    return 'Portal slug must be at least 3 characters.'
  }

  if (!PORTAL_SLUG_PATTERN.test(normalizedSlug)) {
    return 'Portal slug can contain lowercase letters, numbers, and hyphens only.'
  }

  const existingClient = repositories.clients
    .list()
    .find((client) => (
      client.agency_id === viewer.agencyId
      && client.portal_slug === normalizedSlug
      && client.id !== ignoreClientId
    ))

  if (existingClient) {
    return 'This portal slug is already used by another client.'
  }

  return ''
}

export function listAdminClients({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  return repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function createAdminClient({
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const name = requireText(input.name, 'Client name')
  const primaryContactEmail = assertEmail(input.primaryContactEmail, 'Primary contact email')
  const primaryContactName = requireText(input.primaryContactName, 'Primary contact name')
  const portalSlug = normalizePortalSlug(input.portalSlug || name)
  const portalSlugIssue = getPortalSlugIssue({
    portalSlug,
    repositories,
    viewer,
  })
  const timestamp = now()

  if (portalSlugIssue) {
    throw new Error(portalSlugIssue)
  }

  const client = {
    agency_id: viewer.agencyId,
    created_at: timestamp,
    current_focus: [],
    id: idGenerator(),
    logo_url: assertLogoValue(input.logoUrl),
    name,
    portal_slug: portalSlug,
    primary_contact_email: primaryContactEmail,
    primary_contact_name: primaryContactName,
    status: assertClientStatus(input.status),
    type: assertClientType(input.type),
    updated_at: timestamp,
  }

  repositories.clients.upsert(client)
  const invitation = createClientInvitation({
    clientId: client.id,
    email: primaryContactEmail,
    idGenerator,
    name: primaryContactName,
    now,
    repositories,
    viewer,
  })

  return {
    client,
    invitation,
  }
}

export function updateAdminClient({
  clientId,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const existingClient = repositories.clients.findById(clientId)

  if (!existingClient || existingClient.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found.')
  }

  const name = requireText(input.name, 'Client name')
  const primaryContactEmail = assertEmail(input.primaryContactEmail, 'Primary contact email')
  const primaryContactName = requireText(input.primaryContactName, 'Primary contact name')
  const portalSlug = normalizePortalSlug(input.portalSlug || name)
  const portalSlugIssue = getPortalSlugIssue({
    ignoreClientId: existingClient.id,
    portalSlug,
    repositories,
    viewer,
  })

  if (portalSlugIssue) {
    throw new Error(portalSlugIssue)
  }

  const updatedClient = {
    ...existingClient,
    logo_url: assertLogoValue(input.logoUrl),
    name,
    portal_slug: portalSlug,
    primary_contact_email: primaryContactEmail,
    primary_contact_name: primaryContactName,
    status: assertClientStatus(input.status || existingClient.status),
    type: assertClientType(input.type || existingClient.type),
    updated_at: now(),
  }

  repositories.clients.upsert(updatedClient)

  return updatedClient
}

export function deleteAdminClient({
  clientId,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found.')
  }

  repositories.projects.listByClientId(clientId).forEach((record) => repositories.projects.deleteById(record.id))
  repositories.tasks.listByClientId(clientId).forEach((record) => repositories.tasks.deleteById(record.id))
  repositories.updates.listByClientId(clientId).forEach((record) => repositories.updates.deleteById(record.id))
  repositories.neededFromClient.listByClientId(clientId).forEach((record) => repositories.neededFromClient.deleteById(record.id))
  repositories.dashboardLinks.listByClientId(clientId).forEach((record) => repositories.dashboardLinks.deleteById(record.id))
  repositories.reports.listByClientId(clientId).forEach((record) => repositories.reports.deleteById(record.id))
  repositories.clientInvitations.listByClientId(clientId).forEach((record) => repositories.clientInvitations.deleteById(record.id))
  repositories.clientMemberships.listByClientId(clientId).forEach((record) => repositories.clientMemberships.deleteById(record.id))
  repositories.clinicProfiles?.listByClientId(clientId).forEach((record) => repositories.clinicProfiles.deleteById(record.id))
  repositories.clinicLocations?.listByClientId(clientId).forEach((record) => repositories.clinicLocations.deleteById(record.id))
  repositories.clinicServiceLines?.listByClientId(clientId).forEach((record) => repositories.clinicServiceLines.deleteById(record.id))
  repositories.bookingPipelineSnapshots?.listByClientId(clientId)
    .forEach((record) => repositories.bookingPipelineSnapshots.deleteById(record.id))
  repositories.locationPerformance?.listByClientId(clientId)
    .forEach((record) => repositories.locationPerformance.deleteById(record.id))
  repositories.serviceLinePerformance?.listByClientId(clientId)
    .forEach((record) => repositories.serviceLinePerformance.deleteById(record.id))
  repositories.clients.deleteById(clientId)

  return true
}
