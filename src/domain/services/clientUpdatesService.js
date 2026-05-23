import {
  CLIENT_UPDATE_TYPE_META,
  CLIENT_UPDATE_TYPES,
  normalizeClientUpdate,
  VISIBILITY,
} from '../../entities/update'
import { canAccessClient } from '../policies/accessPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'
import { isUpdateVisibleToClient } from '../policies/visibilityPolicy'
import { listManagedWorkspaceIds } from './viewerAccessContextService'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const TYPE_ORDER = Object.freeze([
  CLIENT_UPDATE_TYPES.WEEKLY_UPDATE,
  CLIENT_UPDATE_TYPES.MILESTONE_UPDATE,
  CLIENT_UPDATE_TYPES.LAUNCH_UPDATE,
  CLIENT_UPDATE_TYPES.ISSUE_UPDATE,
  CLIENT_UPDATE_TYPES.REPORT_PUBLISHED,
  CLIENT_UPDATE_TYPES.APPROVAL_COMPLETED,
  CLIENT_UPDATE_TYPES.DECISION_RECORDED,
])

function getTypeMeta(type) {
  return CLIENT_UPDATE_TYPE_META[type] ?? {
    label: type,
    tone: 'neutral',
  }
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function requireText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeNullableText(value = '') {
  return normalizeText(value) || null
}

function normalizeType(type) {
  return Object.values(CLIENT_UPDATE_TYPES).includes(type)
    ? type
    : CLIENT_UPDATE_TYPES.WEEKLY_UPDATE
}

function normalizeVisibility(visibility) {
  return visibility === VISIBILITY.CLIENT_VISIBLE ? VISIBILITY.CLIENT_VISIBLE : VISIBILITY.INTERNAL
}

function normalizeDateTime(value = '', fieldName = 'Published date') {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function assertAgencyAdmin(viewer) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can manage portal updates.')
  }
}

function getAdminClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    throw new Error('Client was not found.')
  }

  return client
}

function createClientUpdateId(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Client update id must be a string uuid.')
  }

  return id
}

function getProjectMap(repositories) {
  return new Map((repositories.projects?.list() ?? []).map((project) => [project.id, project]))
}

function getReportMap(repositories) {
  return new Map((repositories.reports?.list() ?? []).map((report) => [report.id, report]))
}

function getFileLinkMap(repositories) {
  return new Map((repositories.clientFileLinks?.list() ?? []).map((fileLink) => [fileLink.id, fileLink]))
}

function mapClientUpdate({
  clientsById,
  fileLinksById,
  projectsById,
  reportsById,
  update,
}) {
  const normalizedUpdate = normalizeClientUpdate(update)
  const client = clientsById?.get(normalizedUpdate.client_id)
  const project = normalizedUpdate.project_id ? projectsById.get(normalizedUpdate.project_id) : null
  const report = normalizedUpdate.related_report_id ? reportsById.get(normalizedUpdate.related_report_id) : null
  const fileLink = normalizedUpdate.related_file_link_id
    ? fileLinksById.get(normalizedUpdate.related_file_link_id)
    : null

  return {
    body: normalizedUpdate.body,
    clientActionNeeded: normalizedUpdate.client_action_needed,
    clientId: normalizedUpdate.client_id,
    clientName: client?.name ?? '',
    createdAt: normalizedUpdate.created_at,
    createdBy: normalizedUpdate.created_by,
    id: normalizedUpdate.id,
    projectId: normalizedUpdate.project_id,
    projectName: project?.name ?? '',
    publishedAt: normalizedUpdate.published_at,
    relatedFileLinkId: normalizedUpdate.related_file_link_id,
    relatedFileLinkTitle: fileLink?.title ?? '',
    relatedReportId: normalizedUpdate.related_report_id,
    relatedReportTitle: report?.title ?? '',
    title: normalizedUpdate.title,
    type: normalizedUpdate.type,
    typeMeta: getTypeMeta(normalizedUpdate.type),
    updatedAt: normalizedUpdate.updated_at,
    visibility: normalizedUpdate.visibility,
    whatChanged: normalizedUpdate.what_changed || normalizedUpdate.body,
    whatNext: normalizedUpdate.what_next,
  }
}

function sortUpdates(a, b) {
  return new Date(b.publishedAt ?? b.updatedAt ?? b.createdAt ?? 0).getTime()
    - new Date(a.publishedAt ?? a.updatedAt ?? a.createdAt ?? 0).getTime()
    || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
    || a.title.localeCompare(b.title)
}

function countByType(updates) {
  return TYPE_ORDER.reduce((counts, type) => ({
    ...counts,
    [type]: updates.filter((update) => update.type === type).length,
  }), {})
}

export function listClientVisibleUpdates({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = String(clientId || viewer?.clientId || '').trim()
  const client = repositories.workspaces.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projectsById = getProjectMap(repositories)
  const reportsById = getReportMap(repositories)
  const fileLinksById = getFileLinkMap(repositories)
  const clientsById = new Map([[client.id, client]])
  const updates = repositories.updates
    .listByClientId(normalizedClientId)
    .filter(isUpdateVisibleToClient)
    .map((update) => mapClientUpdate({
      clientsById,
      fileLinksById,
      projectsById,
      reportsById,
      update,
    }))
    .sort(sortUpdates)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    status: 'ready',
    updates,
  }
}

