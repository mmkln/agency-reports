import { describe, expect, it } from 'vitest'

import {
  AGENCY_CAPABILITIES,
  AGENCY_MEMBERSHIP_STATUSES,
  AGENCY_ROLES,
} from '../../entities/agency-membership'
import {
  AGENCY_WORKSPACE_RELATIONSHIP_STATUSES,
} from '../../entities/agency-workspace-relationship'
import { WORKSPACE_CAPABILITIES, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  buildViewerAccessContext,
  canManageWorkspace,
  canViewWorkspacePortal,
  hasAgencyCapability,
  hasWorkspaceCapability,
  listAccessibleWorkspaceIds,
  listManagedWorkspaceIds,
} from './viewerAccessContextService'

function collection(records = []) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
  }
}

function createRepositories({
  agencyMemberships = [],
  agencyWorkspaceRelationships = [],
  workspaceMemberships = [],
  workspaces = [],
} = {}) {
  return {
    agencyMemberships: collection(agencyMemberships),
    agencyWorkspaceRelationships: collection(agencyWorkspaceRelationships),
    workspaceMemberships: collection(workspaceMemberships),
    workspaces: collection(workspaces),
  }
}

describe('viewerAccessContextService', () => {
  it('builds agency access from agency membership plus managed workspace relationships', () => {
    const profile = {
      agency_id: 'legacy-agency',
      email: 'admin@example.com',
      id: 'profile-admin',
      name: 'Admin',
      user_id: 'user-admin',
    }
    const repositories = createRepositories({
      agencyMemberships: [{
        agency_id: 'agency-1',
        id: 'agency-membership-1',
        role: AGENCY_ROLES.ADMIN,
        status: AGENCY_MEMBERSHIP_STATUSES.ACTIVE,
        user_id: 'user-admin',
      }],
      agencyWorkspaceRelationships: [{
        agency_id: 'agency-1',
        id: 'relationship-1',
        status: AGENCY_WORKSPACE_RELATIONSHIP_STATUSES.ACTIVE,
        workspace_id: 'workspace-1',
      }],
    })

    const viewer = buildViewerAccessContext({ profile, repositories })

    expect(viewer.activeAgencyId).toBe('agency-1')
    expect(viewer.agencyId).toBeUndefined()
    expect(viewer.legacy).toBeUndefined()
    expect(listManagedWorkspaceIds(viewer)).toEqual(['workspace-1'])
    expect(canManageWorkspace(viewer, 'workspace-1')).toBe(true)
    expect(hasAgencyCapability(viewer, AGENCY_CAPABILITIES.MANAGE_TASKS, 'agency-1')).toBe(true)
  })

  it('builds workspace access from active workspace memberships and ignores profile client fallback for client users', () => {
    const profile = {
      agency_id: 'agency-1',
      client_id: 'legacy-workspace',
      email: 'frontdesk@example.com',
      id: 'profile-client',
      name: 'Front Desk',
      user_id: 'user-client',
    }
    const repositories = createRepositories({
      workspaceMemberships: [{
        id: 'workspace-membership-1',
        role: WORKSPACE_ROLES.VIEWER,
        user_id: 'user-client',
        workspace_id: 'workspace-1',
        workspace_role: WORKSPACE_ROLES.FRONT_DESK,
      }],
      workspaces: [{
        id: 'workspace-1',
        type: 'clinic',
      }],
    })

    const viewer = buildViewerAccessContext({ profile, repositories })

    expect(viewer.activeWorkspaceId).toBe('workspace-1')
    expect(viewer.clientId).toBeUndefined()
    expect(viewer.clientIds).toBeUndefined()
    expect(viewer.legacy).toBeUndefined()
    expect(listAccessibleWorkspaceIds(viewer)).toEqual(['workspace-1'])
    expect(canViewWorkspacePortal(viewer, 'workspace-1')).toBe(true)
    expect(hasWorkspaceCapability(viewer, WORKSPACE_CAPABILITIES.RESPOND_TO_ACTIONS, 'workspace-1')).toBe(true)
  })

  it('does not grant client portal access from profile client_id when membership is removed', () => {
    const profile = {
      agency_id: 'agency-1',
      client_id: 'workspace-1',
      email: 'client@example.com',
      id: 'profile-client',
      name: 'Client',
      user_id: 'user-client',
    }
    const repositories = createRepositories({
      workspaceMemberships: [{
        id: 'workspace-membership-1',
        role: WORKSPACE_ROLES.OWNER,
        status: 'removed',
        user_id: 'user-client',
        workspace_id: 'workspace-1',
      }],
    })

    const viewer = buildViewerAccessContext({ profile, repositories })

    expect(viewer.activeWorkspaceId).toBeNull()
    expect(viewer.clientId).toBeUndefined()
    expect(viewer.clientIds).toBeUndefined()
    expect(canViewWorkspacePortal(viewer, 'workspace-1')).toBe(false)
  })
})
