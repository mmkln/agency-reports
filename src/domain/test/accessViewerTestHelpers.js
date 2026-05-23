import { AGENCY_CAPABILITIES, AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_CAPABILITIES, WORKSPACE_ROLES } from '../../entities/workspace-membership'

export function createAgencyAccessViewer({
  agencyId = 'agency-a',
  capabilities = [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS],
  managedWorkspaceIds = [],
  name = 'Agency User',
  role = AGENCY_ROLES.ADMIN,
  userId = 'agency-user',
} = {}) {
  return {
    activeAgencyId: agencyId,
    agencyMemberships: [{
      agencyId,
      capabilities,
      role,
      userId,
    }],
    capabilities,
    managedWorkspaceRelationships: managedWorkspaceIds.map((workspaceId) => ({
      agencyId,
      status: 'active',
      workspaceId,
    })),
    name,
    userId,
    workspaceMemberships: [],
  }
}

export function createWorkspaceAccessViewer({
  capabilities = [WORKSPACE_CAPABILITIES.VIEW_PORTAL],
  name = 'Workspace User',
  role = WORKSPACE_ROLES.VIEWER,
  userId = 'workspace-user',
  workspaceId = 'workspace-a',
} = {}) {
  return {
    activeWorkspaceId: workspaceId,
    agencyMemberships: [],
    capabilities,
    managedWorkspaceRelationships: [],
    name,
    userId,
    workspaceMemberships: [{
      capabilities,
      role,
      userId,
      workspaceId,
    }],
  }
}
