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
  capabilities = [
    CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
    CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
  ],
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

  it('shows the clinic operator route in agency team navigation', () => {
    const teamNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createAgencyViewer({
        capabilities: [CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW],
        role: AGENCY_ROLES.TEAM,
      }),
    })

    expect(teamNavIds).toContain('team-tasks')
    expect(teamNavIds).toContain('team-clinic-operator')
  })

  it('keeps client navigation aligned to the mature Client Control Center IA', () => {
    const clientNavIds = visibleNavIdsFor({
      viewer: createClientViewer(),
    })

    expect(clientNavIds).toEqual([
      'client-overview',
      'client-action-needed',
      'client-projects',
      'client-reports-dashboards',
      'client-requests',
      'client-files-links',
      'client-updates',
      'client-settings',
    ])
    expect(clientNavIds).not.toContain('client-dashboard')
    expect(clientNavIds).not.toContain('client-executive-performance')
    expect(clientNavIds).not.toContain('client-performance')
    expect(clientNavIds).not.toContain('client-monthly-strategy')
    expect(clientNavIds).not.toContain('client-reports')
    expect(clientNavIds).not.toContain('client-calls-bookings')
    expect(clientNavIds).not.toContain('client-compliance-approvals')
    expect(clientNavIds).not.toContain('client-patient-acquisition')
    expect(clientNavIds).not.toContain('client-reputation')
    expect(clientNavIds).not.toContain('client-service-lines')
  })

  it('keeps account settings accessible to every authenticated role outside primary navigation', () => {
    const accountSettingsRoute = routeMetadata.find((route) => route.id === 'account-settings')

    expect(accountSettingsRoute).toBeTruthy()
    expect(accountSettingsRoute.showInNav).toBe(false)
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

  it('keeps default client team navigation limited to client-owned essentials', () => {
    const clientTeamNavIds = visibleNavIdsFor({
      viewer: {
        ...createClientViewer({
          capabilities: [],
          role: WORKSPACE_ROLES.VIEWER,
        }),
      },
    })

    expect(clientTeamNavIds).toEqual([
      'client-overview',
      'client-action-needed',
      'client-reports-dashboards',
      'client-requests',
      'client-files-links',
      'client-updates',
      'client-settings',
    ])
    expect(clientTeamNavIds).not.toContain('client-projects')
  })

  it('uses the clinic client navigation template for clinic clients', () => {
    const clientNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createClientViewer(),
    })

    expect(clientNavIds).toEqual([
      'client-overview',
      'client-action-needed',
      'dental-growth-review',
      'client-executive-performance',
      'client-patient-acquisition',
      'client-calls-bookings',
      'client-service-lines',
      'client-reputation',
      'client-reports-dashboards',
      'client-requests',
      'client-compliance-approvals',
      'client-files-links',
      'client-updates',
      'client-settings',
    ])
    expect(routeMetadata.find((route) => route.id === 'dental-growth-review')).toMatchObject({
      navLabel: 'Dental Growth Review',
      path: '/client/growth-review',
    })
    expect(clientNavIds).not.toContain('client-projects')
    expect(clientNavIds).not.toContain('client-monthly-strategy')
  })

  it('shows monthly strategy only in finance-capable client navigation', () => {
    const financeNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: {
        ...createClientViewer(),
        capabilities: [
          CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
          CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
          CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW,
        ],
      },
    })

    expect(financeNavIds).toContain('client-executive-performance')
    expect(financeNavIds).toContain('dental-growth-review')
    expect(financeNavIds).toContain('client-monthly-strategy')
  })

  it('shows daily operations as the front-desk clinic staff navigation entry', () => {
    const frontDeskNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createClientViewer({
        capabilities: [CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW],
        role: WORKSPACE_ROLES.FRONT_DESK,
      }),
    })

    expect(frontDeskNavIds).toEqual([
      'clinic-daily-ops',
      'client-settings',
    ])
  })

  it('keeps general agency navigation limited to agency-wide destinations', () => {
    const adminNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: createAgencyViewer({
        capabilities: Object.values(CLINIC_REPORTING_CAPABILITIES),
      }),
    })

    expect(adminNavIds).toEqual([
      'admin-clients',
      'admin-tasks',
      'admin-dashboard-links',
      'admin-performance-dashboards',
      'admin-reports',
    ])
    expect(adminNavIds).not.toContain('dental-growth-review')
    expect(adminNavIds).not.toContain('team-clinic-operator')
    expect(adminNavIds).not.toContain('clinic-daily-ops')
    expect(adminNavIds).not.toContain('admin-client-overview')
    expect(adminNavIds).not.toContain('client-executive-performance')
    expect(adminNavIds).not.toContain('client-monthly-strategy')
  })

  it('keeps legacy client analytics routes hidden from navigation but membership-protected', () => {
    const legacyAnalyticsRoutes = routeMetadata.filter((route) => [
      'client-dashboard',
      'client-performance',
      'client-reports',
    ].includes(route.id))

    expect(legacyAnalyticsRoutes).toHaveLength(3)
    legacyAnalyticsRoutes.forEach((route) => {
      expect(route.showInNav).toBe(false)
      expect(canAccessRoute(createClientViewer(), route)).toBe(true)
      expect(canAccessRoute(createAgencyViewer(), route)).toBe(false)
    })
  })

  it('requires clinic reporting capabilities for protected clinic layer routes', () => {
    const dailyOpsRoute = routeMetadata.find((route) => route.id === 'clinic-daily-ops')
    const monthlyStrategyRoute = routeMetadata.find((route) => route.id === 'client-monthly-strategy')

    expect(dailyOpsRoute).toBeTruthy()
    expect(monthlyStrategyRoute).toBeTruthy()
    expect(dailyOpsRoute.showInNav).not.toBe(false)
    expect(monthlyStrategyRoute.showInNav).not.toBe(false)

    expect(canAccessRoute(createClientViewer({ role: WORKSPACE_ROLES.FRONT_DESK, capabilities: [] }), dailyOpsRoute)).toBe(false)
    expect(canAccessRoute(createClientViewer({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW],
      role: WORKSPACE_ROLES.FRONT_DESK,
    }), dailyOpsRoute)).toBe(true)
    expect(canAccessRoute(createClientViewer({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW],
    }), monthlyStrategyRoute)).toBe(false)
    expect(canAccessRoute(createClientViewer({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW],
    }), monthlyStrategyRoute)).toBe(true)
  })

  it('blocks direct URL access when the client type does not match the route', () => {
    const executiveRoute = routeMetadata.find((route) => route.id === 'client-executive-performance')
    const projectsRoute = routeMetadata.find((route) => route.id === 'client-projects')

    expect(canAccessRouteWithContext(createClientViewer(), executiveRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.GENERIC),
    })).toBe(false)
    expect(canAccessRouteWithContext(createClientViewer(), executiveRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
    })).toBe(true)
    expect(canAccessRouteWithContext(createClientViewer(), projectsRoute, {
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
    })).toBe(false)
  })

  it('can evaluate client type routes from an async-loaded client type context', () => {
    const executiveRoute = routeMetadata.find((route) => route.id === 'client-executive-performance')

    expect(canAccessRouteWithContext(createClientViewer(), executiveRoute, {
      clientType: CLIENT_TYPES.CLINIC,
      defaultClientId: 'client-a',
    })).toBe(true)
    expect(canAccessRouteWithContext(createClientViewer(), executiveRoute, {
      clientType: CLIENT_TYPES.GENERIC,
      defaultClientId: 'client-a',
    })).toBe(false)
  })

  it('blocks client users from changing client context through URL params', () => {
    const overviewRoute = routeMetadata.find((route) => route.id === 'client-overview')

    expect(canAccessRouteWithContext(createClientViewer(), overviewRoute, {
      repositories: createRepositories(CLIENT_TYPES.GENERIC),
      routeParams: {
        clientId: 'client-b',
      },
    })).toBe(false)
  })

  it('keeps admin workspace routes inaccessible to client users', () => {
    const adminWorkspaceRouteIds = [
      'admin-client-overview',
      'admin-clinic-compliance',
      'admin-clinic-metrics',
      'admin-clinic-reporting',
      'admin-clinic-reputation',
      'admin-clinic-setup',
      'admin-client-requests',
      'admin-client-submitted-requests',
      'admin-client-reports-dashboards',
      'admin-client-files-links',
      'admin-client-updates',
      'admin-client-access',
      'admin-client-activity',
      'admin-client-work-review',
    ]
    const adminWorkspaceRoutes = routeMetadata.filter((route) => adminWorkspaceRouteIds.includes(route.id))

    expect(adminWorkspaceRoutes).toHaveLength(adminWorkspaceRouteIds.length)
    adminWorkspaceRoutes.forEach((route) => {
      expect(route.showInNav).toBe(false)
      expect(canAccessRoute(createAgencyViewer(), route)).toBe(true)
      expect(canAccessRoute(createClientViewer(), route)).toBe(false)
    })
  })

  it('keeps published client preview routes admin-only and hidden from navigation', () => {
    const adminPreviewRouteIds = [
      'admin-client-preview',
      'admin-client-action-needed-preview',
      'admin-client-patient-acquisition-preview',
      'admin-client-calls-bookings-preview',
      'admin-client-reputation-preview',
      'admin-client-service-lines-preview',
      'admin-client-compliance-approvals-preview',
      'admin-client-projects-preview',
      'admin-client-reports-dashboards-preview',
      'admin-client-files-links-preview',
      'admin-client-requests-preview',
      'admin-client-updates-preview',
      'admin-client-settings-preview',
      'admin-client-dashboard-preview',
      'admin-client-performance-preview',
      'admin-client-report-preview',
    ]
    const adminPreviewRoutes = routeMetadata.filter((route) => adminPreviewRouteIds.includes(route.id))

    expect(adminPreviewRoutes).toHaveLength(adminPreviewRouteIds.length)
    adminPreviewRoutes.forEach((route) => {
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
