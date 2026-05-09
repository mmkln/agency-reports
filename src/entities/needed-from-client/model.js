export const NEEDED_ACTION_STATUSES = Object.freeze({
  ANSWERED: 'answered',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  RESOLVED: 'resolved',
})

export const NEEDED_ACTION_STATUS_META = Object.freeze({
  [NEEDED_ACTION_STATUSES.PENDING]: {
    label: 'Pending',
    tone: 'amber',
  },
  [NEEDED_ACTION_STATUSES.ANSWERED]: {
    label: 'Answered',
    tone: 'blue',
  },
  [NEEDED_ACTION_STATUSES.RESOLVED]: {
    label: 'Resolved',
    tone: 'green',
  },
  [NEEDED_ACTION_STATUSES.CANCELLED]: {
    label: 'Cancelled',
    tone: 'neutral',
  },
})
