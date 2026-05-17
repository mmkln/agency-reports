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
  call_booking_metrics: [],
  client_file_links: [],
  client_invitations: [],
  client_memberships: [],
  client_requests: [],
  client_work_items: [],
  clinic_locations: [],
  clinic_profiles: [],
  clinic_service_lines: [],
  dashboard_links: [],
  needed_from_client: [],
  performance_dashboard_periods: [],
  patient_acquisition_snapshots: [],
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
        call_booking_metrics: [],
        client_invitations: [],
        client_file_links: [],
        client_memberships: [],
        client_requests: [],
        client_work_items: [],
        clinic_locations: [],
        clinic_profiles: [],
        clinic_service_lines: [],
        dashboard_links: [],
        needed_from_client: [],
        performance_dashboard_periods: [],
        patient_acquisition_snapshots: [],
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
        call_booking_metrics: [],
        client_invitations: [],
        client_file_links: [],
        client_memberships: [],
        client_requests: [],
        client_work_items: [],
        clinic_locations: [],
        clinic_profiles: [],
        clinic_service_lines: [],
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
        patient_acquisition_snapshots: [],
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

  it('persists client work items through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const workItem = {
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '44444444-4444-4444-8444-444444444444',
      publish_state: 'draft',
      status: 'planned',
      title: 'Client-facing work',
    }

    repository.clientWorkItems.upsert(workItem)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.clientWorkItems.findById(workItem.id)).toMatchObject(workItem)
    expect(reloadedRepository.clientWorkItems.listByClientId(workItem.client_id)).toHaveLength(1)
  })

  it('persists client file links through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const fileLink = {
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '55555555-5555-4555-8555-555555555555',
      status: 'active',
      title: 'Brand assets folder',
      type: 'brand_asset',
      url: 'https://drive.google.com/example',
      visibility: 'client_visible',
    }

    repository.clientFileLinks.upsert(fileLink)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.clientFileLinks.findById(fileLink.id)).toMatchObject(fileLink)
    expect(reloadedRepository.clientFileLinks.listByClientId(fileLink.client_id)).toHaveLength(1)
  })

  it('persists client initiated requests through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const request = {
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '66666666-6666-4666-8666-666666666666',
      request_type: 'new_work',
      status: 'submitted',
      title: 'Add landing page variant',
    }

    repository.clientRequests.upsert(request)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.clientRequests.findById(request.id)).toMatchObject(request)
    expect(reloadedRepository.clientRequests.listByClientId(request.client_id)).toHaveLength(1)
  })

  it('persists clinic foundation records through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const clientId = '11111111-1111-4111-8111-111111111111'
    const profile = {
      client_id: clientId,
      id: '77777777-7777-4777-8777-777777777777',
      primary_goal: 'Increase booked new patient appointments.',
      specialty: 'dental',
    }
    const location = {
      client_id: clientId,
      id: '88888888-8888-4888-8888-888888888888',
      name: 'Main Clinic',
    }
    const serviceLine = {
      client_id: clientId,
      id: '99999999-9999-4999-8999-999999999999',
      location_ids: [location.id],
      name: 'Dental Implants',
      status: 'active',
    }

    repository.clinicProfiles.upsert(profile)
    repository.clinicLocations.upsert(location)
    repository.clinicServiceLines.upsert(serviceLine)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.clinicProfiles.findById(profile.id)).toMatchObject(profile)
    expect(reloadedRepository.clinicProfiles.listByClientId(clientId)).toHaveLength(1)
    expect(reloadedRepository.clinicLocations.findById(location.id)).toMatchObject(location)
    expect(reloadedRepository.clinicLocations.listByClientId(clientId)).toHaveLength(1)
    expect(reloadedRepository.clinicServiceLines.findById(serviceLine.id)).toMatchObject(serviceLine)
    expect(reloadedRepository.clinicServiceLines.listByClientId(clientId)).toHaveLength(1)
  })

  it('persists patient acquisition snapshots through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const snapshot = {
      booked_appointments: 14,
      calls: 18,
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '10101010-1010-4010-8010-101010101010',
      period_label: 'May 2026',
      spend: 1800,
    }

    repository.patientAcquisitionSnapshots.upsert(snapshot)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.patientAcquisitionSnapshots.findById(snapshot.id)).toMatchObject(snapshot)
    expect(reloadedRepository.patientAcquisitionSnapshots.listByClientId(snapshot.client_id)).toHaveLength(1)
  })

  it('persists call booking metrics through the local repository adapter', () => {
    const storage = createStorage()
    const repository = createLocalStoragePortalRepository({ seedData, storage })
    const metric = {
      booked_from_calls: 12,
      client_id: '11111111-1111-4111-8111-111111111111',
      id: '12121212-1212-4212-8212-121212121212',
      missed_calls: 3,
      period_label: 'May 2026',
      total_calls: 24,
    }

    repository.callBookingMetrics.upsert(metric)

    const reloadedRepository = createLocalStoragePortalRepository({ seedData, storage })
    expect(reloadedRepository.callBookingMetrics.findById(metric.id)).toMatchObject(metric)
    expect(reloadedRepository.callBookingMetrics.listByClientId(metric.client_id)).toHaveLength(1)
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
