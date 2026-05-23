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

  it('recognizes the API snapshot adapter as a data-client-only backend option', () => {
    expect(resolvePortalRepositoryAdapter('apiSnapshot')).toBe(PORTAL_REPOSITORY_ADAPTERS.API_SNAPSHOT)
    expect(() => createPortalRepository({
      adapter: PORTAL_REPOSITORY_ADAPTERS.API_SNAPSHOT,
    })).toThrow('The apiSnapshot adapter is a data-client transport adapter.')
  })

  it('uses provided seed data when creating the localStorage adapter', () => {
    const seedData = createSeedDataForRepositoryContract({
      workspaces: [
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

  it('keeps demo reset disabled unless explicitly requested', () => {
    const productionRepository = createPortalRepository({
      adapter: PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
      seedData: createSeedDataForRepositoryContract(),
    })
    const demoRepository = createPortalRepository({
      adapter: PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
      enableDemoReset: true,
      seedData: createSeedDataForRepositoryContract(),
    })

    expect(productionRepository.reset).toBeUndefined()
    expect(typeof demoRepository.reset).toBe('function')
  })

  it('fails fast for unsupported adapters', () => {
    expect(() => resolvePortalRepositoryAdapter('unsupported')).toThrow('Unsupported portal repository adapter: unsupported')
    expect(() => createPortalRepository({ adapter: 'unsupported' })).toThrow('Unsupported portal repository adapter: unsupported')
  })
})
