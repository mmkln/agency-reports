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

export function answerNeededAction({
  actionId,
  message = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const action = repositories.neededFromClient.findById(actionId)

  if (!action || !canAccessClient(viewer, action.client_id)) {
    throw new Error('Needed action was not found.')
  }

  if (viewer?.role !== USER_ROLES.CLIENT_USER) {
    throw new Error('Only client users can respond to needed actions.')
  }

  if (action.status === NEEDED_ACTION_STATUSES.CANCELLED) {
    throw new Error('Cancelled actions cannot be answered.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    client_response: requireText(message || 'Completed by client', 'Response'),
    responded_at: timestamp,
    responded_by: viewer.userId,
    status: NEEDED_ACTION_STATUSES.ANSWERED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}
