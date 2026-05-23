import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_CAMPAIGN_STATUSES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { createAgencyAccessViewer } from '../test/accessViewerTestHelpers'
import {
  getAdminClinicMetricsPage,
  publishBookingPipelineSnapshot,
  publishCallBookingMetric,
  publishLocationPerformance,
  publishPatientAcquisitionSnapshot,
  publishServiceLinePerformance,
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
  BOOKING_PIPELINE_A: '78787878-7878-4788-8788-787878787878',
  CALLS_A: '88888888-8888-4888-8888-888888888888',
  LOCATION_PERFORMANCE_A: '89898989-8989-4899-8899-898989898989',
  PERFORMANCE_A: '99999999-9999-4999-8999-999999999999',
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
    get workspaces() {
      return this.clients
    },
    bookingPipelineSnapshots: createRepository([]),
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
    neededFromClient: createRepository([]),
    patientAcquisitionSnapshots: createRepository([]),
    locationPerformance: createRepository([]),
    serviceLinePerformance: createRepository([]),
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return createAgencyAccessViewer({
    agencyId,
    managedWorkspaceIds: agencyId === IDS.AGENCY_A ? [IDS.CLIENT_A, IDS.CLIENT_B] : [],
    userId: 'admin-user-id',
  })
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
      serviceLinePerformance: createRepository([
        {
          booked_appointments: 18,
          campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
          client_id: IDS.CLIENT_A,
          id: IDS.PERFORMANCE_A,
          inquiries: 27,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          service_line_id: IDS.SERVICE_A,
          spend: 2250,
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
      booking_action_suggestions: [
        {
          hasOpenAction: false,
          type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
        },
      ],
      missed_calls: 2,
    })
    expect(page.serviceLinePerformance[0]).toMatchObject({
      booked_appointments: 18,
      campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
      service_line_id: IDS.SERVICE_A,
      spend: 2250,
    })
  })

  it('marks existing open booking actions in call booking suggestions', () => {
    const repositories = createRepositories({
      callBookingMetrics: createRepository([
        {
          average_response_seconds: 180,
          client_id: IDS.CLIENT_A,
          follow_up_needed_count: 2,
          id: IDS.CALLS_A,
          missed_calls: 4,
          no_response_leads: 1,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          total_calls: 20,
        },
      ]),
      neededFromClient: createRepository([
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
          id: 'action-open-missed-calls',
          related_call_booking_metric_id: IDS.CALLS_A,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Fix missed calls',
        },
        {
          client_id: IDS.CLIENT_A,
          clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
          id: 'action-resolved-script',
          related_call_booking_metric_id: IDS.CALLS_A,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Old script action',
        },
      ]),
    })

    const page = getAdminClinicMetricsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.callBookingMetrics[0].booking_action_suggestions).toEqual([
      {
        actionLabel: 'Create missed-call action',
        defaultActionType: NEEDED_ACTION_TYPES.DECISION,
        hasOpenAction: true,
        openAction: {
          id: 'action-open-missed-calls',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Fix missed calls',
        },
        type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      },
      {
        actionLabel: 'Create call script action',
        defaultActionType: NEEDED_ACTION_TYPES.APPROVAL,
        hasOpenAction: false,
        openAction: null,
        type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
      },
      {
        actionLabel: 'Create follow-up action',
        defaultActionType: NEEDED_ACTION_TYPES.DECISION,
        hasOpenAction: false,
        openAction: null,
        type: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
      },
    ])
  })

  it('saves aggregate clinic metric records', () => {
    const repositories = createRepositories()
    const generatedIds = [
      IDS.ACQUISITION_A,
      IDS.BOOKING_PIPELINE_A,
      IDS.CALLS_A,
      IDS.LOCATION_PERFORMANCE_A,
      IDS.PERFORMANCE_A,
    ]

    const page = saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        bookingPipelineSnapshots: [
          {
            attended_appointments: '8',
            booked_appointments: '10',
            calls: '18',
            forms: '5',
            location_id: IDS.LOCATION_A,
            missed_calls: '2',
            no_response_leads: '1',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            qualified_inquiries: '14',
            service_line_id: IDS.SERVICE_A,
            summary: 'Booking pipeline shows front desk leakage.',
          },
        ],
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
            peak_call_times: [
              {
                call_count: 11,
                label: 'Weekdays 9-11 AM',
                missed_calls: 2,
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
        locationPerformance: [
          {
            answered_calls: '30',
            booked_appointments: '16',
            compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
            google_rating: '4.8',
            inquiries: '24',
            location_id: IDS.LOCATION_A,
            missed_calls: '3',
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            review_count: '301',
            reviews_gained: '12',
            spend: '2100',
            summary: 'Main clinic is on track.',
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
        serviceLinePerformance: [
          {
            booked_appointments: '18',
            campaign_name: 'Implants search',
            campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
            compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
            cost_per_booked_appointment: '125',
            cost_per_inquiry: '83',
            data_source: 'Manual service line rollup',
            inquiries: '27',
            landing_page_status: 'Live',
            location_id: IDS.LOCATION_A,
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            service_line_id: IDS.SERVICE_A,
            spend: '2250',
            summary: 'Implants are on track.',
          },
        ],
      },
      now: () => '2026-05-17T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.bookingPipelineSnapshots[0]).toMatchObject({
      booked_appointments: 10,
      client_id: IDS.CLIENT_A,
      id: IDS.BOOKING_PIPELINE_A,
      missed_calls: 2,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      service_line_id: IDS.SERVICE_A,
    })
    expect(page.patientAcquisitionSnapshots[0]).toMatchObject({
      booked_appointments: 12,
      client_id: IDS.CLIENT_A,
      id: IDS.ACQUISITION_A,
      last_updated_at: '2026-05-17T10:00:00.000Z',
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      service_line_id: IDS.SERVICE_A,
    })
    expect(page.callBookingMetrics[0]).toMatchObject({
      booked_from_calls: 14,
      client_id: IDS.CLIENT_A,
      id: IDS.CALLS_A,
      location_id: IDS.LOCATION_A,
      peak_call_times: [
        {
          call_count: 11,
          label: 'Weekdays 9-11 AM',
          missed_calls: 2,
        },
      ],
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    })
    expect(page.locationPerformance[0]).toMatchObject({
      booked_appointments: 16,
      client_id: IDS.CLIENT_A,
      compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
      id: IDS.LOCATION_PERFORMANCE_A,
      location_id: IDS.LOCATION_A,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    })
    expect(page.serviceLinePerformance[0]).toMatchObject({
      booked_appointments: 18,
      campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
      client_id: IDS.CLIENT_A,
      id: IDS.PERFORMANCE_A,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      service_line_id: IDS.SERVICE_A,
    })
  })

  it('publishes metric records with audit metadata', () => {
    const repositories = createRepositories({
      bookingPipelineSnapshots: createRepository([
        {
          booked_appointments: 7,
          client_id: IDS.CLIENT_A,
          id: IDS.BOOKING_PIPELINE_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
      callBookingMetrics: createRepository([
        {
          booked_from_calls: 9,
          client_id: IDS.CLIENT_A,
          id: IDS.CALLS_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
      locationPerformance: createRepository([
        {
          booked_appointments: 12,
          client_id: IDS.CLIENT_A,
          compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
          id: IDS.LOCATION_PERFORMANCE_A,
          location_id: IDS.LOCATION_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
      patientAcquisitionSnapshots: createRepository([
        {
          booked_appointments: 8,
          client_id: IDS.CLIENT_A,
          id: IDS.ACQUISITION_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
      serviceLinePerformance: createRepository([
        {
          booked_appointments: 10,
          client_id: IDS.CLIENT_A,
          compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
          id: IDS.PERFORMANCE_A,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          service_line_id: IDS.SERVICE_A,
        },
      ]),
    })

    const bookingPipelinePage = publishBookingPipelineSnapshot({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T09:30:00.000Z',
      repositories,
      snapshotId: IDS.BOOKING_PIPELINE_A,
      viewer: createAdminViewer(),
    })
    const acquisitionPage = publishPatientAcquisitionSnapshot({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      snapshotId: IDS.ACQUISITION_A,
      viewer: createAdminViewer(),
    })
    const callsPage = publishCallBookingMetric({
      clientId: IDS.CLIENT_A,
      metricId: IDS.CALLS_A,
      now: () => '2026-05-18T10:30:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    const locationPage = publishLocationPerformance({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T10:45:00.000Z',
      performanceId: IDS.LOCATION_PERFORMANCE_A,
      repositories,
      viewer: createAdminViewer(),
    })
    const serviceLinePage = publishServiceLinePerformance({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-18T11:00:00.000Z',
      performanceId: IDS.PERFORMANCE_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(bookingPipelinePage.bookingPipelineSnapshots[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T09:30:00.000Z',
      published_by: 'admin-user-id',
    })
    expect(acquisitionPage.patientAcquisitionSnapshots[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:00:00.000Z',
      published_by: 'admin-user-id',
    })
    expect(callsPage.callBookingMetrics[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:30:00.000Z',
      published_by: 'admin-user-id',
    })
    expect(locationPage.locationPerformance[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T10:45:00.000Z',
      published_by: 'admin-user-id',
    })
    expect(serviceLinePage.serviceLinePerformance[0]).toMatchObject({
      publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
      published_at: '2026-05-18T11:00:00.000Z',
      published_by: 'admin-user-id',
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
      serviceLinePerformance: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.PERFORMANCE_A,
          period_end: '2026-04-30',
          period_label: 'April 2026',
          period_start: '2026-04-01',
          service_line_id: IDS.SERVICE_A,
        },
      ]),
    })

    const page = saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'unused',
      input: {
        callBookingMetrics: [],
        patientAcquisitionSnapshots: [],
        serviceLinePerformance: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.patientAcquisitionSnapshots).toEqual([])
    expect(page.callBookingMetrics).toEqual([])
    expect(page.serviceLinePerformance).toEqual([])
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
        serviceLinePerformance: [],
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
        serviceLinePerformance: [],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Patient acquisition snapshot must stay aggregate-only.')

    expect(() => saveAdminClinicMetrics({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.PERFORMANCE_A,
      input: {
        callBookingMetrics: [],
        patientAcquisitionSnapshots: [],
        serviceLinePerformance: [
          {
            period_end: '2026-05-31',
            period_label: 'May 2026',
            period_start: '2026-05-01',
            service_line_id: 'unknown-service',
          },
        ],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Service line performance service line is invalid.')
  })
})
