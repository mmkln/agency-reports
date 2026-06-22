import { CLIENT_STATUSES } from '../../entities/client'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { createClientInvitation } from './clientInviteService'
import {
  AGENCY_WORKSPACE_RELATIONSHIP_STATUSES,
} from '../../entities/agency-workspace-relationship'
import {
  canCreateWorkspaceForAgency,
  canManageAgencyWorkspace,
} from '../policies/agencyAccessPolicy'
import { listManagedWorkspaceIds } from './viewerAccessContextService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PORTAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_CLIENT_STATUSES = new Set(Object.values(CLIENT_STATUSES))

function getViewerAgencyId(viewer) {
  return viewer?.activeAgencyId ?? null
}

function assertCanCreateWorkspace(viewer) {
  const agencyId = getViewerAgencyId(viewer)

  if (!canCreateWorkspaceForAgency(viewer, agencyId)) {
    throw new Error('Only admins can manage accounts.')
  }
}

function assertCanManageClientWorkspace({ clientId, repositories, viewer }) {
  const client = repositories.workspaces.findById(clientId)

  if (!client) {
    throw new Error('Client was not found.')
  }

  if (!canManageAgencyWorkspace(viewer, clientId)) {
    throw new Error('Client was not found.')
  }

  return client
}

function getManagedClientIds(viewer) {
  return new Set(listManagedWorkspaceIds(viewer))
}

function listClientsForViewer({ clients, viewer }) {
  const managedClientIds = getManagedClientIds(viewer)

  return clients.filter((client) => managedClientIds.has(client.id))
}

