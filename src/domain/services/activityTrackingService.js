import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

export const ACTIVITY_EVENT_TYPES = Object.freeze({
  CLIENT_REQUEST_ANSWERED: 'client_request_answered',
  CLIENT_REQUEST_CANCELLED: 'client_request_cancelled',
  CLIENT_REQUEST_CREATED: 'client_request_created',
  CLIENT_REQUEST_RESOLVED: 'client_request_resolved',
  CLIENT_WORK_ITEM_ARCHIVED: 'client_work_item_archived',
  CLIENT_WORK_ITEM_CREATED: 'client_work_item_created',
  CLIENT_WORK_ITEM_PUBLISHED: 'client_work_item_published',
  CLIENT_WORK_ITEM_READY_FOR_REVIEW: 'client_work_item_ready_for_review',
  DASHBOARD_OPENED: 'dashboard_opened',
  NEEDED_ACTION_ANSWERED: 'needed_action_answered',
  OVERVIEW_OPENED: 'overview_opened',
  REPORT_OPENED: 'report_opened',
})

const VALID_ACTIVITY_EVENT_TYPES = new Set(Object.values(ACTIVITY_EVENT_TYPES))

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function assertActivityRepository(repositories) {
  if (!repositories?.activityEvents) {
    throw new Error('Activity events repository is required.')
  }
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {}
  }

  return { ...metadata }
}

function assertCanRecordActivity({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    throw new Error('Client activity is not available.')
  }

  if (viewer?.role === USER_ROLES.AGENCY_ADMIN && client.agency_id !== viewer.agencyId) {
    throw new Error('Client activity is not available.')
  }

  return client
}

function assertCanReadActivity({ clientId, repositories, viewer }) {
  const client = assertCanRecordActivity({ clientId, repositories, viewer })

  if (![USER_ROLES.AGENCY_ADMIN, USER_ROLES.AGENCY_TEAM].includes(viewer?.role)) {
    throw new Error('Only agency users can read client activity.')
  }

  return client
}

function sortActivityDesc(a, b) {
  return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
}

function getActorProfile({ repositories, userId }) {
  if (!userId || !repositories.profiles?.findByUserId) {
    return null
  }

  return repositories.profiles.findByUserId(userId)
}

function mapActivityEvent({ event, repositories }) {
  const actor = getActorProfile({ repositories, userId: event.user_id })

  return {
    actorEmail: actor?.email ?? '',
    actorName: actor?.name ?? 'Unknown user',
    actorRole: actor?.role ?? '',
    clientId: event.client_id,
    createdAt: event.created_at,
    eventType: event.event_type,
    id: event.id,
    metadata: normalizeMetadata(event.metadata),
    userId: event.user_id,
  }
}

export function recordActivityEvent({
  clientId,
  eventType,
  idGenerator,
  metadata = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertActivityRepository(repositories)
  assertUuidGenerator(idGenerator)
  assertCanRecordActivity({ clientId, repositories, viewer })

  if (!VALID_ACTIVITY_EVENT_TYPES.has(eventType)) {
    throw new Error('Activity event type is invalid.')
  }

  const timestamp = now()
  const event = {
    client_id: clientId,
    created_at: timestamp,
    event_type: eventType,
    id: idGenerator(),
    metadata: normalizeMetadata(metadata),
    user_id: viewer?.userId ?? null,
  }

  repositories.activityEvents.upsert(event)

  return event
}

export function listClientActivityEvents({
  clientId,
  limit = 10,
  repositories,
  viewer,
}) {
  assertActivityRepository(repositories)
  assertCanReadActivity({ clientId, repositories, viewer })

  return repositories.activityEvents
    .listByClientId(clientId)
    .sort(sortActivityDesc)
    .slice(0, limit)
    .map((event) => mapActivityEvent({ event, repositories }))
}
