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

export function getTaskStatusMeta(status) {
  return TASK_STATUS_META[status] ?? {
    icon: 'circle',
    label: status || 'Unknown',
    tone: 'neutral',
  }
}

export function formatTaskDueDate(date) {
  if (!date) {
    return 'No due date'
  }

  const dueDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDay = new Date(dueDate)
  dueDay.setHours(0, 0, 0, 0)

  const dayDifference = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000)

  if (dayDifference === 0) {
    return 'Today'
  }

  if (dayDifference === 1) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dueDate)
}

export function isTaskAttentionNeeded(task) {
  return Boolean(task?.blockerNote)
    || task?.status === TASK_STATUSES.BLOCKED
    || task?.status === TASK_STATUSES.WAITING_CLIENT
}
