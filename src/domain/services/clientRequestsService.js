import {
  CLIENT_REQUEST_STATUSES,
  CLIENT_REQUEST_STATUS_META,
  CLIENT_REQUEST_TYPES,
  CLIENT_REQUEST_TYPE_META,
  normalizeClientRequest,
} from '../../entities/client-request'
import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'
import { createNeededAction } from './neededFromClientService'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const STATUS_ORDER = Object.freeze([
  CLIENT_REQUEST_STATUSES.SUBMITTED,
  CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
  CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY,
  CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
  CLIENT_REQUEST_STATUSES.ACCEPTED,
  CLIENT_REQUEST_STATUSES.CONVERTED,
  CLIENT_REQUEST_STATUSES.COMPLETED,
  CLIENT_REQUEST_STATUSES.DECLINED,
  CLIENT_REQUEST_STATUSES.ARCHIVED,
])

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

function createClientRequestId(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Client request id must be a string uuid.')
  }

  return id
}

function getStatusMeta(status) {
  return CLIENT_REQUEST_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getTypeMeta(type) {
  return CLIENT_REQUEST_TYPE_META[type] ?? {
    label: type,
    tone: 'neutral',
  }
}

function createHistoryEvent({ metadata = {}, now, type, viewer }) {
  return {
    created_at: now(),
    created_by: viewer?.userId ?? null,
    metadata: {
      actor_role: viewer?.role ?? null,
      ...metadata,
    },
    type,
  }
}

function mapClientRequest(request) {
  const normalizedRequest = normalizeClientRequest(request)

  return {
    agencyResponse: normalizedRequest.agency_response,
    clientId: normalizedRequest.client_id,
    createdAt: normalizedRequest.created_at,
    description: normalizedRequest.description,
    desiredDueDate: normalizedRequest.desired_due_date,
    id: normalizedRequest.id,
    projectId: normalizedRequest.project_id,
    referenceLink: normalizedRequest.reference_link,
    relatedNeededActionId: normalizedRequest.related_needed_action_id,
    requestType: normalizedRequest.request_type,
    requestTypeMeta: getTypeMeta(normalizedRequest.request_type),
    responseHistory: normalizedRequest.response_history,
    status: normalizedRequest.status,
    statusMeta: getStatusMeta(normalizedRequest.status),
    submittedBy: normalizedRequest.submitted_by,
    submittedByName: normalizedRequest.submitted_by_name,
    title: normalizedRequest.title,
    updatedAt: normalizedRequest.updated_at,
  }
}

function sortRequests(a, b) {
  return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    || new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    || a.title.localeCompare(b.title)
}

function countBy(requests, predicate) {
  return requests.filter(predicate).length
}

function assertClientUserCanSubmit({ clientId, viewer }) {
  if (viewer?.role !== USER_ROLES.CLIENT_USER || !canAccessClient(viewer, clientId)) {
    throw new Error('Only client users can submit requests for their client.')
  }
}

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN) {
    throw new Error('Only agency admins can manage client requests.')
  }
}

function getClientNameById(clients, clientId) {
  return clients.find((client) => client.id === clientId)?.name ?? 'Unknown client'
}

function filterAdminRequestsByClient(requests, clientId) {
  const normalizedClientId = normalizeText(clientId)

  if (!normalizedClientId || normalizedClientId === 'all') {
    return requests
  }

  return requests.filter((request) => request.clientId === normalizedClientId)
}

function isOpenNeededAction(action) {
  return ![
    NEEDED_ACTION_STATUSES.CANCELLED,
    NEEDED_ACTION_STATUSES.RESOLVED,
  ].includes(action.status)
}

function findOpenClarificationAction({ repositories, request }) {
  const relatedActionId = normalizeClientRequest(request).related_needed_action_id
  const relatedAction = relatedActionId
    ? repositories.neededFromClient?.findById(relatedActionId)
    : null

  if (relatedAction && isOpenNeededAction(relatedAction)) {
    return relatedAction
  }

  return repositories.neededFromClient
    ?.listByClientId(request.client_id)
    .find((action) => action.related_request_id === request.id && isOpenNeededAction(action))
    ?? null
}

function createRequestClarificationAction({
  activityIdGenerator,
  agencyResponse,
  idGenerator,
  now,
  repositories,
  request,
  viewer,
}) {
  const existingAction = findOpenClarificationAction({
    repositories,
    request,
  })

  if (existingAction) {
    return existingAction
  }

  if (!idGenerator) {
    throw new Error('idGenerator is required to create a client clarification action.')
  }

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: {
      clientId: request.client_id,
      description: agencyResponse,
      impactIfDelayed: 'This request will stay paused until we receive your response.',
      ownerName: request.submitted_by_name,
      priority: NEEDED_ACTION_PRIORITIES.MEDIUM,
      relatedRequestId: request.id,
      title: `Clarification needed: ${request.title}`,
      type: NEEDED_ACTION_TYPES.FEEDBACK,
      whyNeeded: agencyResponse,
    },
    now,
    repositories,
    viewer,
  })
}

