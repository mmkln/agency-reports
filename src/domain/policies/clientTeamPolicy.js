import { isActiveWorkspaceMembership, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { canManageAgencyWorkspaceAccess } from './agencyAccessPolicy'
import { canManageWorkspaceMembers } from './workspaceAccessPolicy'

function findWorkspaceMembership({ repositories, viewer, workspaceId }) {
  if (!viewer?.userId || !repositories?.workspaceMemberships) {
    return null
  }

  return repositories.workspaceMemberships
    .listByWorkspaceId(workspaceId)
    .filter(isActiveWorkspaceMembership)
    .find((membership) => membership.user_id === viewer.userId) ?? null
}

export function canManageWorkspaceTeam({ repositories, viewer, workspaceId }) {
  if (!viewer || !workspaceId) {
    return false
  }

  const workspace = repositories.workspaces.findById(workspaceId)

  if (!workspace) {
    return false
  }

  const membership = findWorkspaceMembership({ repositories, viewer, workspaceId })

  return canManageAgencyWorkspaceAccess(viewer, workspaceId)
    || canManageWorkspaceMembers(viewer, workspaceId)
    || membership?.role === WORKSPACE_ROLES.OWNER
}

export function canManageClientTeam({ clientId, repositories, viewer }) {
  return canManageWorkspaceTeam({ repositories, viewer, workspaceId: clientId })
}

export function assertCanManageWorkspaceTeam({ repositories, viewer, workspaceId }) {
  if (!canManageWorkspaceTeam({ repositories, viewer, workspaceId })) {
    throw new Error('Only workspace admins can manage this workspace team.')
  }
}

export function assertCanManageClientTeam({ clientId, repositories, viewer }) {
  if (!canManageClientTeam({ clientId, repositories, viewer })) {
    throw new Error('Only client admins can manage this client team.')
  }
}
