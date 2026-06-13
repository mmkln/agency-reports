import { describe, expect, it } from 'vitest'

import { AGENCY_CAPABILITIES, AGENCY_ROLES } from '../../entities/agency-membership'
import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import { getHomeHrefForViewer } from './viewerHomeService'

describe('viewerHomeService', () => {
  it('sends anonymous viewers to login', () => {
    expect(getHomeHrefForViewer(null)).toBe('/login')
  })

  it('sends agency admins with workspace management access to client management', () => {
    expect(getHomeHrefForViewer({
      agencyMemberships: [{
        capabilities: [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_RELATIONSHIPS],
        role: AGENCY_ROLES.ADMIN,
      }],
    })).toBe('/agency/clients')
  })

  it('sends clinic workspace members with growth review access to Growth Review', () => {
    expect(getHomeHrefForViewer({
      workspaceMemberships: [{
        capabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
        workspaceId: 'workspace_1',
        workspaceType: 'clinic',
      }],
    })).toBe('/portal/growth-review?clientId=workspace_1')
  })

  it('sends workspace members without growth review access to workspace settings', () => {
    expect(getHomeHrefForViewer({
      activeWorkspaceId: 'workspace_1',
      workspaceMemberships: [{
        capabilities: [],
        workspaceId: 'workspace_1',
        workspaceType: 'clinic',
      }],
    })).toBe('/portal/settings?clientId=workspace_1')
  })
})