export function getClientUpdatesPage({
  clientId,
  repositories,
  viewer,
}) {
  const result = listClientVisibleUpdates({
    clientId,
    repositories,
    viewer,
  })

  if (result.status === 'error') {
    return result
  }

  return {
    ...result,
    counts: {
      all: result.updates.length,
      ...countByType(result.updates),
    },
    latestUpdate: result.updates[0] ?? null,
  }
}

export function listAdminClientUpdatesWorkspace({
  clientId,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const clients = repositories.workspaces
    .list()
    .filter((client) => new Set(listManagedWorkspaceIds(viewer)).has(client.id))
    .sort((a, b) => a.name.localeCompare(b.name))
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const normalizedClientId = normalizeText(clientId)
  const selectedClient = normalizedClientId
    ? getAdminClient({ clientId: normalizedClientId, repositories, viewer })
    : clients[0] ?? null
  const selectedClientId = selectedClient?.id ?? ''
  const projectsById = getProjectMap(repositories)
  const reportsById = getReportMap(repositories)
  const fileLinksById = getFileLinkMap(repositories)
  const updates = repositories.updates
    .list()
    .filter((update) => clientsById.has(update.client_id))
    .filter((update) => !selectedClientId || update.client_id === selectedClientId)
    .map((update) => mapClientUpdate({
      clientsById,
      fileLinksById,
      projectsById,
      reportsById,
      update,
    }))
    .sort(sortUpdates)

  return {
    client: selectedClient,
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      status: client.status,
    })),
    counts: {
      all: updates.length,
      clientVisible: updates.filter((update) => update.visibility === VISIBILITY.CLIENT_VISIBLE).length,
      internal: updates.filter((update) => update.visibility === VISIBILITY.INTERNAL).length,
      ...countByType(updates),
    },
    status: 'ready',
    updates,
  }
}

export function createClientUpdate({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const client = getAdminClient({
    clientId: requireText(input.clientId, 'Client'),
    repositories,
    viewer,
  })
  const timestamp = now()
  const visibility = normalizeVisibility(input.visibility)
  const publishedAt = visibility === VISIBILITY.CLIENT_VISIBLE
    ? normalizeDateTime(input.publishedAt, 'Published date') || timestamp
    : normalizeDateTime(input.publishedAt, 'Published date')
  const update = {
    body: normalizeText(input.body),
    client_action_needed: normalizeText(input.clientActionNeeded),
    client_id: client.id,
    created_at: timestamp,
    created_by: viewer.userId ?? null,
    id: createClientUpdateId(idGenerator),
    project_id: normalizeNullableText(input.projectId),
    published_at: publishedAt || timestamp,
    related_file_link_id: normalizeNullableText(input.relatedFileLinkId),
    related_report_id: normalizeNullableText(input.relatedReportId),
    title: requireText(input.title, 'Title'),
    type: normalizeType(input.type),
    updated_at: timestamp,
    visibility,
    what_changed: normalizeText(input.whatChanged),
    what_next: normalizeText(input.whatNext),
  }

  repositories.updates.upsert(update)

  return mapClientUpdate({
    clientsById: new Map([[client.id, client]]),
    fileLinksById: getFileLinkMap(repositories),
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
    update,
  })
}

export function updateClientUpdate({
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  updateId,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const existingUpdate = repositories.updates.findById(updateId)

  if (!existingUpdate) {
    throw new Error('Client update was not found.')
  }

  const client = getAdminClient({
    clientId: existingUpdate.client_id,
    repositories,
    viewer,
  })
  const timestamp = now()
  const visibility = normalizeVisibility(input.visibility)
  const publishedAt = visibility === VISIBILITY.CLIENT_VISIBLE
    ? normalizeDateTime(input.publishedAt, 'Published date') || timestamp
    : normalizeDateTime(input.publishedAt, 'Published date') || existingUpdate.published_at || timestamp
  const updatedUpdate = {
    ...existingUpdate,
    body: normalizeText(input.body),
    client_action_needed: normalizeText(input.clientActionNeeded),
    project_id: normalizeNullableText(input.projectId),
    published_at: publishedAt,
    related_file_link_id: normalizeNullableText(input.relatedFileLinkId),
    related_report_id: normalizeNullableText(input.relatedReportId),
    title: requireText(input.title, 'Title'),
    type: normalizeType(input.type),
    updated_at: timestamp,
    visibility,
    what_changed: normalizeText(input.whatChanged),
    what_next: normalizeText(input.whatNext),
  }

  repositories.updates.upsert(updatedUpdate)

  return mapClientUpdate({
    clientsById: new Map([[client.id, client]]),
    fileLinksById: getFileLinkMap(repositories),
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
    update: updatedUpdate,
  })
}

export function hideClientUpdate({
  now = () => new Date().toISOString(),
  repositories,
  updateId,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const existingUpdate = repositories.updates.findById(updateId)

  if (!existingUpdate) {
    throw new Error('Client update was not found.')
  }

  const client = getAdminClient({
    clientId: existingUpdate.client_id,
    repositories,
    viewer,
  })
  const hiddenUpdate = {
    ...existingUpdate,
    updated_at: now(),
    visibility: VISIBILITY.INTERNAL,
  }

  repositories.updates.upsert(hiddenUpdate)

  return mapClientUpdate({
    clientsById: new Map([[client.id, client]]),
    fileLinksById: getFileLinkMap(repositories),
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
    update: hiddenUpdate,
  })
}
