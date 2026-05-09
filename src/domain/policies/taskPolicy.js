import { TASK_STATUSES } from '../../entities/task'

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

export function canTransitionTaskStatus(fromStatus, toStatus) {
  return allowedTransitions[fromStatus]?.includes(toStatus) ?? false
}
