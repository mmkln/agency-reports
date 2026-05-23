import { describe, expect, it } from 'vitest'

import { buildAuthRuntime } from './authRuntime'

const CLIENT_A_ID = 'client-a'

describe('buildAuthRuntime', () => {
  it('uses active workspace membership as the default client scope', () => {
    const viewer = {
      activeWorkspaceId: CLIENT_A_ID,
    }

    const runtime = buildAuthRuntime({
      dataClient: {},
      viewer,
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
    expect(runtime.viewer.activeWorkspaceId).toBe(CLIENT_A_ID)
  })

  it('does not derive agency admin defaults from repository state', () => {
    const viewer = {
      activeAgencyId: 'agency-a',
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
        activeAgencyId: 'agency-a',
      },
    })

    expect(runtime.defaultClientId).toBe(CLIENT_A_ID)
  })
})
