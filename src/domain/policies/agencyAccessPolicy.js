import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import {
  canManageWorkspace,
  hasAgencyCapability,
} from '../services/viewerAccessContextService'

export function canAccessAgency(viewer, agencyId = viewer?.activeAgencyId) {
  if (!viewer || !agencyId) {
    return false
  }

  return (viewer.agencyMemberships ?? []).some((membership) => membership.agencyId === agencyId)
}

export function canCreateWorkspaceForAgency(viewer, agencyId = viewer?.activeAgencyId) {
  return hasAgencyCapability(viewer, AGENCY_CAPABILITIES.CREATE_WORKSPACE, agencyId)
}

export function canManageAgencyWorkspace(viewer, workspaceId) {
  if (!viewer || !workspaceId) {
    return false
  }

  return canManageWorkspace(viewer, workspaceId)
}

export function canManageAgencyWorkspaceAccess(viewer, workspaceId) {
  if (!canManageAgencyWorkspace(viewer, workspaceId)) {
    return false
  }

  const relationship = (viewer.managedWorkspaceRelationships ?? [])
    .find((item) => item.workspaceId === workspaceId)

  return hasAgencyCapability(viewer, AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS, relationship?.agencyId)
}

export function canManageAgencyTasks(viewer, agencyId = viewer?.activeAgencyId) {
  return hasAgencyCapability(viewer, AGENCY_CAPABILITIES.MANAGE_TASKS, agencyId)
}

export function assertCanManageAgencyWorkspace(viewer, workspaceId) {
  if (!canManageAgencyWorkspace(viewer, workspaceId)) {
    throw new Error('You do not have permission to manage this workspace.')
  }
}

export function assertCanManageAgencyWorkspaceAccess(viewer, workspaceId) {
  if (!canManageAgencyWorkspaceAccess(viewer, workspaceId)) {
    throw new Error('You do not have permission to manage this workspace access.')
  }
}

