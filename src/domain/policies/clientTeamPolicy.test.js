import { describe, expect, it } from 'vitest'

import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import { canManageClientTeam } from './clientTeamPolicy'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
})

function createRepositories() {
  return {
    workspaceMemberships: {
      listByWorkspaceId: () => [],
    },
    workspaces: {
      findById(clientId) {
        return [
          {
            agency_id: IDS.AGENCY,
            id: IDS.CLIENT_A,
          },
          {
            agency_id: 'other-agency',
            id: IDS.CLIENT_B,
          },
        ].find((client) => client.id === clientId) ?? null
      },
    },
  }
}

function createAgencyAccessViewer({ capabilities = [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS] } = {}) {
  return {
    agencyMemberships: [{
      agencyId: IDS.AGENCY,
      capabilities,
    }],
    managedWorkspaceRelationships: [{
      agencyId: IDS.AGENCY,
      workspaceId: IDS.CLIENT_A,
    }],
    workspaceMemberships: [],
  }
}

function createWorkspaceViewer({ capabilities = [WORKSPACE_CAPABILITIES.MANAGE_MEMBERS] } = {}) {
  return {
    agencyMemberships: [],
    managedWorkspaceRelationships: [],
    workspaceMemberships: [{
      capabilities,
      workspaceId: IDS.CLIENT_A,
    }],
  }
}

describe('clientTeamPolicy', () => {
  it('allows agency users with managed workspace access capability', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAgencyAccessViewer(),
    })).toBe(true)
  })

  it('blocks agency users without the workspace access capability', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAgencyAccessViewer({ capabilities: [] }),
    })).toBe(false)
  })

  it('allows workspace users with member management capability', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createWorkspaceViewer(),
    })).toBe(true)
  })

  it('blocks workspace users without member management capability', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createWorkspaceViewer({ capabilities: [WORKSPACE_CAPABILITIES.VIEW_PORTAL] }),
    })).toBe(false)
  })

  it('blocks unknown workspaces', () => {
    expect(canManageClientTeam({
      clientId: 'missing-client',
      repositories: createRepositories(),
      viewer: createWorkspaceViewer(),
    })).toBe(false)
  })
})
