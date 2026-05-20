import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../../entities/profile'
import { buildAuthRuntime } from './authRuntime'

const CLIENT_A_ID = 'client-a'
const CLIENT_B_ID = 'client-b'

function createRepositories() {
  return {
    clients: {
      list: () => [
        { id: CLIENT_A_ID },
        { id: CLIENT_B_ID },
      ],
    },
  }
}

describe('buildAuthRuntime', () => {
  it('preserves agency team client assignments instead of broadening to every agency client', () => {
    const viewer = {
      clientIds: [CLIENT_A_ID],
      role: USER_ROLES.AGENCY_TEAM,
    }

    const runtime = buildAuthRuntime({
      dataClient: {},
      repositories: createRepositories(),
      viewer,
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
    expect(runtime.viewer.clientIds).toEqual([CLIENT_A_ID])
  })

  it('defaults agency admins to the first client without mutating viewer scope', () => {
    const viewer = {
      agencyId: 'agency-a',
      role: USER_ROLES.AGENCY_ADMIN,
    }

    const runtime = buildAuthRuntime({
      dataClient: {},
      repositories: createRepositories(),
      viewer,
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
    expect(runtime.viewer).toBe(viewer)
  })
})
