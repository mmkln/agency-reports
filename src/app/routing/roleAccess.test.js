import { describe, expect, it } from 'vitest'

import { AGENCY_CAPABILITIES } from '../../entities/agency-membership'
import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import { routeAccessMetadataById } from './routeAccessMetadata'
import { canAccessRouteWithContext, filterRoutesForNavigation, NAVIGATION_SCOPES } from './roleAccess'

const AGENCY_ID = 'agency_1'
const WORKSPACE_ID = 'workspace_1'
const OTHER_WORKSPACE_ID = 'workspace_2'

function createViewer({
  agencyCapabilities = [],
  managedWorkspaceId = null,
  workspaceCapabilities = [],
  workspaceId = WORKSPACE_ID,
} = {}) {
  return {
    activeAgencyId: agencyCapabilities.length ? AGENCY_ID : null,
    activeWorkspaceId: workspaceId,
    agencyMemberships: agencyCapabilities.length
      ? [{
          agencyId: AGENCY_ID,
          capabilities: agencyCapabilities,
          role: 'agency_admin',
          status: 'active',
        }]
      : [],
    managedWorkspaceRelationships: managedWorkspaceId
      ? [{
          agencyId: AGENCY_ID,
          status: 'active',
          workspaceId: managedWorkspaceId,
        }]
      : [],
    userId: 'user_1',
    workspaceMemberships: workspaceCapabilities.length
      ? [{
          capabilities: workspaceCapabilities,
          role: 'owner',
          status: 'active',
          workspaceId,
        }]
      : [],
  }
}

describe('canAccessRouteWithContext', () => {
  it('allows public routes without a viewer', () => {
    expect(canAccessRouteWithContext(null, routeAccessMetadataById.landing)).toBe(true)
  })

  it('denies protected routes without a viewer', () => {
    expect(canAccessRouteWithContext(null, routeAccessMetadataById['dental-growth-review'])).toBe(false)
  })

  it('allows direct workspace members only for their requested workspace', () => {
    const viewer = createViewer({
      workspaceCapabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['dental-growth-review'], {
      routeParams: { clientId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['dental-growth-review'], {
      routeParams: { clientId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

  it('allows agency users only through managed workspace relationships', () => {
    const viewer = createViewer({
      agencyCapabilities: [AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW],
      managedWorkspaceId: WORKSPACE_ID,
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['dental-growth-review'], {
      routeParams: { clientId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['dental-growth-review'], {
      routeParams: { clientId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

  it('allows agency workspace access routes only through matching managed relationships', () => {
    const viewer = createViewer({
      agencyCapabilities: [AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS],
      managedWorkspaceId: WORKSPACE_ID,
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['agency-workspace-access'], {
      routeParams: { workspaceId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['agency-workspace-access'], {
      routeParams: { workspaceId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

  it('allows portal workspace review by workspace path param', () => {
    const viewer = createViewer({
      workspaceCapabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['portal-workspace-review'], {
      routeParams: { workspaceId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['portal-workspace-review'], {
      routeParams: { workspaceId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

  it('allows portal workspace executive by workspace path param', () => {
    const viewer = createViewer({
      workspaceCapabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['portal-workspace-executive'], {
      routeParams: { workspaceId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['portal-workspace-executive'], {
      routeParams: { workspaceId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

  it('allows agency workspace executive only through managed workspace relationships', () => {
    const viewer = createViewer({
      agencyCapabilities: [AGENCY_CAPABILITIES.VIEW_GROWTH_REVIEW],
      managedWorkspaceId: WORKSPACE_ID,
    })

    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['agency-workspace-executive'], {
      routeParams: { workspaceId: WORKSPACE_ID },
    })).toBe(true)
    expect(canAccessRouteWithContext(viewer, routeAccessMetadataById['agency-workspace-executive'], {
      routeParams: { workspaceId: OTHER_WORKSPACE_ID },
    })).toBe(false)
  })

})

describe('filterRoutesForNavigation', () => {
  it('keeps client navigation limited to accessible routes', () => {
    const viewer = createViewer({
      workspaceCapabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
    })
    const routes = [
      routeAccessMetadataById['dental-growth-review'],
      routeAccessMetadataById['executive-dashboard'],
      routeAccessMetadataById['client-settings'],
    ].map((route) => ({
      ...route,
      navigationScope: NAVIGATION_SCOPES.CLIENT_PORTAL,
    }))

    expect(filterRoutesForNavigation({
      routeParams: { clientId: WORKSPACE_ID },
      routes,
      viewer,
    }).map((route) => route.id)).toEqual(['dental-growth-review', 'executive-dashboard'])
  })
})
