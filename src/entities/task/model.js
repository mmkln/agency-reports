export const TASK_STATUSES = Object.freeze({
  BLOCKED: 'blocked',
  DONE: 'done',
  IN_PROGRESS: 'in_progress',
  TODO: 'todo',
  WAITING_CLIENT: 'waiting_client',
})

export const TASK_STATUS_META = Object.freeze({
  [TASK_STATUSES.TODO]: {
    icon: 'circle',
    label: 'To Do',
    tone: 'neutral',
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    icon: 'clock',
    label: 'In Progress',
    tone: 'blue',
  },
  [TASK_STATUSES.WAITING_CLIENT]: {
    icon: 'clock',
    label: 'Waiting Client',
    tone: 'purple',
  },
  [TASK_STATUSES.BLOCKED]: {
    icon: 'circleX',
    label: 'Blocked',
    tone: 'rose',
  },
  [TASK_STATUSES.DONE]: {
    icon: 'checkCircle2',
    label: 'Done',
    tone: 'green',
  },
})
