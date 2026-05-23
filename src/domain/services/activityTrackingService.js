import { canAccessClient } from '../policies/accessPolicy'
import { hasAgencyMembership } from '../policies/routeAccessPolicy'

export const ACTIVITY_EVENT_TYPES = Object.freeze({
  CLIENT_REQUEST_ANSWERED: 'client_request_answered',
  CLIENT_REQUEST_CANCELLED: 'client_request_cancelled',
  CLIENT_REQUEST_CREATED: 'client_request_created',
  CLIENT_REQUEST_RESOLVED: 'client_request_resolved',
  CLIENT_INVITATION_ACCEPTED: 'client_invitation_accepted',
  CLIENT_INVITATION_CANCELLED: 'client_invitation_cancelled',
  CLIENT_INVITATION_CREATED: 'client_invitation_created',
  CLIENT_WORK_ITEM_ARCHIVED: 'client_work_item_archived',
  CLIENT_WORK_ITEM_CREATED: 'client_work_item_created',
  CLIENT_WORK_ITEM_PUBLISHED: 'client_work_item_published',
  CLIENT_WORK_ITEM_READY_FOR_REVIEW: 'client_work_item_ready_for_review',
  CLINIC_COMPLIANCE_RECORD_PUBLISHED: 'clinic_compliance_record_published',
  CLINIC_COMPLIANCE_STATUS_CHANGED: 'clinic_compliance_status_changed',
  CLINIC_MEDICAL_APPROVAL_DECIDED: 'clinic_medical_approval_decided',
  DASHBOARD_OPENED: 'dashboard_opened',
  NEEDED_ACTION_ANSWERED: 'needed_action_answered',
  OVERVIEW_OPENED: 'overview_opened',
  REPORT_OPENED: 'report_opened',
})

const VALID_ACTIVITY_EVENT_TYPES = new Set(Object.values(ACTIVITY_EVENT_TYPES))
const CLIENT_VISIBLE_ACTIVITY_EVENT_TYPES = new Set([
  ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
  ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_CREATED,
  ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_RESOLVED,
  ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
  ACTIVITY_EVENT_TYPES.NEEDED_ACTION_ANSWERED,
])
const CLIENT_VISIBLE_METADATA_KEYS = new Set([
  'actionId',
  'dashboardId',
  'publishState',
  'reportId',
  'status',
  'title',
  'type',
  'workItemId',
])

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

function normalizeClientVisibleMetadata(metadata) {
  return Object.fromEntries(
    Object.entries(normalizeMetadata(metadata))
      .filter(([key]) => CLIENT_VISIBLE_METADATA_KEYS.has(key)),
  )
}

export function isActivityEventVisibleToClient(eventOrType) {
  const eventType = typeof eventOrType === 'string' ? eventOrType : eventOrType?.event_type
  return CLIENT_VISIBLE_ACTIVITY_EVENT_TYPES.has(eventType)
}

function assertCanRecordActivity({ clientId, repositories, viewer }) {
  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    throw new Error('Client activity is not available.')
  }

  return client
}

function assertCanReadActivity({ clientId, repositories, viewer }) {
  const client = assertCanRecordActivity({ clientId, repositories, viewer })

  if (!hasAgencyMembership(viewer)) {
    throw new Error('Only team users can read workspace activity.')
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

function mapClientVisibleActivityEvent(event) {
  return {
    clientId: event.client_id,
    createdAt: event.created_at,
    eventType: event.event_type,
    id: event.id,
    metadata: normalizeClientVisibleMetadata(event.metadata),
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

export function listClientVisibleActivityEvents({
  clientId,
  limit = 10,
  repositories,
  viewer,
}) {
  assertActivityRepository(repositories)
  assertCanRecordActivity({ clientId, repositories, viewer })

  return repositories.activityEvents
    .listByClientId(clientId)
    .filter(isActivityEventVisibleToClient)
    .sort(sortActivityDesc)
    .slice(0, limit)
    .map(mapClientVisibleActivityEvent)
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
