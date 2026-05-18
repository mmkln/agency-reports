import { describe, expect, it } from 'vitest'

import {
  createSeedDataForRepositoryContract,
  runPortalRepositoryContractSuite,
} from './portalRepositoryContract.test-support'
import {
  createPortalRepositoryFromSnapshot,
  createPortalSeedSnapshot,
  normalizePortalSnapshot,
  PORTAL_STORAGE_SCHEMA_VERSION,
} from './createSnapshotPortalRepository'

runPortalRepositoryContractSuite({
  createRepository: () => createPortalRepositoryFromSnapshot({
    seedData: createSeedDataForRepositoryContract(),
    snapshot: null,
  }).repositories,
  name: 'snapshot-backed',
})

describe('createSnapshotPortalRepository', () => {
  it('normalizes missing and malformed snapshots against the repository table contract', () => {
    const seedData = createSeedDataForRepositoryContract({
      clients: [
        {
          agency_id: 'agency-1',
          id: 'seed-client',
          name: 'Seed Client',
        },
      ],
    })

    expect(createPortalSeedSnapshot(seedData).__schemaVersion).toBe(PORTAL_STORAGE_SCHEMA_VERSION)
    expect(normalizePortalSnapshot(null, seedData).clients).toEqual([
      expect.objectContaining({ id: 'seed-client' }),
    ])
    expect(normalizePortalSnapshot({ clients: [] }, seedData).clients).toEqual([
      expect.objectContaining({ id: 'seed-client' }),
    ])
  })

  it('exposes the current normalized snapshot after repository writes', () => {
    const workspace = createPortalRepositoryFromSnapshot({
      seedData: createSeedDataForRepositoryContract(),
      snapshot: null,
      version: 'snapshot-version-1',
    })

    workspace.repositories.clients.upsert({
      agency_id: 'agency-1',
      id: 'client-1',
      name: 'Client 1',
    })

    expect(workspace.getSnapshot()).toMatchObject({
      __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
      clients: [
        expect.objectContaining({
          id: 'client-1',
        }),
      ],
    })
    expect(workspace.version).toBe('snapshot-version-1')
  })
})
