import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import {
  getAdminClinicMetricsPage,
  saveAdminClinicMetrics,
} from './adminClinicMetricsService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  LOCATION_A: '55555555-5555-4555-8555-555555555555',
  SERVICE_A: '66666666-6666-4666-8666-666666666666',
  ACQUISITION_A: '77777777-7777-4777-8777-777777777777',
  CALLS_A: '88888888-8888-4888-8888-888888888888',
})

function createRepository(initialRecords = []) {
  const records = [...initialRecords]

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

      return record
    },
    deleteById(id) {
      const index = records.findIndex((record) => record.id === id)

      if (index < 0) {
        return false
      }

      records.splice(index, 1)
      return true
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    callBookingMetrics: createRepository([]),
    clients: createRepository([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental',
        primary_contact_email: 'owner@green.test',
        primary_contact_name: 'Owner',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_B,
        name: 'Generic Client',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    clinicLocations: createRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.LOCATION_A,
        is_active: true,
        name: 'Main Clinic',
      },
    ]),
    clinicServiceLines: createRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.SERVICE_A,
        location_ids: [IDS.LOCATION_A],
        name: 'Dental Implants',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      },
    ]),
    patientAcquisitionSnapshots: createRepository([]),
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    agencyId,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user-id',
  }
}

describe('adminClinicMetricsService', () => {
  it('reads aggregate clinic metrics with foundation filters', () => {
    const repositories = createRepositories({
      callBookingMetrics: createRepository([
        {
          answered_calls: 18,
          booked_from_calls: 9,
          client_id: IDS.CLIENT_A,
          id: IDS.CALLS_A,
          missed_calls: 2,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          total_calls: 20,
        },
      ]),
      patientAcquisitionSnapshots: createRepository([
        {
          booked_appointments: 12,
          calls: 18,
          channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
          client_id: IDS.CLIENT_A,
          id: IDS.ACQUISITION_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          spend: 1200,
        },
      ]),
    })

    const page = getAdminClinicMetricsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.client.name).toBe('Green Dental Clinic')
    expect(page.locations).toHaveLength(1)
    expect(page.serviceLines).toHaveLength(1)
    expect(page.patientAcquisitionSnapshots[0]).toMatchObject({
      booked_appointments: 12,
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
    })
    expect(page.callBookingMetrics[0]).toMatchObject({
      answered_calls: 18,
      missed_calls: 2,
    })
  })

  it('saves patient acquisition and calls/bookings snapshots as aggregate data', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.ACQUISITION_A, IDS.CALLS_A]

    const page = saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        callBookingMetrics: [
          {
            answered_calls: '22',
            average_response_seconds: '45',
            booked_from_calls: '14',
            data_source: 'CallRail aggregate export',
            first_time_calls: '17',
            follow_up_needed_count: '3',
            form_leads: '7',
            location_id: IDS.LOCATION_A,
            missed_calls: '2',
            no_response_leads: '1',
            not_booked_reasons: [
              {
                count: 2,
                reason: 'No suitable appointment slots',
              },
            ],
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            service_line_id: IDS.SERVICE_A,
            summary: 'Call handling improved after front desk follow-up.',
            total_calls: '24',
          },
        ],
        patientAcquisitionSnapshots: [
          {
            attended_appointments: '9',
            booked_appointments: '12',
            calls: '18',
            channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
            chats: '2',
            clicks: '180',
            data_source: 'Manual Google Ads + booking rollup',
            forms: '6',
            impressions: '12000',
            landing_page_visits: '140',
            location_id: IDS.LOCATION_A,
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            qualified_inquiries: '15',
            service_line_id: IDS.SERVICE_A,
            spend: '1200',
            summary: 'Implants campaign drove most booked consults.',
          },
        ],
      },
      now: () => '2026-05-17T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.patientAcquisitionSnapshots[0]).toMatchObject({
      booked_appointments: 12,
      client_id: IDS.CLIENT_A,
      id: IDS.ACQUISITION_A,
      last_updated_at: '2026-05-17T10:00:00.000Z',
      service_line_id: IDS.SERVICE_A,
    })
    expect(page.callBookingMetrics[0]).toMatchObject({
      booked_from_calls: 14,
      client_id: IDS.CLIENT_A,
      id: IDS.CALLS_A,
      location_id: IDS.LOCATION_A,
    })
  })

  it('deletes omitted metric records when saving the admin source of truth', () => {
    const repositories = createRepositories({
      callBookingMetrics: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.CALLS_A,
          period_end: '2026-04-30',
          period_label: 'April 2026',
          period_start: '2026-04-01',
        },
      ]),
      patientAcquisitionSnapshots: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.ACQUISITION_A,
          period_end: '2026-04-30',
          period_label: 'April 2026',
          period_start: '2026-04-01',
        },
      ]),
    })

    const page = saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'unused',
      input: {
        callBookingMetrics: [],
        patientAcquisitionSnapshots: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.patientAcquisitionSnapshots).toEqual([])
    expect(page.callBookingMetrics).toEqual([])
  })

  it('blocks invalid access, generic clients, invalid references, and PHI fields', () => {
    expect(() => getAdminClinicMetricsPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Clinic metrics are only available for clinic clients.')

    expect(() => getAdminClinicMetricsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(IDS.AGENCY_B),
    })).toThrow('Clinic metrics are not available for this admin.')

    expect(() => saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.ACQUISITION_A,
      input: {
        callBookingMetrics: [],
        patientAcquisitionSnapshots: [
          {
            location_id: 'unknown-location',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Patient acquisition location is invalid.')

    expect(() => saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.ACQUISITION_A,
      input: {
        callBookingMetrics: [],
        patientAcquisitionSnapshots: [
          {
            patient_email: 'patient@example.com',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Patient acquisition snapshot must stay aggregate-only.')
  })
})
