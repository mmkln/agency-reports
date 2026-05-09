export const TASK_STATUSES = Object.freeze({
  BLOCKED: 'blocked',
  DONE: 'done',
  IN_PROGRESS: 'in_progress',
  TODO: 'todo',
  WAITING_CLIENT: 'waiting_client',
})

export const TASK_STATUS_META = Object.freeze({
  [TASK_STATUSES.TODO]: {
    label: 'To Do',
    tone: 'neutral',
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    tone: 'blue',
  },
  [TASK_STATUSES.WAITING_CLIENT]: {
    label: 'Waiting Client',
    tone: 'amber',
  },
  [TASK_STATUSES.BLOCKED]: {
    label: 'Blocked',
    tone: 'rose',
  },
  [TASK_STATUSES.DONE]: {
    label: 'Done',
    tone: 'green',
  },
})
