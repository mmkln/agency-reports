import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import {
  AUTH_SESSION_STORAGE_KEY,
  authenticateWithEmail,
  buildViewerFromProfile,
  clearAuthSession,
  getCurrentViewer,
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

  it('authenticates by profile email and persists a simulated session', () => {
    const repositories = createRepository()
    const storage = createStorage()

    const viewer = authenticateWithEmail({
      email: 'client@example.com',
      repositories,
      storage,
    })

    expect(viewer.userId).toBe('user-1')
    expect(JSON.parse(storage.getItem(AUTH_SESSION_STORAGE_KEY))).toEqual({ userId: 'user-1' })
    expect(getCurrentViewer({ repositories, storage }).email).toBe('client@example.com')

    clearAuthSession(storage)
    expect(getCurrentViewer({ repositories, storage })).toBeNull()
  })
})
