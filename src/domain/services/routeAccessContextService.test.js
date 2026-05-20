import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import { getRouteAccessClientContext } from './routeAccessContextService'

function createRepositories(clients = []) {
  return {
    clients: {
      findById(id) {
        return clients.find((client) => client.id === id) ?? null
      },
    },
  }
}

describe('routeAccessContextService', () => {
  it('returns generic context without a requested client', () => {
    expect(getRouteAccessClientContext({
      clientId: null,
      repositories: createRepositories(),
    })).toEqual({
      clientId: null,
      clientType: CLIENT_TYPES.GENERIC,
    })
  })

  it('returns the requested client type when available', () => {
    expect(getRouteAccessClientContext({
      clientId: 'client-a',
      repositories: createRepositories([
        {
          id: 'client-a',
          type: CLIENT_TYPES.CLINIC,
        },
      ]),
    })).toEqual({
      clientId: 'client-a',
      clientType: CLIENT_TYPES.CLINIC,
    })
  })

  it('falls back to generic for unknown requested clients', () => {
    expect(getRouteAccessClientContext({
      clientId: 'missing-client',
      repositories: createRepositories(),
    })).toEqual({
      clientId: 'missing-client',
      clientType: CLIENT_TYPES.GENERIC,
    })
  })
})
