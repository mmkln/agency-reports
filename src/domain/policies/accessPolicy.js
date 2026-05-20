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

  if ([USER_ROLES.CLIENT_ADMIN, USER_ROLES.CLIENT_TEAM].includes(viewer.role)) {
    return viewer.clientIds?.includes(clientId) ?? false
  }

  return false
}
