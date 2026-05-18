import { describe, expect, it } from 'vitest'

import {
  createPortalRepository,
  PORTAL_REPOSITORY_ADAPTERS,
  resolvePortalRepositoryAdapter,
} from './createPortalRepository'
import {
  createSeedDataForRepositoryContract,
  runPortalRepositoryContractSuite,
} from './portalRepositoryContract.test-support'

runPortalRepositoryContractSuite({
  createRepository: () => createPortalRepository({
    seedData: createSeedDataForRepositoryContract(),
  }),
  name: 'default factory-created',
})

describe('createPortalRepository', () => {
  it('defaults to the localStorage adapter', () => {
    expect(resolvePortalRepositoryAdapter()).toBe(PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE)
  })

  it('uses provided seed data when creating the localStorage adapter', () => {
    const seedData = createSeedDataForRepositoryContract({
      clients: [
        {
          client_id: 'seed-client',
          id: 'seed-client',
          name: 'Seed Client',
        },
      ],
    })
    const repository = createPortalRepository({
      adapter: PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
      seedData,
    })

    expect(repository.clients.findById('seed-client')).toMatchObject({
      id: 'seed-client',
      name: 'Seed Client',
    })
  })

  it('fails fast for unsupported adapters', () => {
    expect(() => resolvePortalRepositoryAdapter('api')).toThrow('Unsupported portal repository adapter: api')
    expect(() => createPortalRepository({ adapter: 'api' })).toThrow('Unsupported portal repository adapter: api')
  })
})
