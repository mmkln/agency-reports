import { describe, expect, it } from 'vitest'

import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { WORKSPACE_CAPABILITIES } from '../../entities/workspace-membership'
import { canAccessClient } from './accessPolicy'

const CLIENT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const CLIENT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const AGENCY_ID = '11111111-1111-4111-8111-111111111111'

function createAgencyViewer() {
  return {
    activeAgencyId: AGENCY_ID,
    agencyMemberships: [{
      agencyId: AGENCY_ID,
      capabilities: [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS],
    }],
    managedWorkspaceRelationships: [{
      agencyId: AGENCY_ID,
      workspaceId: CLIENT_A_ID,
    }],
    workspaceMemberships: [],
  }
}

function createWorkspaceViewer() {
  return {
    agencyMemberships: [],
    managedWorkspaceRelationships: [],
    workspaceMemberships: [{
      capabilities: [WORKSPACE_CAPABILITIES.VIEW_PORTAL],
      workspaceId: CLIENT_A_ID,
    }],
  }
}

describe('canAccessClient', () => {
  it('allows agency users through managed workspace relationships', () => {
    const viewer = createAgencyViewer()

    expect(canAccessClient(viewer, CLIENT_A_ID)).toBe(true)
    expect(canAccessClient(viewer, CLIENT_B_ID)).toBe(false)
  })

  it('allows workspace users through active workspace memberships', () => {
    const viewer = createWorkspaceViewer()

    expect(canAccessClient(viewer, CLIENT_A_ID)).toBe(true)
    expect(canAccessClient(viewer, CLIENT_B_ID)).toBe(false)
  })

  it('does not grant access from legacy viewer role/client fields', () => {
    const viewer = {
      clientId: CLIENT_A_ID,
      clientIds: [CLIENT_A_ID],
      role: 'client_admin',
    }

    expect(canAccessClient(viewer, CLIENT_A_ID)).toBe(false)
  })

  it('denies missing viewer or client id', () => {
    expect(canAccessClient(null, CLIENT_A_ID)).toBe(false)
    expect(canAccessClient(createWorkspaceViewer(), '')).toBe(false)
  })
})
