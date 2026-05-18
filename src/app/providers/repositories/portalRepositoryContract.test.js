import { describe, expect, it } from 'vitest'

import { createLocalStoragePortalRepository } from './createLocalStoragePortalRepository'
import {
  PORTAL_ENTITY_REPOSITORY_METHODS,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_REPOSITORY_EXTENSION_METHODS,
  PORTAL_REPOSITORY_KEYS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'

function createSeedData() {
  return Object.fromEntries(PORTAL_TABLE_NAMES.map((tableName) => [tableName, []]))
}

describe('portalRepositoryContract', () => {
  it('keeps repository keys and table names unique', () => {
    expect(new Set(PORTAL_REPOSITORY_KEYS).size).toBe(PORTAL_REPOSITORY_KEYS.length)
    expect(new Set(PORTAL_TABLE_NAMES).size).toBe(PORTAL_TABLE_NAMES.length)
    expect(PORTAL_REPOSITORY_COLLECTIONS).toHaveLength(PORTAL_TABLE_NAMES.length)
  })

  it('is implemented by the localStorage repository adapter', () => {
    const repository = createLocalStoragePortalRepository({
      seedData: createSeedData(),
    })

    for (const repositoryKey of PORTAL_REPOSITORY_KEYS) {
      expect(repository[repositoryKey], repositoryKey).toBeDefined()

      for (const method of PORTAL_ENTITY_REPOSITORY_METHODS) {
        expect(typeof repository[repositoryKey][method], `${repositoryKey}.${method}`).toBe('function')
      }
    }

    for (const method of PORTAL_REPOSITORY_EXTENSION_METHODS.profiles) {
      expect(typeof repository.profiles[method], `profiles.${method}`).toBe('function')
    }

    for (const method of PORTAL_REPOSITORY_EXTENSION_METHODS.root) {
      expect(typeof repository[method], method).toBe('function')
    }
  })
})
