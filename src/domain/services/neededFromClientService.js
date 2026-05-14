import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

const VALID_NEEDED_ACTION_STATUSES = new Set(Object.values(NEEDED_ACTION_STATUSES))

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

function mapNeededAction({ action, client }) {
  return {
    cancellationNote: action.cancellation_note ?? '',
    cancelledAt: action.cancelled_at ?? null,
    clientId: action.client_id,
    clientName: client?.name ?? 'Unknown client',
    clientResponse: action.client_response ?? '',
    description: action.description ?? '',
    dueDate: action.due_date ?? '',
    id: action.id,
    relatedLink: action.related_link ?? '',
    respondedAt: action.responded_at ?? null,
    resolutionNote: action.resolution_note ?? '',
    resolvedAt: action.resolved_at ?? null,
    responseHistory: Array.isArray(action.response_history) ? action.response_history : [],
    status: getNeededActionStatusMeta(action.status),
    title: action.title,
    updatedAt: action.updated_at ?? action.created_at ?? null,
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
  const action = {
    client_id: client.id,
    created_at: timestamp,
    description: normalizeText(input.description),
    due_date: normalizeOptionalDate(input.dueDate, 'Request due date'),
    id: idGenerator(),
    related_link: normalizeOptionalUrl(input.relatedLink, 'Request related link'),
    response_history: [],
    status: NEEDED_ACTION_STATUSES.PENDING,
    title,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(action)

  return action
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

  if (action.status !== NEEDED_ACTION_STATUSES.PENDING) {
    throw new Error('Only pending actions can be answered.')
  }

  const timestamp = now()
  const clientResponse = requireText(message || 'Completed by client', 'Response')
  const updatedAction = {
    ...action,
    client_response: clientResponse,
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

  if (![NEEDED_ACTION_STATUSES.ANSWERED, NEEDED_ACTION_STATUSES.PENDING].includes(action.status)) {
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

  if (action.status === NEEDED_ACTION_STATUSES.CANCELLED) {
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
