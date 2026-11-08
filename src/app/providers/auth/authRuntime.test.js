import { describe, expect, it } from 'vitest'

import { buildAuthRuntime } from './authRuntime'

describe('buildAuthRuntime', () => {
  it('keeps the API client and viewer and derives the default workspace', () => {
    const apiClient = {}
    const viewer = { activeWorkspaceId: 'workspace-1', userId: 'user-1' }
    const runtime = buildAuthRuntime({ apiClient, viewer })

    expect(runtime).toEqual({ apiClient, defaultClientId: 'workspace-1', viewer })
    expect(runtime.apiClient).toBe(apiClient)
    expect(runtime.viewer).toBe(viewer)
  })

  it('preserves an explicitly selected default client', () => {
    const runtime = buildAuthRuntime({
      apiClient: {},
      defaultClientId: 'workspace-selected',
      viewer: { activeWorkspaceId: 'workspace-active' },
    })

    expect(runtime.defaultClientId).toBe('workspace-selected')
  })

  it('has no default workspace when the viewer has none or is signed out', () => {
    expect(buildAuthRuntime({ apiClient: {}, viewer: null })).toEqual({
      apiClient: {},
      defaultClientId: null,
      viewer: null,
    })
    expect(buildAuthRuntime({ apiClient: {}, viewer: { userId: 'user-1' } }).defaultClientId)
      .toBeNull()
  })
})
