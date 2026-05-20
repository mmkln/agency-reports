import { CLIENT_MEMBERSHIP_ROLES, isActiveClientMembership } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'

function findClientMembership({ clientId, repositories, viewer }) {
  if (!viewer?.userId || !repositories?.clientMemberships) {
    return null
  }

  return repositories.clientMemberships
    .listByClientId(clientId)
    .filter(isActiveClientMembership)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

export function canManageClientTeam({ clientId, repositories, viewer }) {
  if (!viewer || !clientId) {
    return false
  }

  const client = repositories.clients.findById(clientId)

  if (!client) {
    return false
  }

  if (viewer.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId && client.agency_id === viewer.agencyId)
  }

  if (viewer.role !== USER_ROLES.CLIENT_ADMIN) {
    return false
  }

  if (!viewer.clientIds?.includes(clientId)) {
    return false
  }

  const membership = findClientMembership({ clientId, repositories, viewer })

  return membership?.role === CLIENT_MEMBERSHIP_ROLES.OWNER
}

export function assertCanManageClientTeam({ clientId, repositories, viewer }) {
  if (!canManageClientTeam({ clientId, repositories, viewer })) {
    throw new Error('Only client admins can manage this client team.')
  }
}
