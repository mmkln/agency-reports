import { CLIENT_TYPES } from '../../entities/client'
import {
  canManageAgencyWorkspace,
  canManageAgencyWorkspaceAccess,
} from '../policies/agencyAccessPolicy'
import {
  canAccessWorkspace,
  canManageWorkspaceMembers,
  canManageWorkspaceSettings,
} from '../policies/workspaceAccessPolicy'

export function getRouteAccessClientContext({
  clientId,
  repositories,
  viewer = null,
}) {
  if (!clientId) {
    return {
      canManageWorkspace: false,
      canManageWorkspaceAccess: false,
      canManageWorkspaceMembers: false,
      canManageWorkspaceSettings: false,
      canViewWorkspacePortal: false,
      clientId: null,
      clientType: CLIENT_TYPES.GENERIC,
      workspaceId: null,
      workspaceType: CLIENT_TYPES.GENERIC,
    }
  }

  const client = repositories.workspaces.findById(clientId)
  const workspaceType = client?.type ?? CLIENT_TYPES.GENERIC

  return {
    canManageWorkspace: canManageAgencyWorkspace(viewer, clientId),
    canManageWorkspaceAccess: canManageAgencyWorkspaceAccess(viewer, clientId),
    canManageWorkspaceMembers: canManageWorkspaceMembers(viewer, clientId),
    canManageWorkspaceSettings: canManageWorkspaceSettings(viewer, clientId),
    canViewWorkspacePortal: canAccessWorkspace(viewer, clientId),
    clientId,
    clientType: workspaceType,
    workspaceId: clientId,
    workspaceType,
  }
}
