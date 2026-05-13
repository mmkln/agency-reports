import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

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
