import { describe, expect, it } from 'vitest'

import {
  CLINIC_REPORTING_CAPABILITIES,
  PROFILE_STATUSES,
} from '../../entities/profile'
import { WORKSPACE_CAPABILITIES, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  AUTH_SESSION_STORAGE_KEY,
  authenticateWithEmail,
  buildViewerFromProfile,
  clearAuthSession,
  DEMO_AUTH_PASSWORD,
  getCurrentViewer,
  getHomeHrefForViewer,
  listLoginProfiles,
  setAuthSession,
} from './authService'

function createStorage() {
  const records = new Map()

  return {
    getItem(key) {
      return records.get(key) ?? null
    },
    removeItem(key) {
      records.delete(key)
    },
    setItem(key, value) {
      records.set(key, value)
    },
  }
}

function createRepository() {
  const profile = {
    agency_id: 'agency-1',
    client_id: null,
    email: 'client@example.com',
    id: 'profile-1',
    name: 'Client User',
    user_id: 'user-1',
  }

  return {
    workspaceMemberships: {
      list: () => [
        {
          workspace_id: 'client-1',
          user_id: 'user-1',
        },
      ],
    },
    profiles: {
      findByUserId: (userId) => (userId === profile.user_id ? profile : null),
      list: () => [profile],
    },
  }
}

describe('authService', () => {
  it('builds client access from memberships', () => {
    const repositories = createRepository()
    const viewer = buildViewerFromProfile({
      profile: repositories.profiles.list()[0],
      repositories,
    })

    expect(viewer).toMatchObject({
      activeWorkspaceId: 'client-1',
      workspaceMemberships: [
        expect.objectContaining({
          workspaceId: 'client-1',
        }),
      ],
    })
    expect(viewer.clientId).toBeUndefined()
    expect(viewer.clientIds).toBeUndefined()
    expect(viewer.role).toBeUndefined()
  })

  it('does not grant client user access from profile client_id without membership', () => {
    const repositories = {
      workspaceMemberships: {
        list: () => [],
      },
      workspaces: {
        findById: () => null,
      },
      profiles: {
        list: () => [{
          agency_id: 'agency-1',
          client_id: 'client-1',
          email: 'client@example.com',
          id: 'profile-1',
          name: 'Client User',
          user_id: 'user-1',
        }],
      },
    }
    const viewer = buildViewerFromProfile({
      profile: repositories.profiles.list()[0],
      repositories,
    })

    expect(viewer.activeWorkspaceId).toBeNull()
    expect(viewer.clientId).toBeUndefined()
    expect(viewer.clientIds).toBeUndefined()
  })

  it('authenticates by profile email and persists a simulated session', () => {
    const repositories = createRepository()
    const storage = createStorage()

    const viewer = authenticateWithEmail({
      email: 'client@example.com',
      now: () => '2026-05-12T00:00:00.000Z',
      password: DEMO_AUTH_PASSWORD,
      repositories,
      storage,
    })

    expect(viewer.userId).toBe('user-1')
    expect(JSON.parse(storage.getItem(AUTH_SESSION_STORAGE_KEY))).toEqual({
      expiresAt: '2026-05-12T08:00:00.000Z',
      userId: 'user-1',
    })
    expect(getCurrentViewer({
      now: () => '2026-05-12T00:00:00.000Z',
      repositories,
      storage,
    }).email).toBe('client@example.com')

    clearAuthSession(storage)
    expect(getCurrentViewer({ repositories, storage })).toBeNull()
  })

  it('rejects unknown email and invalid password', () => {
    const repositories = createRepository()
    const storage = createStorage()

    expect(() => authenticateWithEmail({
      email: 'missing@example.com',
      password: DEMO_AUTH_PASSWORD,
      repositories,
      storage,
    })).toThrow('No portal user exists for this email.')

    expect(() => authenticateWithEmail({
      email: 'client@example.com',
      password: 'wrong-password',
      repositories,
      storage,
    })).toThrow('Invalid password.')

    expect(storage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('blocks inactive profiles from sessions and login', () => {
    const repositories = createRepository()
    const storage = createStorage()
    const profile = repositories.profiles.list()[0]

    profile.status = PROFILE_STATUSES.INACTIVE
    setAuthSession(profile.user_id, storage)

    expect(getCurrentViewer({
      repositories,
      storage,
    })).toBeNull()
    expect(storage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
    expect(() => authenticateWithEmail({
      email: profile.email,
      password: DEMO_AUTH_PASSWORD,
      repositories,
      storage,
    })).toThrow('This account is inactive.')
    expect(listLoginProfiles({ repositories })).toEqual([])
  })

  it('clears expired sessions and returns no viewer', () => {
    const repositories = createRepository()
    const storage = createStorage()

    setAuthSession('user-1', storage, {
      now: () => '2026-05-12T00:00:00.000Z',
      ttlMs: 1000,
    })

    expect(getCurrentViewer({
      now: () => '2026-05-12T00:00:00.500Z',
      repositories,
      storage,
    })?.userId).toBe('user-1')
    expect(getCurrentViewer({
      now: () => '2026-05-12T00:00:01.000Z',
      repositories,
      storage,
    })).toBeNull()
    expect(storage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('routes clinic users with Dental Growth Review access to the Growth Review', () => {
    expect(getHomeHrefForViewer({
      activeWorkspaceId: 'client-1',
      capabilities: [
        WORKSPACE_CAPABILITIES.VIEW_PORTAL,
        CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
      ],
      workspaceMemberships: [{
        capabilities: [
          WORKSPACE_CAPABILITIES.VIEW_PORTAL,
          CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
        ],
        role: WORKSPACE_ROLES.CLINIC_OWNER,
        workspaceId: 'client-1',
      }],
    })).toBe('/client/growth-review?clientId=client-1')
  })

  it('routes clinic users without Dental Growth Review access to workspace settings', () => {
    expect(getHomeHrefForViewer({
      activeWorkspaceId: 'client-1',
      capabilities: [
        WORKSPACE_CAPABILITIES.VIEW_PORTAL,
      ],
      workspaceMemberships: [{
        capabilities: [
          WORKSPACE_CAPABILITIES.VIEW_PORTAL,
        ],
        role: WORKSPACE_ROLES.CLINIC_OWNER,
        workspaceId: 'client-1',
      }],
    })).toBe('/client/settings?clientId=client-1')
  })
})
