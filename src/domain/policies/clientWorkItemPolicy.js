import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from './accessPolicy'

export function isClientWorkItemPublished(item) {
  return item?.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED
}

export function canClientViewClientWorkItem({ item, viewer }) {
  if (!item || viewer?.role !== USER_ROLES.CLIENT_USER) {
    return false
  }

  return isClientWorkItemPublished(item) && canAccessClient(viewer, item.client_id)
}

export function canAgencyViewClientWorkItem({ item, viewer }) {
  if (!item || !viewer) {
    return false
  }

  if (viewer.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId) && canAccessClient(viewer, item.client_id)
  }

  if (viewer.role === USER_ROLES.AGENCY_TEAM) {
    return canAccessClient(viewer, item.client_id)
  }

  return false
}

export function canManageClientWorkItem({ client, item, viewer }) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    return false
  }

  if (client) {
    return client.id === item?.client_id && client.agency_id === viewer.agencyId
  }

  return canAccessClient(viewer, item?.client_id)
}

export function canPublishClientWorkItem({ client, item, viewer }) {
  return canManageClientWorkItem({ client, item, viewer })
}

export function canTeamPrepareClientWorkItem({ item, viewer }) {
  return viewer?.role === USER_ROLES.AGENCY_TEAM && canAccessClient(viewer, item?.client_id)
}

const allowedPublishTransitions = Object.freeze({
  [CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED]: [CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT],
  [CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT]: [
    CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
  ],
  [CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED]: [
    CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
    CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
  ],
  [CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW]: [
    CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
    CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
  ],
})

export function canTransitionClientWorkItemPublishState(fromState, toState) {
  return allowedPublishTransitions[fromState]?.includes(toState) ?? false
}

export function getClientWorkItemPublishTransitionTargets(fromState) {
  return [...allowedPublishTransitions[fromState] ?? []]
}
