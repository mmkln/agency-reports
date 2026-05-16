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
  performance_dashboard_periods: [],
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
        performance_dashboard_periods: [],
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

  it('updates stale seeded performance dashboard campaign execution data without replacing local fields', () => {
    const periodId = '44444444-4444-4444-8444-444444444444'
    const storage = createStorage({
      [PORTAL_STORAGE_KEY]: JSON.stringify({
        __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
        clients: [],
        client_invitations: [],
        client_memberships: [],
        dashboard_links: [],
        needed_from_client: [],
        performance_dashboard_periods: [
          {
            client_id: '11111111-1111-4111-8111-111111111111',
            content: {
              campaign_execution: {
                activity_series: [
                  {
                    label: '06-01',
                    sms: 14,
                  },
                ],
                title: 'Old local title',
              },
              custom_note: 'Keep this local note',
            },
            id: periodId,
            title: 'Locally edited title',
          },
        ],
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
        performance_dashboard_periods: [
          {
            client_id: '11111111-1111-4111-8111-111111111111',
            content: {
              campaign_execution: {
                activity_series: [
                  {
                    label: '06-01',
                    sms: 14,
                  },
                  {
                    label: '06-02',
                    sms: 14,
                  },
                ],
                assumptions: ['Seed assumption'],
                title: 'Seed chart title',
              },
            },
            id: periodId,
            title: 'Seed title',
          },
        ],
      },
      storage,
    })

    const period = repository.performanceDashboardPeriods.findById(periodId)

    expect(period.title).toBe('Locally edited title')
    expect(period.content.custom_note).toBe('Keep this local note')
    expect(period.content.campaign_execution.title).toBe('Old local title')
    expect(period.content.campaign_execution.assumptions).toEqual(['Seed assumption'])
    expect(period.content.campaign_execution.activity_series).toHaveLength(2)
  })

  it('persists performance dashboard periods through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const period = {
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '44444444-4444-4444-8444-444444444444',
      period_end: '2026-04-30',
      period_start: '2026-04-01',
      status: 'draft',
      title: 'April Performance',
    }

    repository.performanceDashboardPeriods.upsert(period)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.performanceDashboardPeriods.findById(period.id)).toMatchObject(period)
    expect(reloadedRepository.performanceDashboardPeriods.listByClientId(period.client_id)).toHaveLength(1)
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
