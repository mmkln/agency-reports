import { describe, expect, it } from 'vitest'

import { createApiPortalDataClient } from './createApiPortalDataClient'
import { createInMemoryApiPortalSnapshotTransport } from './createApiPortalSnapshotTransport'
import {
  createSeedDataForRepositoryContract,
  runPortalDataClientRepositoryContractSuite,
} from './portalRepositoryContract.test-support'

function createContractDataClient() {
  return createApiPortalDataClient({
    seedData: createSeedDataForRepositoryContract(),
    transport: createInMemoryApiPortalSnapshotTransport(),
  })
}

runPortalDataClientRepositoryContractSuite({
  createDataClient: createContractDataClient,
  name: 'API snapshot adapter',
})

describe('createApiPortalDataClient', () => {
  it('loads and saves snapshots through the API transport seam', async () => {
    const savedSnapshots = []
    const transport = {
      async loadSnapshot() {
        return {
          snapshot: {
            clients: [
              {
                id: 'client-1',
                name: 'Loaded Client',
              },
            ],
          },
          version: 'api-version-1',
        }
      },
      async saveSnapshot(snapshot, context) {
        savedSnapshots.push({
          context,
          snapshot,
        })
      },
    }
    const dataClient = createApiPortalDataClient({
      seedData: createSeedDataForRepositoryContract(),
      transport,
    })

    await expect(dataClient.read((repository) => (
      repository.clients.findById('client-1')
    ))).resolves.toMatchObject({
      name: 'Loaded Client',
    })

    await dataClient.write((repository) => {
      repository.clients.upsert({
        id: 'client-2',
        name: 'Saved Client',
      })
    })

    expect(savedSnapshots).toHaveLength(1)
    expect(savedSnapshots[0]).toMatchObject({
      context: {
        version: 'api-version-1',
      },
      snapshot: {
        clients: [
          expect.objectContaining({ id: 'client-1' }),
          expect.objectContaining({ id: 'client-2' }),
        ],
      },
    })
  })

  it('fails fast when transport functions are missing', () => {
    expect(() => createApiPortalDataClient()).toThrow('API portal transport must implement loadSnapshot().')
    expect(() => createApiPortalDataClient({
      transport: {
        loadSnapshot: async () => null,
      },
    })).toThrow('API portal transport must implement saveSnapshot(snapshot, context).')
  })
})

describe('createInMemoryApiPortalSnapshotTransport', () => {
  it('rejects stale writes with optimistic version checks', async () => {
    const transport = createInMemoryApiPortalSnapshotTransport()
    const firstLoad = await transport.loadSnapshot()

    await transport.saveSnapshot({
      clients: [],
    }, {
      version: firstLoad.version,
    })

    await expect(transport.saveSnapshot({
      clients: [],
    }, {
      version: firstLoad.version,
    })).rejects.toThrow('Snapshot version conflict. Reload before saving again.')
  })
})
