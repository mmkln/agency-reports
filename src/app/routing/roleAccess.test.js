import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_REPORTING_CAPABILITIES,
  USER_ROLES,
} from '../../entities/profile'
import { iconNames } from '../../shared/icons'
import { routeMetadata } from './routeDefinitions'
import {
  canAccessRoute,
  filterRoutesForNavigation,
  filterRoutesForViewer,
} from './roleAccess'

const routes = [
  {
    id: 'public',
    label: 'Public',
  },
  {
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    id: 'admin',
    label: 'Admin',
  },
  {
    allowedRoles: [USER_ROLES.AGENCY_TEAM],
    id: 'team',
    label: 'Team',
  },
  {
    allowedRoles: [USER_ROLES.CLIENT_ADMIN],
    id: 'client',
    label: 'Client',
  },
]

function createRepositories(clientType = CLIENT_TYPES.GENERIC) {
  return {
    clients: {
      findById(id) {
        return id === 'client-a'
          ? {
              id,
              type: clientType,
            }
          : null
      },
    },
  }
}

function createClientViewer() {
  return {
    capabilities: [CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW],
    clientId: 'client-a',
    clientIds: ['client-a'],
    role: USER_ROLES.CLIENT_ADMIN,
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

describe('route role access', () => {
  it('allows public routes without role metadata', () => {
    expect(canAccessRoute(null, routes[0])).toBe(true)
  })

  it('allows only matching roles for protected routes', () => {
    expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, routes[1])).toBe(true)
    expect(canAccessRoute({ role: USER_ROLES.CLIENT_ADMIN }, routes[1])).toBe(false)
  })

  it('filters route lists to role-accessible routes', () => {
    expect(filterRoutesForViewer(routes, { role: USER_ROLES.AGENCY_TEAM }).map((route) => route.id)).toEqual([
      'public',
      'team',
    ])
  })

  it('shows the clinic operator route in agency team navigation', () => {
    const teamNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: {
        capabilities: [CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW],
        role: USER_ROLES.AGENCY_TEAM,
      },
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
      viewer: {
        capabilities: [CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW],
        clientId: 'client-a',
        clientIds: ['client-a'],
        role: USER_ROLES.CLIENT_TEAM,
      },
    })

    expect(frontDeskNavIds).toEqual(['clinic-daily-ops'])
  })

  it('shows agency operational clinic routes without exposing client finance routes in agency navigation', () => {
    const adminNavIds = visibleNavIdsFor({
      clientType: CLIENT_TYPES.CLINIC,
      viewer: {
        capabilities: Object.values(CLINIC_REPORTING_CAPABILITIES),
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })

    expect(adminNavIds).toEqual([
      'admin-clients',
      'admin-tasks',
      'dental-growth-review',
      'team-clinic-operator',
      'clinic-daily-ops',
      'admin-dashboard-links',
      'admin-performance-dashboards',
      'admin-reports',
    ])
    expect(adminNavIds).not.toContain('client-executive-performance')
    expect(adminNavIds).not.toContain('client-monthly-strategy')
  })

  it('keeps legacy client analytics routes hidden from navigation but role-protected', () => {
    const legacyAnalyticsRoutes = routeMetadata.filter((route) => [
      'client-dashboard',
      'client-performance',
      'client-reports',
    ].includes(route.id))

    expect(legacyAnalyticsRoutes).toHaveLength(3)
    legacyAnalyticsRoutes.forEach((route) => {
      expect(route.showInNav).toBe(false)
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_ADMIN }, route)).toBe(true)
      expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, route)).toBe(false)
    })
  })

  it('requires clinic reporting capabilities for protected clinic layer routes', () => {
    const dailyOpsRoute = routeMetadata.find((route) => route.id === 'clinic-daily-ops')
    const monthlyStrategyRoute = routeMetadata.find((route) => route.id === 'client-monthly-strategy')

    expect(dailyOpsRoute).toBeTruthy()
    expect(monthlyStrategyRoute).toBeTruthy()
    expect(dailyOpsRoute.showInNav).not.toBe(false)
    expect(monthlyStrategyRoute.showInNav).not.toBe(false)

    expect(canAccessRoute({ role: USER_ROLES.CLIENT_TEAM }, dailyOpsRoute)).toBe(false)
    expect(canAccessRoute({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW],
      role: USER_ROLES.CLIENT_TEAM,
    }, dailyOpsRoute)).toBe(true)
    expect(canAccessRoute({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW],
      role: USER_ROLES.CLIENT_ADMIN,
    }, monthlyStrategyRoute)).toBe(false)
    expect(canAccessRoute({
      capabilities: [CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW],
      role: USER_ROLES.CLIENT_ADMIN,
    }, monthlyStrategyRoute)).toBe(true)
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
      expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, route)).toBe(true)
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_ADMIN }, route)).toBe(false)
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
      expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, route)).toBe(true)
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_ADMIN }, route)).toBe(false)
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
})
