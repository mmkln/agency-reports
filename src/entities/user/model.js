export const USER_STATUSES = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export function isActiveUser(user) {
  return user?.status !== USER_STATUSES.INACTIVE
}

