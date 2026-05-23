import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../../entities/profile'
import { buildAuthRuntime } from './authRuntime'

const CLIENT_A_ID = 'client-a'

describe('buildAuthRuntime', () => {
  it('preserves agency team client assignments instead of broadening to every agency client', () => {
    const viewer = {
      clientIds: [CLIENT_A_ID],
      role: USER_ROLES.AGENCY_TEAM,
    }

    const runtime = buildAuthRuntime({
      dataClient: {},
      viewer,
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
    expect(runtime.viewer.clientIds).toEqual([CLIENT_A_ID])
  })

  it('does not derive agency admin defaults from repository state', () => {
    const viewer = {
      agencyId: 'agency-a',
      role: USER_ROLES.AGENCY_ADMIN,
    }

    const runtime = buildAuthRuntime({
      dataClient: {},
      viewer,
    })

    expect(runtime.defaultClientId).toBeNull()
    expect(runtime.viewer).toBe(viewer)
  })

  it('accepts an explicit default client id from an auth adapter or bootstrapper', () => {
    const runtime = buildAuthRuntime({
      dataClient: {},
      defaultClientId: CLIENT_A_ID,
      viewer: {
        agencyId: 'agency-a',
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
  })
})
