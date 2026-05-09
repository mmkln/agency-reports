import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
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
})
