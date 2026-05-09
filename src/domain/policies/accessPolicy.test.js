import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from './accessPolicy'

const CLIENT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const CLIENT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const AGENCY_ID = '11111111-1111-4111-8111-111111111111'

describe('canAccessClient', () => {
  it('allows agency admins with an agency id to access a client', () => {
    expect(canAccessClient({
      agencyId: AGENCY_ID,
      role: USER_ROLES.AGENCY_ADMIN,
    }, CLIENT_A_ID)).toBe(true)
  })

  it('denies agency admins without an agency id', () => {
    expect(canAccessClient({
      agencyId: '',
      role: USER_ROLES.AGENCY_ADMIN,
    }, CLIENT_A_ID)).toBe(false)
  })

  it('allows agency team users only for assigned clients', () => {
    const viewer = {
      clientIds: [CLIENT_A_ID],
      role: USER_ROLES.AGENCY_TEAM,
    }

    expect(canAccessClient(viewer, CLIENT_A_ID)).toBe(true)
    expect(canAccessClient(viewer, CLIENT_B_ID)).toBe(false)
  })

  it('allows client users only for their own client id', () => {
    const viewer = {
      clientId: CLIENT_A_ID,
      role: USER_ROLES.CLIENT_USER,
    }

    expect(canAccessClient(viewer, CLIENT_A_ID)).toBe(true)
    expect(canAccessClient(viewer, CLIENT_B_ID)).toBe(false)
  })

  it('denies missing viewer or client id', () => {
    expect(canAccessClient(null, CLIENT_A_ID)).toBe(false)
    expect(canAccessClient({ role: USER_ROLES.CLIENT_USER }, '')).toBe(false)
  })
})
