import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../../entities/profile'
import { DEMO_AUTH_PASSWORD } from '../../../domain/services/authService'
import { createLocalAuthClient } from './localAuthClient'

function createDataClient(repositories) {
  return {
    read(operation) {
      return Promise.resolve(operation(repositories))
    },
  }
}

function createRepositories(profileOverrides = {}) {
  const profile = {
    email: 'client@example.com',
    id: 'profile-1',
    name: 'Client User',
    role: USER_ROLES.CLIENT_ADMIN,
    user_id: 'user-1',
    ...profileOverrides,
  }

  return {
    authCredentials: {
      list: () => [],
    },
    clientMemberships: {
      list: () => [
        {
          client_id: 'client-1',
          user_id: profile.user_id,
        },
      ],
    },
    profiles: {
      findByUserId: (userId) => (userId === profile.user_id ? profile : null),
      list: () => [profile],
    },
  }
}

describe('createLocalAuthClient', () => {
  it('authenticates through the data client boundary', async () => {
    const repositories = createRepositories()
    const authClient = createLocalAuthClient({
      dataClient: createDataClient(repositories),
      repositories,
    })

    await expect(authClient.signInWithEmail({
      email: 'client@example.com',
      password: DEMO_AUTH_PASSWORD,
    })).resolves.toMatchObject({
      clientId: 'client-1',
      userId: 'user-1',
    })
  })

  it('lists login profiles through the data client boundary', async () => {
    const repositories = createRepositories()
    const authClient = createLocalAuthClient({
      dataClient: createDataClient(repositories),
      repositories,
    })

    await expect(authClient.listLoginProfiles()).resolves.toEqual([
      repositories.profiles.list()[0],
    ])
  })
})
