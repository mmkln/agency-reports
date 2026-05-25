import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_REPORTING_CAPABILITIES,
} from '../../entities/profile'
import { AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { ACCESS_AUDIENCES } from '../../domain/policies/accessAudience'
import { iconNames } from '../../shared/icons'
import { routeMetadata } from './routeDefinitions'
import {
  canAccessRoute,
  canAccessRouteWithContext,
  filterRoutesForNavigation,
  filterRoutesForViewer,
  NAVIGATION_SCOPES,
} from './roleAccess'

const routes = [
  {
    id: 'public',
    label: 'Public',
  },
  {
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    id: 'admin',
    label: 'Admin',
  },
  {
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_MEMBER],
    id: 'team',
    label: 'Team',
  },
  {
    accessAudiences: [ACCESS_AUDIENCES.WORKSPACE_ADMIN],
    id: 'client',
    label: 'Client',
  },
]

function createRepositories(clientType = CLIENT_TYPES.GENERIC) {
  return {
    workspaces: {
      findById(id) {
        return ['client-a', 'client-b'].includes(id)
          ? {
              id,
              type: clientType,
            }
          : null
      },
    },
  }
}

function createAgencyViewer({
  capabilities = Object.values(CLINIC_REPORTING_CAPABILITIES),
  role = AGENCY_ROLES.ADMIN,
} = {}) {
  return {
    activeAgencyId: 'agency-a',
    agencyMemberships: [{
      agencyId: 'agency-a',
      capabilities,
      role,
      userId: 'user-agency',
    }],
    capabilities,
    managedWorkspaceRelationships: [{
      agencyId: 'agency-a',
      status: 'active',
      workspaceId: 'client-a',
    }],
    userId: 'user-agency',
    workspaceMemberships: [],
  }
}

