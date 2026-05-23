import { isActiveWorkspaceMembership, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { canManageAgencyWorkspaceAccess } from './agencyAccessPolicy'
import { canManageWorkspaceMembers } from './workspaceAccessPolicy'

function findClientMembership({ clientId, repositories, viewer }) {
  if (!viewer?.userId || !repositories?.workspaceMemberships) {
    return null
  }

  return repositories.workspaceMemberships
    .listByWorkspaceId(clientId)
    .filter(isActiveWorkspaceMembership)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

export function canManageClientTeam({ clientId, repositories, viewer }) {
  if (!viewer || !clientId) {
    return false
  }

  const client = repositories.workspaces.findById(clientId)

  if (!client) {
    return false
  }

  const membership = findClientMembership({ clientId, repositories, viewer })

    return canManageAgencyWorkspaceAccess(viewer, clientId)
    || canManageWorkspaceMembers(viewer, clientId)
    || membership?.role === WORKSPACE_ROLES.OWNER
}

export function assertCanManageClientTeam({ clientId, repositories, viewer }) {
  if (!canManageClientTeam({ clientId, repositories, viewer })) {
    throw new Error('Only client admins can manage this client team.')
  }
}
