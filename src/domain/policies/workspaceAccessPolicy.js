import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import {
  canViewWorkspacePortal,
  hasWorkspaceCapability,
  listAccessibleWorkspaceIds,
} from '../services/viewerAccessContextService'

export function canAccessWorkspace(viewer, workspaceId) {
  if (!viewer || !workspaceId) {
    return false
  }

  return canViewWorkspacePortal(viewer, workspaceId)
}

export function canRespondToWorkspaceActions(viewer, workspaceId) {
  return hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS, workspaceId)
}

export function canCreateWorkspaceRequests(viewer, workspaceId) {
  return hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.CREATE_REQUESTS, workspaceId)
}

export function canManageWorkspaceSettings(viewer, workspaceId) {
  return hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.MANAGE_SETTINGS, workspaceId)
}

export function canManageWorkspaceMembers(viewer, workspaceId) {
  return hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.MANAGE_MEMBERS, workspaceId)
}

export function canRequestWorkspaceDeletion(viewer, workspaceId) {
  return hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.REQUEST_DELETION, workspaceId)
}

export function assertCanAccessWorkspace(viewer, workspaceId) {
  if (!canAccessWorkspace(viewer, workspaceId)) {
    throw new Error('You do not have permission to view this workspace.')
  }
}

export function getFirstAccessibleWorkspaceId(viewer) {
  return listAccessibleWorkspaceIds(viewer)[0] ?? null
}

