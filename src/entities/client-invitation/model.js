export const CLIENT_INVITATION_STATUSES = Object.freeze({
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
})

export const CLIENT_INVITATION_STATUS_META = Object.freeze({
  [CLIENT_INVITATION_STATUSES.PENDING]: {
    icon: 'mail',
    label: 'Pending',
    tone: 'blue',
  },
  [CLIENT_INVITATION_STATUSES.ACCEPTED]: {
    icon: 'checkCircle2',
    label: 'Accepted',
    tone: 'green',
  },
  [CLIENT_INVITATION_STATUSES.EXPIRED]: {
    icon: 'clock',
    label: 'Expired',
    tone: 'amber',
  },
  [CLIENT_INVITATION_STATUSES.CANCELLED]: {
    icon: 'circleX',
    label: 'Cancelled',
    tone: 'rose',
  },
})
