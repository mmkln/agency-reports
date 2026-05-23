import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../entities/client-work-item'
import { canAccessWorkspaceResource } from './accessPolicy'
import {
  hasAgencyAdminMembership,
  hasAgencyMembership,
  hasWorkspaceMembership,
} from './routeAccessPolicy'

export function isClientWorkItemPublished(item) {
  return item?.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED
}

export function canClientViewClientWorkItem({ item, viewer }) {
  if (!item || !hasWorkspaceMembership(viewer)) {
    return false
  }

  return isClientWorkItemPublished(item) && canAccessWorkspaceResource(viewer, item.client_id)
}

export function canAgencyViewClientWorkItem({ item, viewer }) {
  if (!item || !viewer) {
    return false
  }

  return hasAgencyMembership(viewer) && canAccessWorkspaceResource(viewer, item.client_id)
}

export function canManageClientWorkItem({ client, item, viewer }) {
  if (!hasAgencyAdminMembership(viewer)) {
    return false
  }

  if (client) {
    return client.id === item?.client_id && canAccessWorkspaceResource(viewer, client.id)
  }

  return canAccessWorkspaceResource(viewer, item?.client_id)
}

export function canPublishClientWorkItem({ client, item, viewer }) {
  return canManageClientWorkItem({ client, item, viewer })
}

export function canTeamPrepareClientWorkItem({ item, viewer }) {
  return hasAgencyMembership(viewer)
    && !hasAgencyAdminMembership(viewer)
    && canAccessWorkspaceResource(viewer, item?.client_id)
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
