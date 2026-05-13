export const CLIENT_STATUSES = Object.freeze({
  BLOCKED: 'blocked',
  NEEDS_ATTENTION: 'needs_attention',
  ON_TRACK: 'on_track',
  PAUSED: 'paused',
  SETUP: 'setup',
  WAITING_CLIENT: 'waiting_client',
})

export const CLIENT_STATUS_META = Object.freeze({
  [CLIENT_STATUSES.SETUP]: {
    icon: 'wrench',
    label: 'Setup',
    tone: 'neutral',
  },
  [CLIENT_STATUSES.ON_TRACK]: {
    icon: 'checkCircle2',
    label: 'On Track',
    tone: 'green',
  },
  [CLIENT_STATUSES.NEEDS_ATTENTION]: {
    icon: 'triangleAlert',
    label: 'Needs Attention',
    tone: 'amber',
  },
  [CLIENT_STATUSES.BLOCKED]: {
    icon: 'circleX',
    label: 'Blocked',
    tone: 'rose',
  },
  [CLIENT_STATUSES.WAITING_CLIENT]: {
    icon: 'clock',
    label: 'Waiting Client',
    tone: 'purple',
  },
  [CLIENT_STATUSES.PAUSED]: {
    icon: 'circlePause',
    label: 'Paused',
    tone: 'neutral',
  },
})
