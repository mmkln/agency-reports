import { describe, expect, it } from 'vitest'

import { createSeedDataForRepositoryContract } from './portalRepositoryContract.test-support'
import { createSnapshotPortalDataClient } from './createSnapshotPortalDataClient'

describe('createSnapshotPortalDataClient', () => {
  it('runs domain-style read operations against a loaded backend snapshot without saving', async () => {
    let saveCount = 0
    const dataClient = createSnapshotPortalDataClient({
      loadSnapshot: async () => ({
        clients: [
          {
            agency_id: 'agency-1',
            id: 'client-1',
            name: 'Client 1',
          },
        ],
      }),
      saveSnapshot: async () => {
        saveCount += 1
      },
      seedData: createSeedDataForRepositoryContract(),
    })

    await expect(dataClient.read((repositories) => repositories.clients.findById('client-1'))).resolves.toMatchObject({
      id: 'client-1',
    })
    expect(saveCount).toBe(0)
  })

  it('saves the normalized snapshot after write operations', async () => {
    let savedSnapshot = null
    const dataClient = createSnapshotPortalDataClient({
      loadSnapshot: async () => null,
      saveSnapshot: async (snapshot) => {
        savedSnapshot = snapshot
      },
      seedData: createSeedDataForRepositoryContract(),
    })

    await expect(dataClient.write((repositories) => {
      repositories.clients.upsert({
        agency_id: 'agency-1',
        id: 'client-1',
        name: 'Client 1',
      })

      return repositories.clients.list().length
    })).resolves.toBe(1)
    expect(savedSnapshot).toMatchObject({
      clients: [
        expect.objectContaining({
          id: 'client-1',
        }),
      ],
    })
  })

  it('passes loaded snapshot versions to save operations for backend concurrency checks', async () => {
    let saveContext = null
    const dataClient = createSnapshotPortalDataClient({
      loadSnapshot: async () => ({
        snapshot: {
          clients: [],
        },
        version: 'snapshot-version-1',
      }),
      saveSnapshot: async (snapshot, context) => {
        saveContext = {
          context,
          snapshot,
        }
      },
      seedData: createSeedDataForRepositoryContract(),
    })

    await dataClient.write((repositories) => {
      repositories.clients.upsert({
        agency_id: 'agency-1',
        id: 'client-1',
        name: 'Client 1',
      })
    })

    expect(saveContext).toMatchObject({
      context: {
        version: 'snapshot-version-1',
      },
      snapshot: {
        clients: [
          expect.objectContaining({
            id: 'client-1',
          }),
        ],
      },
    })
  })

  it('requires explicit async snapshot loading and saving functions', () => {
    expect(() => createSnapshotPortalDataClient()).toThrow('loadSnapshot is required.')
    expect(() => createSnapshotPortalDataClient({
      loadSnapshot: async () => null,
    })).toThrow('saveSnapshot is required.')
  })
})
