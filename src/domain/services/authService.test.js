import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import {
  AUTH_SESSION_STORAGE_KEY,
  authenticateWithEmail,
  buildViewerFromProfile,
  clearAuthSession,
  DEMO_AUTH_PASSWORD,
  getCurrentViewer,
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
    role: USER_ROLES.CLIENT_USER,
    user_id: 'user-1',
  }

  return {
    clientMemberships: {
      list: () => [
        {
          client_id: 'client-1',
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
      clientId: 'client-1',
      clientIds: ['client-1'],
      role: USER_ROLES.CLIENT_USER,
    })
  })

  it('does not grant client user access from profile client_id without membership', () => {
    const repositories = {
      clientMemberships: {
        list: () => [],
      },
      profiles: {
        list: () => [{
          agency_id: 'agency-1',
          client_id: 'client-1',
          email: 'client@example.com',
          id: 'profile-1',
          name: 'Client User',
          role: USER_ROLES.CLIENT_USER,
          user_id: 'user-1',
        }],
      },
    }
    const viewer = buildViewerFromProfile({
      profile: repositories.profiles.list()[0],
      repositories,
    })

    expect(viewer.clientId).toBeNull()
    expect(viewer.clientIds).toEqual([])
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
})
