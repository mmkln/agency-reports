import { describe, expect, it } from 'vitest'

import { createLocalStoragePortalRepository } from './createLocalStoragePortalRepository'
import { portalSeedData } from './portalSeedData'
import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_REPOSITORY_KEYS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'
import {
  createSeedDataForRepositoryContract,
  runPortalRepositoryContractSuite,
} from './portalRepositoryContract.test-support'

describe('portalRepositoryContract', () => {
  it('keeps repository keys and table names unique', () => {
    expect(new Set(PORTAL_REPOSITORY_KEYS).size).toBe(PORTAL_REPOSITORY_KEYS.length)
    expect(new Set(PORTAL_TABLE_NAMES).size).toBe(PORTAL_TABLE_NAMES.length)
    expect(PORTAL_REPOSITORY_COLLECTIONS).toHaveLength(PORTAL_TABLE_NAMES.length)
  })

  it('keeps seed data aligned with the repository table contract', () => {
    for (const tableName of PORTAL_TABLE_NAMES) {
      expect(Array.isArray(portalSeedData[tableName]), tableName).toBe(true)
    }

    const contractTables = new Set(PORTAL_TABLE_NAMES)
    const unknownSeedTables = Object.keys(portalSeedData)
      .filter((key) => Array.isArray(portalSeedData[key]) && !contractTables.has(key))

    expect(unknownSeedTables).toEqual([])
  })

  it('keeps clinic publish-state tables inside the repository table contract', () => {
    const contractTables = new Set(PORTAL_TABLE_NAMES)

    expect(PORTAL_CLINIC_PUBLISH_STATE_TABLES.length).toBeGreaterThan(0)
    expect(PORTAL_CLINIC_PUBLISH_STATE_TABLES.every((tableName) => contractTables.has(tableName))).toBe(true)
  })
})

runPortalRepositoryContractSuite({
  createRepository: () => createLocalStoragePortalRepository({
    seedData: createSeedDataForRepositoryContract(),
  }),
  name: 'localStorage',
})
