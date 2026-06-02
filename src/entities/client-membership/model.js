export const CLIENT_MEMBERSHIP_STATUSES = Object.freeze({
  ACTIVE: 'active',
  REMOVED: 'removed',
})

export const CLIENT_ROLES = Object.freeze({
  OWNER: 'client_owner',
  ADMIN: 'client_admin',
  TEAM: 'client_team',
})

export const CLIENT_ROLE_META = Object.freeze({
  [CLIENT_ROLES.OWNER]: {
    label: 'Client Owner',
    tone: 'blue',
  },
  [CLIENT_ROLES.ADMIN]: {
    label: 'Client Admin',
    tone: 'blue',
  },
  [CLIENT_ROLES.TEAM]: {
    label: 'Client Team',
    tone: 'neutral',
  },
})

export function isActiveClientMembership(membership) {
  return membership?.status !== CLIENT_MEMBERSHIP_STATUSES.REMOVED
}
