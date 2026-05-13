import { describe, expect, it } from 'vitest'

import {
  PORTAL_STORAGE_KEY,
  PORTAL_STORAGE_SCHEMA_VERSION,
  createLocalStoragePortalRepository,
} from './createLocalStoragePortalRepository'

const seedData = Object.freeze({
  clients: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Seed Client',
    },
  ],
  client_invitations: [],
  client_memberships: [],
  dashboard_links: [],
  needed_from_client: [],
  profiles: [],
  projects: [],
  reports: [],
  tasks: [],
  updates: [],
})

function createStorage(initialRecords = {}) {
  const records = new Map(Object.entries(initialRecords))

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

describe('createLocalStoragePortalRepository', () => {
  it('seeds storage with a schema version when no snapshot exists', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })

    expect(repository.clients.list()).toHaveLength(1)

    const storedSnapshot = JSON.parse(storage.getItem(PORTAL_STORAGE_KEY))
    expect(storedSnapshot.__schemaVersion).toBe(PORTAL_STORAGE_SCHEMA_VERSION)
    expect(storedSnapshot.activity_events).toEqual([])
    expect(repository.activityEvents.list()).toEqual([])
  })

  it('normalizes incomplete snapshots without leaking missing tables to callers', () => {
    const storage = createStorage({
      [PORTAL_STORAGE_KEY]: JSON.stringify({
        clients: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Existing Client',
          },
        ],
      }),
    })
    const repository = createLocalStoragePortalRepository({ seedData, storage })

    expect(repository.clients.list().map((client) => client.name)).toEqual(['Existing Client', 'Seed Client'])
    expect(repository.tasks.list()).toEqual([])

    const storedSnapshot = JSON.parse(storage.getItem(PORTAL_STORAGE_KEY))
    expect(storedSnapshot.__schemaVersion).toBe(PORTAL_STORAGE_SCHEMA_VERSION)
    expect(Array.isArray(storedSnapshot.dashboard_links)).toBe(true)
  })

  it('adds new seed records to existing snapshots without overwriting local records', () => {
    const storage = createStorage({
      [PORTAL_STORAGE_KEY]: JSON.stringify({
        __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
        clients: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Edited Seed Client',
          },
          {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Existing Client',
          },
        ],
        client_invitations: [],
        client_memberships: [],
        dashboard_links: [],
        needed_from_client: [],
        profiles: [],
        projects: [],
        reports: [],
        tasks: [],
        updates: [],
      }),
    })
    const repository = createLocalStoragePortalRepository({
      seedData: {
        ...seedData,
        clients: [
          ...seedData.clients,
          {
            id: '33333333-3333-4333-8333-333333333333',
            name: 'New Seed Client',
          },
        ],
      },
      storage,
    })

    expect(repository.clients.list().map((client) => client.name)).toEqual([
      'Edited Seed Client',
      'Existing Client',
      'New Seed Client',
    ])
  })

  it('reseeds malformed JSON snapshots', () => {
    const storage = createStorage({
      [PORTAL_STORAGE_KEY]: '{broken-json',
    })
    const repository = createLocalStoragePortalRepository({ seedData, storage })

    expect(repository.clients.list().map((client) => client.name)).toEqual(['Seed Client'])

    const storedSnapshot = JSON.parse(storage.getItem(PORTAL_STORAGE_KEY))
    expect(storedSnapshot.__schemaVersion).toBe(PORTAL_STORAGE_SCHEMA_VERSION)
  })

  it('reset removes the current snapshot and reseeds predictable QA data', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })

    repository.clients.upsert({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Temporary Client',
    })

    expect(repository.clients.list()).toHaveLength(2)
    expect(repository.reset().clients.map((client) => client.name)).toEqual(['Seed Client'])
  })
})
