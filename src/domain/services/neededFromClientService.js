import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_STATUS_META,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import {
  canAgencyProcessNeededAction,
  canClientRespondToNeededAction,
} from '../policies/neededActionPolicy'
import { isNeededActionVisibleToClient } from '../policies/visibilityPolicy'

const VALID_NEEDED_ACTION_STATUSES = new Set(Object.values(NEEDED_ACTION_STATUSES))
const VALID_NEEDED_ACTION_PRIORITIES = new Set(Object.values(NEEDED_ACTION_PRIORITIES))
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function getAction({ actionId, repositories, viewer }) {
  const action = repositories.neededFromClient.findById(actionId)

  if (!action || !canAccessClient(viewer, action.client_id)) {
    throw new Error('Needed action was not found.')
  }

  if (viewer?.role === USER_ROLES.AGENCY_ADMIN && repositories.clients?.findById) {
    const client = repositories.clients.findById(action.client_id)

    if (!client || client.agency_id !== viewer.agencyId) {
      throw new Error('Needed action was not found.')
    }
  }

  return action
}

function createHistoryEvent({ metadata = {}, now, type, viewer }) {
  return {
    created_at: now(),
    created_by: viewer?.userId ?? null,
    metadata,
    type,
  }
}

function appendHistory(action, event) {
  return [
    ...(Array.isArray(action.response_history) ? action.response_history : []),
    event,
  ]
}

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can process needed actions.')
  }
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function createNeededActionId(idGenerator) {
  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Needed action id must be a string uuid.')
  }

  return id
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeOptionalDate(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
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

function getAdminClients({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  return repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId)
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = getAdminClients({ repositories, viewer })
    .find((item) => item.id === clientId)

  if (!client) {
    throw new Error('Client is not available for requests.')
  }

  return client
}

function getNeededActionStatusMeta(status) {
  return VALID_NEEDED_ACTION_STATUSES.has(status) ? status : NEEDED_ACTION_STATUSES.PENDING
}

function normalizePriority(priority) {
  return VALID_NEEDED_ACTION_PRIORITIES.has(priority) ? priority : NEEDED_ACTION_PRIORITIES.MEDIUM
}

function normalizeEditableActionFields(input = {}) {
  return {
    description: normalizeText(input.description),
    due_date: normalizeOptionalDate(input.dueDate, 'Request due date'),
    internal_notes: normalizeText(input.internalNotes),
    owner_name: normalizeText(input.ownerName),
    priority: normalizePriority(input.priority),
    related_link: normalizeOptionalUrl(input.relatedLink, 'Request related link'),
    title: requireText(input.title, 'Request title'),
  }
}

function mapNeededAction({ action, client }) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    cancellationNote: normalizedAction.cancellation_note ?? '',
    cancelledAt: normalizedAction.cancelled_at,
    clientId: normalizedAction.client_id,
    clientName: client?.name ?? 'Unknown client',
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    internalNotes: normalizedAction.internal_notes,
    ownerName: normalizedAction.owner_name,
    priority: normalizedAction.priority,
    relatedLink: normalizedAction.related_link,
    respondedAt: normalizedAction.client_responded_at,
    respondedBy: normalizedAction.client_responded_by,
    resolutionNote: normalizedAction.resolution_note ?? '',
    resolvedAt: normalizedAction.resolved_at,
    resolvedBy: normalizedAction.resolved_by,
    responseHistory: normalizedAction.response_history,
    status: getNeededActionStatusMeta(normalizedAction.status),
    title: normalizedAction.title,
    updatedAt: normalizedAction.updated_at,
  }
}

function mapClientNeededAction(action) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    priority: normalizedAction.priority,
    priorityMeta: NEEDED_ACTION_PRIORITY_META[normalizedAction.priority],
    relatedLink: normalizedAction.related_link,
    respondedAt: normalizedAction.client_responded_at,
    responseHistory: normalizedAction.response_history,
    status: normalizedAction.status,
    statusMeta: NEEDED_ACTION_STATUS_META[normalizedAction.status],
    title: normalizedAction.title,
    updatedAt: normalizedAction.updated_at,
  }
}

