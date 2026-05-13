import { TASK_STATUSES } from '../../entities/task'

export const taskStatusSelectionOrder = Object.freeze([
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.WAITING_CLIENT,
  TASK_STATUSES.BLOCKED,
  TASK_STATUSES.DONE,
])

const validTaskStatuses = new Set(Object.values(TASK_STATUSES))

const allowedTransitions = Object.freeze({
  [TASK_STATUSES.BLOCKED]: [TASK_STATUSES.IN_PROGRESS],
  [TASK_STATUSES.DONE]: [TASK_STATUSES.TODO],
  [TASK_STATUSES.IN_PROGRESS]: [
    TASK_STATUSES.BLOCKED,
    TASK_STATUSES.DONE,
    TASK_STATUSES.WAITING_CLIENT,
  ],
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS],
  [TASK_STATUSES.WAITING_CLIENT]: [TASK_STATUSES.IN_PROGRESS],
})

function sortTaskStatuses(statuses) {
  return [...statuses].sort(
    (statusA, statusB) => taskStatusSelectionOrder.indexOf(statusA) - taskStatusSelectionOrder.indexOf(statusB),
  )
}

export function canTransitionTaskStatus(fromStatus, toStatus) {
  return allowedTransitions[fromStatus]?.includes(toStatus) ?? false
}

export function getTaskStatusTransitionTargets(fromStatus) {
  return [...allowedTransitions[fromStatus] ?? []]
}

export function getTaskStatusSelectionOptions({
  currentStatus,
  selectedStatus = currentStatus,
} = {}) {
  return sortTaskStatuses(new Set([
    currentStatus,
    selectedStatus,
    ...getTaskStatusTransitionTargets(currentStatus),
  ].filter((status) => validTaskStatuses.has(status))))
}