export function getClientRequestsPage({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const requests = (repositories.clientRequests?.listByClientId(normalizedClientId) ?? [])
    .map(mapClientRequest)
    .sort(sortRequests)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    counts: {
      accepted: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.ACCEPTED),
      all: requests.length,
      archived: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.ARCHIVED),
      completed: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.COMPLETED),
      open: countBy(requests, (request) => ![
        CLIENT_REQUEST_STATUSES.ARCHIVED,
        CLIENT_REQUEST_STATUSES.COMPLETED,
        CLIENT_REQUEST_STATUSES.DECLINED,
      ].includes(request.status)),
      submitted: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.SUBMITTED),
      underReview: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.UNDER_REVIEW),
      waitingOnAgency: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY),
      waitingOnClient: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT),
    },
    requests,
    status: 'ready',
  }
}

export function createClientRequest({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const clientId = normalizeText(input.clientId || viewer?.clientId)
  const client = repositories.clients.findById(clientId)

  if (!client) {
    throw new Error('Client is not available for requests.')
  }

  assertClientUserCanSubmit({
    clientId,
    viewer,
  })

  const timestamp = now()
  const request = {
    agency_response: '',
    client_id: clientId,
    created_at: timestamp,
    description: requireText(input.description, 'Request details'),
    desired_due_date: normalizeOptionalDate(input.desiredDueDate, 'Desired due date'),
    id: createClientRequestId(idGenerator),
    project_id: normalizeText(input.projectId),
    reference_link: normalizeOptionalUrl(input.referenceLink, 'Reference link'),
    related_needed_action_id: '',
    request_type: Object.values(CLIENT_REQUEST_TYPES).includes(input.requestType)
      ? input.requestType
      : CLIENT_REQUEST_TYPES.NEW_WORK,
    response_history: [
      createHistoryEvent({
        metadata: {
          title: input.title,
        },
        now: () => timestamp,
        type: 'client_submitted',
        viewer,
      }),
    ],
    status: CLIENT_REQUEST_STATUSES.SUBMITTED,
    submitted_by: viewer.userId ?? '',
    submitted_by_name: viewer.name ?? viewer.email ?? 'Client',
    title: requireText(input.title, 'Request title'),
    updated_at: timestamp,
  }

  repositories.clientRequests.upsert(request)

  return mapClientRequest(request)
}

export function listAdminClientRequestsWorkspace({
  clientId = '',
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const clients = repositories.clients.list()
  const requests = filterAdminRequestsByClient(
    (repositories.clientRequests?.list() ?? []).map((request) => {
      const mappedRequest = mapClientRequest(request)

      return {
        ...mappedRequest,
        clientName: getClientNameById(clients, mappedRequest.clientId),
      }
    }),
    clientId,
  ).sort(sortRequests)

  return {
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      status: client.status,
    })),
    counts: {
      all: requests.length,
      archived: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.ARCHIVED),
      completed: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.COMPLETED),
      needsReview: countBy(requests, (request) => [
        CLIENT_REQUEST_STATUSES.SUBMITTED,
        CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
      ].includes(request.status)),
      open: countBy(requests, (request) => ![
        CLIENT_REQUEST_STATUSES.ARCHIVED,
        CLIENT_REQUEST_STATUSES.COMPLETED,
        CLIENT_REQUEST_STATUSES.DECLINED,
      ].includes(request.status)),
      waitingOnAgency: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY),
      waitingOnClient: countBy(requests, (request) => request.status === CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT),
    },
    requests,
    status: 'ready',
  }
}

export function updateClientRequestTriage({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  requestId,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const request = repositories.clientRequests.findById(requestId)

  if (!request) {
    throw new Error('Client request was not found.')
  }

  const nextStatus = Object.values(CLIENT_REQUEST_STATUSES).includes(input.status)
    ? input.status
    : normalizeClientRequest(request).status
  const timestamp = now()
  const agencyResponse = normalizeText(input.agencyResponse)
  const clarificationAction = nextStatus === CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT
    ? createRequestClarificationAction({
      activityIdGenerator,
      agencyResponse: requireText(agencyResponse, 'Agency response'),
      idGenerator,
      now: () => timestamp,
      repositories,
      request,
      viewer,
    })
    : null
  const updatedRequest = {
    ...request,
    agency_response: agencyResponse,
    related_needed_action_id: clarificationAction?.id ?? normalizeClientRequest(request).related_needed_action_id,
    response_history: [
      ...normalizeClientRequest(request).response_history,
      createHistoryEvent({
        metadata: {
          agency_response: agencyResponse,
          related_needed_action_id: clarificationAction?.id ?? null,
          status: nextStatus,
        },
        now: () => timestamp,
        type: 'agency_triaged',
        viewer,
      }),
    ],
    status: nextStatus,
    updated_at: timestamp,
  }

  repositories.clientRequests.upsert(updatedRequest)

  return mapClientRequest(updatedRequest)
}