function matchesFilter(value, filterValue) {
  return !filterValue || filterValue === 'all' || value === filterValue
}

export function listNeededActionsWorkspace({
  filters = {},
  repositories,
  viewer,
}) {
  const clients = getAdminClients({ repositories, viewer })
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const clientIds = new Set(clients.map((client) => client.id))
  const actions = repositories.neededFromClient
    .list()
    .filter((action) => clientIds.has(action.client_id))
    .filter((action) => matchesFilter(action.client_id, filters.clientId))
    .filter((action) => matchesFilter(action.status, filters.status))
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
        [NEEDED_ACTION_STATUSES.CANCELLED]: 3,
      }

      return (priority[a.status] ?? 4) - (priority[b.status] ?? 4)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map((action) => mapNeededAction({
      action,
      client: clientsById.get(action.client_id),
    }))

  return {
    actions,
    clients,
    filters: {
      clientId: filters.clientId ?? 'all',
      status: filters.status ?? 'all',
    },
    status: 'ready',
  }
}

export function listClientNeededActions({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)

  if (!normalizedClientId || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const client = repositories.clients?.findById(normalizedClientId)

  if (!client) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const actions = repositories.neededFromClient
    .listByClientId(normalizedClientId)
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
      }

      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map(mapClientNeededAction)

  return {
    actions,
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
    },
    status: 'ready',
  }
}

export function createNeededAction({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const client = getAdminClient({
    clientId: normalizeText(input.clientId),
    repositories,
    viewer,
  })
  const title = normalizeText(input.title)

  if (!title) {
    throw new Error('Request title is required.')
  }

  const timestamp = now()
  const actionId = createNeededActionId(idGenerator)
  const action = {
    client_id: client.id,
    created_at: timestamp,
    id: actionId,
    ...normalizeEditableActionFields({
      ...input,
      title,
    }),
    response_history: [],
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(action)

  return action
}

export function updateNeededAction({
  actionId,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  const timestamp = now()
  const updatedAction = {
    ...action,
    ...normalizeEditableActionFields(input),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        fields: ['title', 'description', 'due_date', 'related_link', 'priority', 'owner_name', 'internal_notes'],
      },
      now,
      type: 'admin_updated',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function answerNeededAction({
  actionId,
  message = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const action = getAction({ actionId, repositories, viewer })

  if (viewer?.role !== USER_ROLES.CLIENT_USER) {
    throw new Error('Only client users can respond to needed actions.')
  }

  if (!canClientRespondToNeededAction({ action, viewer })) {
    throw new Error('Only pending actions can be answered.')
  }

  const timestamp = now()
  const clientResponse = requireText(message || 'Completed by client', 'Response')
  const updatedAction = {
    ...action,
    client_response: clientResponse,
    client_responded_at: timestamp,
    client_responded_by: viewer.userId,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        response: clientResponse,
      },
      now,
      type: 'client_answered',
      viewer,
    })),
    responded_at: timestamp,
    responded_by: viewer.userId,
    status: NEEDED_ACTION_STATUSES.ANSWERED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function resolveNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
    viewer,
  })) {
    throw new Error('Only pending or answered actions can be resolved.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    resolved_at: timestamp,
    resolved_by: viewer.userId,
    resolution_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_resolved',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.RESOLVED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function cancelNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.CANCELLED,
    viewer,
  })) {
    throw new Error('Action is already cancelled.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: timestamp,
    cancelled_by: viewer.userId,
    cancellation_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_cancelled',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.CANCELLED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function reopenNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.PENDING,
    viewer,
  })) {
    throw new Error('Only answered, resolved, or cancelled actions can be reopened.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_note: '',
    resolved_at: null,
    resolved_by: null,
    resolution_note: '',
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_reopened',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}
