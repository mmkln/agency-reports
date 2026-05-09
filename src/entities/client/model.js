export const CLIENT_STATUSES = Object.freeze({
  BLOCKED: 'blocked',
  NEEDS_ATTENTION: 'needs_attention',
  ON_TRACK: 'on_track',
  PAUSED: 'paused',
  WAITING_CLIENT: 'waiting_client',
})

export const CLIENT_STATUS_META = Object.freeze({
  [CLIENT_STATUSES.ON_TRACK]: {
    label: 'On Track',
    tone: 'green',
  },
  [CLIENT_STATUSES.NEEDS_ATTENTION]: {
    label: 'Needs Attention',
    tone: 'amber',
  },
  [CLIENT_STATUSES.BLOCKED]: {
    label: 'Blocked',
    tone: 'rose',
  },
  [CLIENT_STATUSES.WAITING_CLIENT]: {
    label: 'Waiting Client',
    tone: 'amber',
  },
  [CLIENT_STATUSES.PAUSED]: {
    label: 'Paused',
    tone: 'neutral',
  },
})