function upsertAgencyWorkspaceRelationship({
  agencyId,
  clientId,
  now,
  repositories,
}) {
  if (!repositories.agencyWorkspaceRelationships) {
    return null
  }

  const existingRelationship = repositories.agencyWorkspaceRelationships
    .list()
    .find((relationship) => (
      relationship.agency_id === agencyId
      && relationship.workspace_id === clientId
    ))

  const timestamp = now()
  const relationship = {
    agency_id: agencyId,
    created_at: existingRelationship?.created_at ?? timestamp,
    id: existingRelationship?.id ?? `${agencyId}:${clientId}:relationship`,
    status: AGENCY_WORKSPACE_RELATIONSHIP_STATUSES.ACTIVE,
    updated_at: timestamp,
    workspace_id: clientId,
  }

  repositories.agencyWorkspaceRelationships.upsert(relationship)

  return relationship
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

export function getPortalSlugIssueFromClients({
  clients = [],
  ignoreClientId = null,
  viewer,
  portalSlug,
}) {
  assertCanCreateWorkspace(viewer)

  const normalizedSlug = normalizePortalSlug(portalSlug)
  const agencyId = getViewerAgencyId(viewer)

  if (!normalizedSlug) {
    return 'Portal slug is required.'
  }

  if (normalizedSlug.length < 3) {
    return 'Portal slug must be at least 3 characters.'
  }

  if (!PORTAL_SLUG_PATTERN.test(normalizedSlug)) {
    return 'Portal slug can contain lowercase letters, numbers, and hyphens only.'
  }

  const existingClient = clients
    .find((client) => (
      client.agency_id === agencyId
      && client.portal_slug === normalizedSlug
      && client.id !== ignoreClientId
    ))

  if (existingClient) {
    return 'This portal slug is already used by another client.'
  }

  return ''
}

export function getPortalSlugIssue({ ignoreClientId = null, repositories, viewer, portalSlug }) {
  return getPortalSlugIssueFromClients({
    clients: repositories.workspaces.list(),
    ignoreClientId,
    portalSlug,
    viewer,
  })
}

export function listAdminClients({ repositories, viewer }) {
  assertCanCreateWorkspace(viewer)

  return repositories.workspaces
    .list()
    .filter((client) => listClientsForViewer({
      clients: [client],
      viewer,
    }).length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function listAgencyWorkspaceClients({ repositories, viewer }) {
  if (!viewer) {
    return []
  }

  return listClientsForViewer({
    clients: repositories.workspaces.list(),
    viewer,
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export function listAdminClientPendingInvitations({ repositories, viewer }) {
  const clients = listAdminClients({ repositories, viewer })
  const clientIds = new Set(clients.map((client) => client.id))

  return repositories.workspaceInvitations
    .list()
    .filter((invitation) => (
      clientIds.has(invitation.client_id)
      && invitation.status === CLIENT_INVITATION_STATUSES.PENDING
    ))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function createAdminClient({
  activityIdGenerator,
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertCanCreateWorkspace(viewer)

  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const name = requireText(input.name, 'Account name')
  const primaryContactEmail = assertEmail(input.primaryContactEmail, 'Primary contact email')
  const primaryContactName = requireText(input.primaryContactName, 'Primary contact name')
  const portalSlug = normalizePortalSlug(input.portalSlug || name)
  const portalSlugIssue = getPortalSlugIssue({
    portalSlug,
    repositories,
    viewer,
  })
  const timestamp = now()
  const agencyId = getViewerAgencyId(viewer)

  if (portalSlugIssue) {
    throw new Error(portalSlugIssue)
  }

  const client = {
    agency_id: agencyId,
    created_at: timestamp,
    current_focus: [],
    id: idGenerator(),
    logo_url: assertLogoValue(input.logoUrl),
    name,
    portal_slug: portalSlug,
    primary_contact_email: primaryContactEmail,
    primary_contact_name: primaryContactName,
    status: assertClientStatus(input.status),
    updated_at: timestamp,
  }

  repositories.workspaces.upsert(client)
  const relationship = upsertAgencyWorkspaceRelationship({
    agencyId,
    clientId: client.id,
    now,
    repositories,
  })
  const invitationViewer = relationship
    ? {
        ...viewer,
        managedWorkspaceRelationships: [
          ...(viewer.managedWorkspaceRelationships ?? []),
          {
            agencyId: relationship.agency_id,
            id: relationship.id,
            status: relationship.status,
            workspaceId: relationship.workspace_id,
          },
        ],
      }
    : viewer
  const invitation = createClientInvitation({
    activityIdGenerator,
    clientId: client.id,
    email: primaryContactEmail,
    idGenerator,
    name: primaryContactName,
    now,
    repositories,
    viewer: invitationViewer,
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
  const existingClient = assertCanManageClientWorkspace({ clientId, repositories, viewer })

  const name = requireText(input.name, 'Account name')
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
    updated_at: now(),
  }

  repositories.workspaces.upsert(updatedClient)

  return updatedClient
}

export function deleteAdminClient({
  clientId,
  repositories,
  viewer,
}) {
  assertCanManageClientWorkspace({ clientId, repositories, viewer })

  repositories.projects.listByWorkspaceId(clientId).forEach((record) => repositories.projects.deleteById(record.id))
  repositories.tasks.listByWorkspaceId(clientId).forEach((record) => repositories.tasks.deleteById(record.id))
  repositories.updates.listByWorkspaceId(clientId).forEach((record) => repositories.updates.deleteById(record.id))
  repositories.neededFromClient.listByWorkspaceId(clientId).forEach((record) => repositories.neededFromClient.deleteById(record.id))
  repositories.dashboardLinks.listByWorkspaceId(clientId).forEach((record) => repositories.dashboardLinks.deleteById(record.id))
  repositories.reports.listByWorkspaceId(clientId).forEach((record) => repositories.reports.deleteById(record.id))
  repositories.workspaceInvitations.listByWorkspaceId(clientId).forEach((record) => repositories.workspaceInvitations.deleteById(record.id))
  repositories.workspaceMemberships.listByWorkspaceId(clientId)
    .forEach((record) => repositories.workspaceMemberships.deleteById(record.id))
  repositories.clinicProfiles?.listByWorkspaceId(clientId).forEach((record) => repositories.clinicProfiles.deleteById(record.id))
  repositories.clinicLocations?.listByWorkspaceId(clientId).forEach((record) => repositories.clinicLocations.deleteById(record.id))
  repositories.clinicServiceLines?.listByWorkspaceId(clientId).forEach((record) => repositories.clinicServiceLines.deleteById(record.id))
  repositories.bookingPipelineSnapshots?.listByWorkspaceId(clientId)
    .forEach((record) => repositories.bookingPipelineSnapshots.deleteById(record.id))
  repositories.locationPerformance?.listByWorkspaceId(clientId)
    .forEach((record) => repositories.locationPerformance.deleteById(record.id))
  repositories.serviceLinePerformance?.listByWorkspaceId(clientId)
    .forEach((record) => repositories.serviceLinePerformance.deleteById(record.id))
  repositories.workspaces.deleteById(clientId)

  return true
}
