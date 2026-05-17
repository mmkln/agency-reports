import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
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
    allowedRoles: [USER_ROLES.CLIENT_USER],
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
    clientId: 'client-a',
    clientIds: ['client-a'],
    role: USER_ROLES.CLIENT_USER,
  }
}

describe('route role access', () => {
  it('allows public routes without role metadata', () => {
    expect(canAccessRoute(null, routes[0])).toBe(true)
  })

  it('allows only matching roles for protected routes', () => {
    expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, routes[1])).toBe(true)
    expect(canAccessRoute({ role: USER_ROLES.CLIENT_USER }, routes[1])).toBe(false)
  })

  it('filters route lists to role-accessible routes', () => {
    expect(filterRoutesForViewer(routes, { role: USER_ROLES.AGENCY_TEAM }).map((route) => route.id)).toEqual([
      'public',
      'team',
    ])
  })

  it('keeps client navigation aligned to the mature Client Control Center IA', () => {
    const clientNavIds = filterRoutesForNavigation({
      defaultClientId: 'client-a',
      repositories: createRepositories(),
      routes: routeMetadata,
      viewer: createClientViewer(),
    })
      .filter((route) => route.showInNav !== false)
      .map((route) => route.id)

    expect(clientNavIds).toEqual([
      'client-overview',
      'client-action-needed',
      'client-projects',
      'client-reports-dashboards',
      'client-files-links',
      'client-requests',
      'client-updates',
      'client-settings',
    ])
    expect(clientNavIds).not.toContain('client-dashboard')
    expect(clientNavIds).not.toContain('client-performance')
    expect(clientNavIds).not.toContain('client-reports')
    expect(clientNavIds).not.toContain('client-calls-bookings')
    expect(clientNavIds).not.toContain('client-compliance-approvals')
    expect(clientNavIds).not.toContain('client-patient-acquisition')
    expect(clientNavIds).not.toContain('client-reputation')
    expect(clientNavIds).not.toContain('client-service-lines')
  })

  it('uses the clinic client navigation template for clinic clients', () => {
    const clientNavIds = filterRoutesForNavigation({
      defaultClientId: 'client-a',
      repositories: createRepositories(CLIENT_TYPES.CLINIC),
      routes: routeMetadata,
      viewer: createClientViewer(),
    })
      .filter((route) => route.showInNav !== false)
      .map((route) => route.id)

    expect(clientNavIds).toEqual([
      'client-overview',
      'client-action-needed',
      'client-patient-acquisition',
      'client-calls-bookings',
      'client-service-lines',
      'client-reputation',
      'client-compliance-approvals',
      'client-reports-dashboards',
      'client-files-links',
      'client-requests',
      'client-updates',
      'client-settings',
    ])
    expect(clientNavIds).not.toContain('client-projects')
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
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_USER }, route)).toBe(true)
      expect(canAccessRoute({ role: USER_ROLES.AGENCY_ADMIN }, route)).toBe(false)
    })
  })

  it('keeps admin workspace routes inaccessible to client users', () => {
    const adminWorkspaceRouteIds = [
      'admin-client-overview',
      'admin-clinic-metrics',
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
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_USER }, route)).toBe(false)
    })
  })

  it('keeps published client preview routes admin-only and hidden from navigation', () => {
    const adminPreviewRouteIds = [
      'admin-client-preview',
      'admin-client-action-needed-preview',
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
      expect(canAccessRoute({ role: USER_ROLES.CLIENT_USER }, route)).toBe(false)
    })
  })
})