function createClientViewer({
  capabilities = [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
  role = WORKSPACE_ROLES.CLINIC_OWNER,
  workspaceId = 'client-a',
} = {}) {
  return {
    activeWorkspaceId: workspaceId,
    agencyMemberships: [],
    capabilities,
    managedWorkspaceRelationships: [],
    userId: 'user-workspace',
    workspaceMemberships: [{
      capabilities,
      role,
      userId: 'user-workspace',
      workspaceId,
    }],
  }
}

function visibleNavIdsFor({ clientType = CLIENT_TYPES.GENERIC, defaultClientId = 'client-a', viewer }) {
  return filterRoutesForNavigation({
    defaultClientId,
    repositories: createRepositories(clientType),
    routes: routeMetadata,
    viewer,
  })
    .filter((route) => route.showInNav !== false)
    .map((route) => route.id)
}

describe('route audience access', () => {
  it('allows public routes without access audience metadata', () => {
    expect(canAccessRoute(null, routes[0])).toBe(true)
  })

  it('allows only matching audiences for protected routes', () => {
    expect(canAccessRoute(createAgencyViewer(), routes[1])).toBe(true)
    expect(canAccessRoute(createClientViewer(), routes[1])).toBe(false)
    expect(canAccessRoute({ role: ACCESS_AUDIENCES.AGENCY_ADMIN }, routes[1])).toBe(false)
  })

  it('filters route lists to audience-accessible routes', () => {
    expect(filterRoutesForViewer(routes, createAgencyViewer({ role: AGENCY_ROLES.TEAM })).map((route) => route.id)).toEqual([
      'public',
      'team',
    ])
  })

  it('keeps only lean route ids registered', () => {
    expect(routeMetadata.map((route) => route.id)).toEqual([
      'landing',
      'accept-invite',
      'login',
      'access-denied',
      'account-settings',
      'admin-clients',
      'admin-client-access',
      'admin-clinic-setup',
      'admin-clinic-data-sources',
      'dental-growth-review',
      'client-settings',
    ])
  })

  it('keeps account settings accessible to every authenticated role and visible in agency navigation', () => {
    const accountSettingsRoute = routeMetadata.find((route) => route.id === 'account-settings')

    expect(accountSettingsRoute).toBeTruthy()
    expect(accountSettingsRoute).toMatchObject({
      iconName: 'settings',
      label: 'Settings',
      navigationScope: NAVIGATION_SCOPES.AGENCY,
    })
    ;[
      createAgencyViewer(),
      createAgencyViewer({ role: AGENCY_ROLES.TEAM }),
      createClientViewer(),
      createClientViewer({ role: WORKSPACE_ROLES.FRONT_DESK }),
    ].forEach((viewer) => {
      expect(canAccessRoute(viewer, accountSettingsRoute)).toBe(true)
    })

    expect(visibleNavIdsFor({
      viewer: createClientViewer(),
    })).not.toContain('account-settings')
  })

  it('keeps general agency navigation limited to clients and settings', () => {
    const adminNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createAgencyViewer(),
    })

    expect(adminNavIds).toEqual(['admin-clients', 'account-settings'])
    expect(adminNavIds).not.toContain('dental-growth-review')
  })

  it('keeps clinic client navigation focused on Growth Review and settings', () => {
    const clientNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createClientViewer(),
    })

    expect(clientNavIds).toEqual([
      'dental-growth-review',
      'client-settings',
    ])
    expect(routeMetadata.find((route) => route.id === 'dental-growth-review')).toMatchObject({
      iconName: 'trendingUp',
      navLabel: 'Growth Review',
      pageTitle: 'Growth Review',
      path: '/client/growth-review',
    })
  })

  it('keeps non-clinic client navigation limited to workspace settings', () => {
    const clientNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.GENERIC,
      viewer: createClientViewer(),
    })

    expect(clientNavIds).toEqual(['client-settings'])
  })

  it('keeps client users without Dental Growth Review capability on settings only', () => {
    const frontDeskNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createClientViewer({
        capabilities: [],
        role: WORKSPACE_ROLES.FRONT_DESK,
      }),
    })

    expect(frontDeskNavIds).toEqual(['client-settings'])
  })

  it('requires matching client type for Dental Growth Review routes', () => {
    const growthReviewRoute = routeMetadata.find((route) => route.id === 'dental-growth-review')
    const clinicSetupRoute = routeMetadata.find((route) => route.id === 'admin-clinic-setup')

    expect(canAccessRouteWithContext(createClientViewer(), growthReviewRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.GENERIC),
    })).toBe(false)
    expect(canAccessRouteWithContext(createClientViewer(), growthReviewRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
    })).toBe(true)
    expect(canAccessRouteWithContext(createAgencyViewer(), clinicSetupRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.GENERIC),
    })).toBe(false)
    expect(canAccessRouteWithContext(createAgencyViewer(), clinicSetupRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
    })).toBe(true)
  })

  it('blocks client users from changing client context through URL params', () => {
    const growthReviewRoute = routeMetadata.find((route) => route.id === 'dental-growth-review')

    expect(canAccessRouteWithContext(createClientViewer(), growthReviewRoute, {
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
      routeParams: {
        clientId: 'client-b',
      },
    })).toBe(false)
  })

  it('keeps admin workspace setup routes inaccessible to client users', () => {
    const adminWorkspaceRouteIds = [
      'admin-client-access',
      'admin-clinic-setup',
      'admin-clinic-data-sources',
    ]
    const adminWorkspaceRoutes = routeMetadata.filter((route) => adminWorkspaceRouteIds.includes(route.id))

    expect(adminWorkspaceRoutes).toHaveLength(adminWorkspaceRouteIds.length)
    adminWorkspaceRoutes.forEach((route) => {
      expect(route.showInNav).toBe(false)
      expect(canAccessRoute(createAgencyViewer(), route)).toBe(true)
      expect(canAccessRoute(createClientViewer(), route)).toBe(false)
    })
  })

  it('uses registered icons for every visible navigation route and group', () => {
    const visibleRoutes = routeMetadata.filter((route) => route.showInNav !== false)

    visibleRoutes.forEach((route) => {
      expect(iconNames).toContain(route.iconName)

      if (route.navGroup?.iconName) {
        expect(iconNames).toContain(route.navGroup.iconName)
      }
    })
  })

  it('assigns every visible navigation route to an explicit sidebar container', () => {
    const validScopes = new Set(Object.values(NAVIGATION_SCOPES))
    const visibleRoutes = routeMetadata.filter((route) => route.showInNav !== false)

    visibleRoutes.forEach((route) => {
      const scopes = route.navigationScopes ?? [route.navigationScope]

      expect(scopes, `${route.id} should define navigationScope or navigationScopes`).not.toContain(undefined)
      scopes.forEach((scope) => {
        expect(validScopes.has(scope), `${route.id} uses an unknown navigation scope`).toBe(true)
      })
    })
  })
})
