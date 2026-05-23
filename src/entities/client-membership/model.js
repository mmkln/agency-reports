export const CLIENT_MEMBERSHIP_ROLES = Object.freeze({
  OWNER: 'owner',
  VIEWER: 'viewer',
})

export const CLIENT_MEMBERSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  REMOVED: 'removed',
})

export const CLIENT_MEMBERSHIP_ROLE_META = Object.freeze({
  [CLIENT_MEMBERSHIP_ROLES.OWNER]: {
    label: 'Owner',
    tone: 'blue',
  },
  [CLIENT_MEMBERSHIP_ROLES.VIEWER]: {
    label: 'Viewer',
    tone: 'neutral',
  },
})

export function isActiveClientMembership(membership) {
  return membership?.status !== CLIENT_MEMBERSHIP_STATUSES.REMOVED
}
