import { describe, expect, it } from 'vitest'

import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { CLIENT_TYPES } from '../../entities/client'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import { getRouteAccessClientContext } from './routeAccessContextService'

function createRepositories(clients = []) {
  const workspaces = {
    findById(id) {
      return clients.find((client) => client.id === id) ?? null
    },
  }

  return {
    clients: {
      findById(id) {
        return clients.find((client) => client.id === id) ?? null
      },
    },
    workspaces,
  }
}

describe('routeAccessContextService', () => {
  it('returns generic context without a requested client', () => {
    expect(getRouteAccessClientContext({
      clientId: null,
      repositories: createRepositories(),
    })).toEqual({
      canManageWorkspace: false,
      canManageWorkspaceAccess: false,
      canManageWorkspaceMembers: false,
      canManageWorkspaceSettings: false,
      canViewWorkspacePortal: false,
      clientId: null,
      clientType: CLIENT_TYPES.GENERIC,
      workspaceId: null,
      workspaceType: CLIENT_TYPES.GENERIC,
    })
  })

  it('returns the requested client type when available', () => {
    expect(getRouteAccessClientContext({
      clientId: 'client-a',
      repositories: createRepositories([
        {
          id: 'client-a',
          type: CLIENT_TYPES.CLINIC,
        },
      ]),
    })).toMatchObject({
      clientId: 'client-a',
      clientType: CLIENT_TYPES.CLINIC,
      workspaceId: 'client-a',
      workspaceType: CLIENT_TYPES.CLINIC,
    })
  })

  it('falls back to generic for unknown requested clients', () => {
    expect(getRouteAccessClientContext({
      clientId: 'missing-client',
      repositories: createRepositories(),
    })).toMatchObject({
      clientId: 'missing-client',
      clientType: CLIENT_TYPES.GENERIC,
      workspaceId: 'missing-client',
      workspaceType: CLIENT_TYPES.GENERIC,
    })
  })

  it('returns workspace access flags for the requested route context', () => {
    expect(getRouteAccessClientContext({
      clientId: 'client-a',
      repositories: createRepositories([
        {
          id: 'client-a',
          type: CLIENT_TYPES.CLINIC,
        },
      ]),
      viewer: {
        agencyMemberships: [{
          agencyId: 'agency-a',
          capabilities: [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS],
        }],
        managedWorkspaceRelationships: [{
          agencyId: 'agency-a',
          workspaceId: 'client-a',
        }],
        workspaceMemberships: [{
          capabilities: [
            WORKSPACE_CAPABILITIES.VIEW_PORTAL,
            WORKSPACE_CAPABILITIES.MANAGE_MEMBERS,
          ],
          workspaceId: 'client-a',
        }],
      },
    })).toMatchObject({
      canManageWorkspace: true,
      canManageWorkspaceAccess: true,
      canManageWorkspaceMembers: true,
      canManageWorkspaceSettings: false,
      canViewWorkspacePortal: true,
      workspaceId: 'client-a',
      workspaceType: CLIENT_TYPES.CLINIC,
    })
  })
})
