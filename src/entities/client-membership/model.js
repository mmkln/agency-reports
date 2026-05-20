export const CLIENT_MEMBERSHIP_ROLES = Object.freeze({
  OWNER: 'owner',
  VIEWER: 'viewer',
})

export const CLIENT_MEMBERSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  REMOVED: 'removed',
})

export function isActiveClientMembership(membership) {
  return membership?.status !== CLIENT_MEMBERSHIP_STATUSES.REMOVED
}
