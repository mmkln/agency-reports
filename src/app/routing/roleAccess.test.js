import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import { routeMetadata } from './routeDefinitions'
import { canAccessRoute, filterRoutesForViewer } from './roleAccess'

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
    const clientNavIds = filterRoutesForViewer(routeMetadata, { role: USER_ROLES.CLIENT_USER })
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
})
