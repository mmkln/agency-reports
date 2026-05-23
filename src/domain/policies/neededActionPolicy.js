import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { canAccessWorkspaceResource } from './accessPolicy'
import {
  hasAgencyAdminMembership,
  hasWorkspaceMembership,
} from './routeAccessPolicy'
import { canRespondToWorkspaceActions } from './workspaceAccessPolicy'

export const neededActionStatusSelectionOrder = Object.freeze([
  NEEDED_ACTION_STATUSES.PENDING,
  NEEDED_ACTION_STATUSES.ANSWERED,
  NEEDED_ACTION_STATUSES.APPROVED,
  NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
  NEEDED_ACTION_STATUSES.RESOLVED,
  NEEDED_ACTION_STATUSES.CANCELLED,
])

const validNeededActionStatuses = new Set(Object.values(NEEDED_ACTION_STATUSES))

const allowedTransitions = Object.freeze({
  [NEEDED_ACTION_STATUSES.ANSWERED]: [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.APPROVED,
    NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
    NEEDED_ACTION_STATUSES.RESOLVED,
    NEEDED_ACTION_STATUSES.CANCELLED,
  ],
  [NEEDED_ACTION_STATUSES.APPROVED]: [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.RESOLVED,
  ],
  [NEEDED_ACTION_STATUSES.CANCELLED]: [
    NEEDED_ACTION_STATUSES.PENDING,
  ],
  [NEEDED_ACTION_STATUSES.CHANGES_REQUESTED]: [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.RESOLVED,
    NEEDED_ACTION_STATUSES.CANCELLED,
  ],
  [NEEDED_ACTION_STATUSES.PENDING]: [
    NEEDED_ACTION_STATUSES.ANSWERED,
    NEEDED_ACTION_STATUSES.APPROVED,
    NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
    NEEDED_ACTION_STATUSES.RESOLVED,
    NEEDED_ACTION_STATUSES.CANCELLED,
  ],
  [NEEDED_ACTION_STATUSES.RESOLVED]: [
    NEEDED_ACTION_STATUSES.PENDING,
  ],
})

function sortNeededActionStatuses(statuses) {
  return [...statuses].sort(
    (statusA, statusB) => neededActionStatusSelectionOrder.indexOf(statusA) - neededActionStatusSelectionOrder.indexOf(statusB),
  )
}

export function canTransitionNeededActionStatus(fromStatus, toStatus) {
  return allowedTransitions[fromStatus]?.includes(toStatus) ?? false
}

export function getNeededActionStatusTransitionTargets(fromStatus) {
  return [...allowedTransitions[fromStatus] ?? []]
}

export function getNeededActionStatusSelectionOptions({
  currentStatus,
  selectedStatus = currentStatus,
} = {}) {
  return sortNeededActionStatuses(new Set([
    currentStatus,
    selectedStatus,
    ...getNeededActionStatusTransitionTargets(currentStatus),
  ].filter((status) => validNeededActionStatuses.has(status))))
}

export function canClientRespondToNeededAction({ action, viewer }) {
  return hasWorkspaceMembership(viewer)
    && canRespondToWorkspaceActions(viewer, action?.client_id)
    && action?.status === NEEDED_ACTION_STATUSES.PENDING
}

export function canAgencyProcessNeededAction({ action, viewer, targetStatus }) {
  return hasAgencyAdminMembership(viewer)
    && canAccessWorkspaceResource(viewer, action?.client_id)
    && canTransitionNeededActionStatus(action?.status, targetStatus)
}
