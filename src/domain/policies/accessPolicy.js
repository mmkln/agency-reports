import { canManageAgencyWorkspace } from './agencyAccessPolicy'
import { canAccessWorkspace } from './workspaceAccessPolicy'

export function canAccessClient(viewer, clientId) {
  if (!viewer || !clientId) {
    return false
  }

  return canAccessWorkspace(viewer, clientId) || canManageAgencyWorkspace(viewer, clientId)
}
