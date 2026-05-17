import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'

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
  return viewer?.role === USER_ROLES.CLIENT_USER
    && action?.status === NEEDED_ACTION_STATUSES.PENDING
}

export function canAgencyProcessNeededAction({ action, viewer, targetStatus }) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN
    && Boolean(viewer.agencyId)
    && canTransitionNeededActionStatus(action?.status, targetStatus)
}
