export const NEEDED_ACTION_STATUSES = Object.freeze({
  ANSWERED: 'answered',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  RESOLVED: 'resolved',
})

export const NEEDED_ACTION_STATUS_META = Object.freeze({
  [NEEDED_ACTION_STATUSES.PENDING]: {
    icon: 'clock',
    label: 'Pending',
    tone: 'amber',
  },
  [NEEDED_ACTION_STATUSES.ANSWERED]: {
    icon: 'messageSquare',
    label: 'Answered',
    tone: 'blue',
  },
  [NEEDED_ACTION_STATUSES.RESOLVED]: {
    icon: 'checkCircle2',
    label: 'Resolved',
    tone: 'green',
  },
  [NEEDED_ACTION_STATUSES.CANCELLED]: {
    icon: 'circleX',
    label: 'Cancelled',
    tone: 'neutral',
  },
})
