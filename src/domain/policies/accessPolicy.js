import { USER_ROLES } from '../../entities/profile'

export function canAccessClient(viewer, clientId) {
  if (!viewer || !clientId) {
    return false
  }

  if (viewer.role === USER_ROLES.AGENCY_ADMIN) {
    return viewer.agencyId ? true : false
  }

  if (viewer.role === USER_ROLES.AGENCY_TEAM) {
    return viewer.clientIds?.includes(clientId) ?? false
  }

  if (viewer.role === USER_ROLES.CLIENT_USER) {
    return viewer.clientIds?.includes(clientId) ?? false
  }

  return false
}
