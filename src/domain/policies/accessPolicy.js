import { canManageAgencyWorkspace } from './agencyAccessPolicy'
import { canAccessWorkspace } from './workspaceAccessPolicy'

export function canAccessWorkspaceResource(viewer, workspaceId) {
  if (!viewer || !workspaceId) {
    return false
  }

  return canAccessWorkspace(viewer, workspaceId) || canManageAgencyWorkspace(viewer, workspaceId)
}

export function canAccessClient(viewer, clientId) {
  return canAccessWorkspaceResource(viewer, clientId)
}
