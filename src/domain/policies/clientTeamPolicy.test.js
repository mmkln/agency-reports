import { describe, expect, it } from 'vitest'

import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { canManageClientTeam } from './clientTeamPolicy'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  USER_ADMIN: '44444444-4444-4444-8444-444444444444',
  USER_TEAM: '55555555-5555-4555-8555-555555555555',
})

function createRepositories() {
  return {
    clientMemberships: {
      listByClientId(clientId) {
        return [
          {
            client_id: IDS.CLIENT_A,
            id: 'owner-membership',
            role: CLIENT_MEMBERSHIP_ROLES.OWNER,
            user_id: IDS.USER_ADMIN,
          },
          {
            client_id: IDS.CLIENT_A,
            id: 'viewer-membership',
            role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
            user_id: IDS.USER_TEAM,
          },
        ].filter((membership) => membership.client_id === clientId)
      },
    },
    clients: {
      findById(clientId) {
        return [
          {
            agency_id: IDS.AGENCY,
            id: IDS.CLIENT_A,
          },
          {
            agency_id: 'other-agency',
            id: IDS.CLIENT_B,
          },
        ].find((client) => client.id === clientId) ?? null
      },
    },
  }
}

describe('clientTeamPolicy', () => {
  it('allows agency admins inside their agency', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })).toBe(true)
  })

  it('allows client admins only for their owner membership client', () => {
    const repositories = createRepositories()
    const viewer = {
      clientIds: [IDS.CLIENT_A],
      role: USER_ROLES.CLIENT_ADMIN,
      userId: IDS.USER_ADMIN,
    }

    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer,
    })).toBe(true)
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_B,
      repositories,
      viewer,
    })).toBe(false)
  })

  it('blocks client team viewers from managing access', () => {
    expect(canManageClientTeam({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: {
        clientIds: [IDS.CLIENT_A],
        role: USER_ROLES.CLIENT_TEAM,
        userId: IDS.USER_TEAM,
      },
    })).toBe(false)
  })
})
