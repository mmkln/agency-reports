import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_CAMPAIGN_STATUSES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import {
  getClientClinicFoundationPage,
  getClientClinicServiceLinesPage,
  getClientCallsBookingsPage,
  getClientComplianceApprovalsPage,
  getClientPatientAcquisitionPage,
  getClientReputationPage,
} from './clinicClientService'

const IDS = Object.freeze({
  AGENCY: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  GENERIC_CLIENT: '33333333-3333-4333-8333-333333333333',
  LOCATION: '44444444-4444-4444-8444-444444444444',
  LOCATION_B: '45454545-4545-4545-8545-454545454545',
  PROFILE: '55555555-5555-4555-8555-555555555555',
  SERVICE_LINE: '66666666-6666-4666-8666-666666666666',
  SERVICE_LINE_B: '67676767-6767-4767-8767-676767676767',
  SNAPSHOT: '77777777-7777-4777-8777-777777777777',
  SNAPSHOT_B: '78787878-7878-4788-8788-787878787878',
  CALL_BOOKING: '88888888-8888-4888-8888-888888888888',
  CALL_BOOKING_B: '89898989-8989-4899-8899-898989898989',
  REPUTATION: '99999999-9999-4999-8999-999999999999',
  COMPLIANCE_REVIEW: 'abababab-abab-4bab-8bab-abababababab',
  MEDICAL_APPROVAL: 'bcbcbcbc-bcbc-4cbc-8cbc-bcbcbcbcbcbc',
  SERVICE_PERFORMANCE: 'cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd',
  SERVICE_PERFORMANCE_B: 'dededede-dede-4ede-8ede-dededededede',
})

function createEntityRepository(records = []) {
  const storedRecords = records.map((record) => ({ ...record }))

  return {
    findById(id) {
      return storedRecords.find((record) => record.id === id) ?? null
    },
    list() {
      return storedRecords
    },
    listByClientId(clientId) {
      return storedRecords.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      storedRecords.push(record)
      return record
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Clinic A',
        portal_slug: 'clinic-a',
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_B,
        name: 'Clinic B',
        portal_slug: 'clinic-b',
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.GENERIC_CLIENT,
        name: 'Generic Client',
        portal_slug: 'generic-client',
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    clinicLocations: createEntityRepository([
      {
        address: '1 Main Street',
        city: 'Austin',
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.LOCATION,
        is_active: true,
        name: 'Main Clinic',
      },
    ]),
    clinicProfiles: createEntityRepository([
      {
        capacity_notes: 'Two implant consult slots remain open weekly.',
        client_id: IDS.CLIENT_A,
        id: IDS.PROFILE,
        insurance_model: 'Mixed insurance and private pay.',
        primary_goal: 'Increase booked new patient appointments.',
        specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
      },
    ]),
    clinicServiceLines: createEntityRepository([
      {
        average_value: 4200,
        capacity_note: 'Keep qualification strict before scaling.',
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.SERVICE_LINE,
        location_ids: [IDS.LOCATION],
        name: 'Dental Implants',
        primary_channel: 'google_ads',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
        target_monthly_bookings: 24,
      },
    ]),
    callBookingMetrics: createEntityRepository([
      {
        answered_calls: 37,
        average_response_seconds: 92,
        booked_from_calls: 24,
        client_id: IDS.CLIENT_A,
        first_time_calls: 31,
        follow_up_needed_count: 5,
        form_leads: 14,
        id: IDS.CALL_BOOKING,
        location_id: IDS.LOCATION,
        missed_calls: 6,
        no_response_leads: 3,
        not_booked_reasons: [
          { count: 4, reason: 'No available slot' },
          { count: 3, reason: 'Needed pricing details' },
        ],
        peak_call_times: [
          {
            booked_from_calls: 9,
            call_count: 16,
            label: 'Weekdays 9-11 AM',
            missed_calls: 4,
          },
          {
            booked_from_calls: 7,
            call_count: 12,
            label: 'Weekdays 4-6 PM',
            missed_calls: 2,
          },
        ],
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        service_line_id: IDS.SERVICE_LINE,
        total_calls: 43,
      },
    ]),
    patientAcquisitionSnapshots: createEntityRepository([
      {
        attended_appointments: 12,
        booked_appointments: 14,
        calls: 18,
        channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
        chats: 3,
        client_id: IDS.CLIENT_A,
        clicks: 240,
        data_source: 'Manual export',
        forms: 9,
        id: IDS.SNAPSHOT,
        impressions: 12800,
        landing_page_visits: 211,
        last_updated_at: '2026-05-08T09:00:00.000Z',
        location_id: IDS.LOCATION,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        qualified_inquiries: 21,
        service_line_id: IDS.SERVICE_LINE,
        spend: 1860,
      },
    ]),
    serviceLinePerformance: createEntityRepository([
      {
        booked_appointments: 18,
        campaign_name: 'Implants search',
        campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
        client_id: IDS.CLIENT_A,
        compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
        cost_per_booked_appointment: 125,
        cost_per_inquiry: 83,
        id: IDS.SERVICE_PERFORMANCE,
        inquiries: 27,
        landing_page_status: 'Live',
        location_id: IDS.LOCATION,
        period_end: '2026-05-31',
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        service_line_id: IDS.SERVICE_LINE,
        spend: 2250,
      },
    ]),
    reputationSnapshots: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        gbp_updates: 4,
        google_rating: 4.7,
        id: IDS.REPUTATION,
        last_updated_at: '2026-05-08T09:00:00.000Z',
        location_id: IDS.LOCATION,
        negative_reviews: 2,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        provider_profile_completeness: 0.86,
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        review_count: 286,
        review_request_sent: 142,
        review_response_drafts: 3,
        reviews_gained: 18,
        unanswered_reviews: 3,
      },
    ]),
    complianceReviews: createEntityRepository([
      {
        blocked_items: 1,
        client_id: IDS.CLIENT_A,
        id: IDS.COMPLIANCE_REVIEW,
        last_updated_at: '2026-05-08T09:00:00.000Z',
        limited_ads: 2,
        location_id: IDS.LOCATION,
        next_action: 'Doctor approval is needed before launch.',
        open_issues: 3,
        pending_approvals: 1,
        platform: 'Google Ads',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        risk_note: 'Avoid guaranteed outcome language.',
        service_line_id: IDS.SERVICE_LINE,
        status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
        summary: 'Medical claim needs review.',
        title: 'Ad claims review',
      },
    ]),
    medicalApprovals: createEntityRepository([
      {
        approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
        approver_label: 'Dr. Patel',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-14',
        history: [
          {
            actor_label: 'Dr. Patel',
            comment: 'Needs softer claim.',
            decision: 'changes_requested',
            decided_at: '2026-05-08T09:00:00.000Z',
            version: 'v1',
          },
        ],
        id: IDS.MEDICAL_APPROVAL,
        instructions: 'Review the claim.',
        last_updated_at: '2026-05-08T09:00:00.000Z',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        published_at: '2026-05-08T10:00:00.000Z',
        requested_by_label: 'GrowthLab',
        service_line_id: IDS.SERVICE_LINE,
        status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
        title: 'Implant claim wording',
        version: 'v1',
      },
    ]),
    ...overrides,
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

function createOtherAgencyAdminViewer() {
  return {
    agencyId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

function createFilteringRepositories() {
  return createRepositories({
    clinicLocations: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.LOCATION,
        is_active: true,
        name: 'Main Clinic',
      },
      {
        client_id: IDS.CLIENT_A,
        display_order: 20,
        id: IDS.LOCATION_B,
        is_active: true,
        name: 'North Clinic',
      },
    ]),
    clinicServiceLines: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.SERVICE_LINE,
        location_ids: [IDS.LOCATION],
        name: 'Dental Implants',
        primary_channel: 'google_ads',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      },
      {
        client_id: IDS.CLIENT_A,
        display_order: 20,
        id: IDS.SERVICE_LINE_B,
        location_ids: [IDS.LOCATION_B],
        name: 'Veneers',
        primary_channel: 'meta_ads',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      },
    ]),
    callBookingMetrics: createEntityRepository([
      {
        answered_calls: 20,
        booked_from_calls: 12,
        client_id: IDS.CLIENT_A,
        id: IDS.CALL_BOOKING,
        location_id: IDS.LOCATION,
        missed_calls: 3,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE,
        total_calls: 23,
      },
      {
        answered_calls: 8,
        booked_from_calls: 4,
        client_id: IDS.CLIENT_A,
        id: IDS.CALL_BOOKING_B,
        location_id: IDS.LOCATION_B,
        missed_calls: 5,
        period_label: 'June 2026',
        period_start: '2026-06-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE_B,
        total_calls: 13,
      },
    ]),
    patientAcquisitionSnapshots: createEntityRepository([
      {
        booked_appointments: 14,
        calls: 18,
        channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
        chats: 3,
        client_id: IDS.CLIENT_A,
        forms: 9,
        id: IDS.SNAPSHOT,
        location_id: IDS.LOCATION,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        qualified_inquiries: 21,
        service_line_id: IDS.SERVICE_LINE,
        spend: 1860,
      },
      {
        booked_appointments: 5,
        calls: 8,
        channel: CLINIC_ACQUISITION_CHANNELS.META_ADS,
        chats: 1,
        client_id: IDS.CLIENT_A,
        forms: 4,
        id: IDS.SNAPSHOT_B,
        location_id: IDS.LOCATION_B,
        period_label: 'June 2026',
        period_start: '2026-06-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        qualified_inquiries: 9,
        service_line_id: IDS.SERVICE_LINE_B,
        spend: 900,
      },
    ]),
    serviceLinePerformance: createEntityRepository([
      {
        booked_appointments: 18,
        campaign_name: 'Implants search',
        campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
        client_id: IDS.CLIENT_A,
        compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
        id: IDS.SERVICE_PERFORMANCE,
        inquiries: 27,
        location_id: IDS.LOCATION,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE,
        spend: 2250,
      },
      {
        booked_appointments: 6,
        campaign_name: 'Veneers social',
        campaign_status: CLINIC_CAMPAIGN_STATUSES.LIMITED_BY_POLICY,
        client_id: IDS.CLIENT_A,
        compliance_status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
        id: IDS.SERVICE_PERFORMANCE_B,
        inquiries: 14,
        location_id: IDS.LOCATION_B,
        period_label: 'June 2026',
        period_start: '2026-06-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.SERVICE_LINE_B,
        spend: 1200,
      },
    ]),
  })
}

describe('clinicClientService', () => {
  it('returns clinic profile, locations, and service lines for an authorized clinic client', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.client).toMatchObject({
      id: IDS.CLIENT_A,
      type: CLIENT_TYPES.CLINIC,
      typeMeta: {
        label: 'Clinic',
      },
    })
    expect(page.profile).toMatchObject({
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
      specialtyMeta: {
        label: 'Dental',
      },
    })
    expect(page.locations.map((location) => location.name)).toEqual(['Main Clinic'])
    expect(page.serviceLines[0]).toMatchObject({
      locations: [expect.objectContaining({ name: 'Main Clinic' })],
      name: 'Dental Implants',
      statusMeta: {
        label: 'Active',
      },
      targetMonthlyBookings: 24,
    })
  })

  it('returns a service-lines page read model from clinic foundation data', () => {
    const page = getClientClinicServiceLinesPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.isEmpty).toBe(false)
    expect(page.serviceLines.map((serviceLine) => serviceLine.name)).toEqual(['Dental Implants'])
    expect(page.locations.map((location) => location.name)).toEqual(['Main Clinic'])
    expect(page.performanceRecords[0]).toMatchObject({
      bookedAppointments: 18,
      bookingRate: 18 / 27,
      campaignName: 'Implants search',
      campaignStatusMeta: {
        label: 'Live',
      },
      complianceStatusMeta: {
        label: 'Approved',
      },
      costPerBookedAppointment: 125,
      costPerInquiry: 83,
      serviceLine: expect.objectContaining({ name: 'Dental Implants' }),
      spend: 2250,
    })
    expect(page.serviceLines[0]).toMatchObject({
      latestPerformance: expect.objectContaining({
        bookedAppointments: 18,
        campaignStatus: CLINIC_CAMPAIGN_STATUSES.LIVE,
      }),
      performanceTotals: expect.objectContaining({
        bookedAppointments: 18,
        costPerBookedAppointment: 125,
        costPerInquiry: 2250 / 27,
        inquiries: 27,
        spend: 2250,
      }),
    })
  })

  it('hides draft service line performance from client users and allows admin draft preview', () => {
    const repositories = createRepositories({
      serviceLinePerformance: createEntityRepository([
        {
          booked_appointments: 8,
          campaign_status: CLINIC_CAMPAIGN_STATUSES.OPTIMIZING,
          client_id: IDS.CLIENT_A,
          id: IDS.SERVICE_PERFORMANCE,
          inquiries: 11,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          service_line_id: IDS.SERVICE_LINE,
          spend: 900,
        },
      ]),
    })

    const clientPage = getClientClinicServiceLinesPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })
    const adminPreviewPage = getClientClinicServiceLinesPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createAdminViewer(),
    })

    expect(clientPage.performanceRecords).toEqual([])
    expect(clientPage.serviceLines[0].latestPerformance).toBeNull()
    expect(adminPreviewPage.source).toBe('draft')
    expect(adminPreviewPage.performanceRecords[0]).toMatchObject({
      bookedAppointments: 8,
      campaignStatus: CLINIC_CAMPAIGN_STATUSES.OPTIMIZING,
    })
  })

  it('returns aggregate patient acquisition totals and funnel data', () => {
    const page = getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.totals).toMatchObject({
      bookedAppointments: 14,
      calls: 18,
      costPerBookedAppointment: 1860 / 14,
      inquiries: 30,
      qualifiedInquiries: 21,
      spend: 1860,
    })
    expect(page.funnel.map((stage) => stage.id)).toEqual([
      'impressions',
      'clicks',
      'visits',
      'inquiries',
      'qualified',
      'booked',
      'attended',
    ])
    expect(page.snapshots[0]).toMatchObject({
      channelMeta: {
        label: 'Google Ads',
      },
      location: expect.objectContaining({ name: 'Main Clinic' }),
      serviceLine: expect.objectContaining({ name: 'Dental Implants' }),
    })
  })

  it('filters patient acquisition by clinic dimensions and keeps available filter options', () => {
    const page = getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      filters: {
        channel: CLINIC_ACQUISITION_CHANNELS.META_ADS,
        location_id: IDS.LOCATION_B,
        period_label: 'June 2026',
        service_line_id: IDS.SERVICE_LINE_B,
      },
      repositories: createFilteringRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.snapshots).toHaveLength(1)
    expect(page.snapshots[0]).toMatchObject({
      channel: CLINIC_ACQUISITION_CHANNELS.META_ADS,
      locationId: IDS.LOCATION_B,
      serviceLineId: IDS.SERVICE_LINE_B,
    })
    expect(page.totals).toMatchObject({
      bookedAppointments: 5,
      inquiries: 13,
      spend: 900,
    })
    expect(page.filters.selected).toMatchObject({
      channel: CLINIC_ACQUISITION_CHANNELS.META_ADS,
      location_id: IDS.LOCATION_B,
      period_label: 'June 2026',
      service_line_id: IDS.SERVICE_LINE_B,
    })
    expect(page.filters.availableChannels.map((option) => option.label)).toEqual(['Google Ads', 'Meta Ads'])
    expect(page.filters.availablePeriods.map((option) => option.value)).toEqual(['June 2026', 'May 2026'])
  })

  it('hides draft clinic metrics from client users', () => {
    const repositories = createRepositories({
      callBookingMetrics: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.CALL_BOOKING,
          period_label: 'Draft May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
          total_calls: 99,
        },
      ]),
      patientAcquisitionSnapshots: createEntityRepository([
        {
          booked_appointments: 99,
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT,
          period_label: 'Draft May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
    })

    expect(getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    }).snapshots).toEqual([])
    expect(getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    }).metrics).toEqual([])
  })

  it('allows owned agency admins to preview draft clinic metrics explicitly', () => {
    const repositories = createRepositories({
      patientAcquisitionSnapshots: createEntityRepository([
        {
          booked_appointments: 9,
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT,
          period_label: 'Draft May 2026',
          period_start: '2026-05-01',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
        },
      ]),
    })

    const clientPage = getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createClientViewer(),
    })
    const adminPreviewPage = getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createAdminViewer(),
    })

    expect(clientPage.snapshots).toEqual([])
    expect(adminPreviewPage.source).toBe('draft')
    expect(adminPreviewPage.snapshots).toHaveLength(1)
  })

  it('returns aggregate call and booking performance data', () => {
    const page = getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.totals).toMatchObject({
      answeredCalls: 37,
      answeredRate: 37 / 43,
      averageResponseSeconds: 92,
      bookedFromCalls: 24,
      callBookingRate: 24 / 43,
      missedCalls: 6,
      missedRate: 6 / 43,
      totalCalls: 43,
    })
    expect(page.metrics[0]).toMatchObject({
      location: expect.objectContaining({ name: 'Main Clinic' }),
      serviceLine: expect.objectContaining({ name: 'Dental Implants' }),
    })
    expect(page.notBookedReasons).toEqual([
      { count: 4, reason: 'No available slot' },
      { count: 3, reason: 'Needed pricing details' },
    ])
    expect(page.peakCallTimes[0]).toMatchObject({
      bookingRate: 9 / 16,
      callCount: 16,
      label: 'Weekdays 9-11 AM',
      missedCalls: 4,
      missedRate: 4 / 16,
    })
    expect(page.operationalInsights.map((insight) => insight.id)).toEqual([
      'missed-calls',
      'follow-up-gap',
    ])
    expect(page.operationalInsights[0].suggestedAction).toMatchObject({
      clinicActionType: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      title: 'Create missed-call follow-up action',
    })
  })

  it('links calls and bookings operational insights to open clinic actions', () => {
    const page = getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        neededFromClient: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
            id: 'efefefef-efef-4fef-8fef-efefefefefef',
            related_call_booking_metric_id: IDS.CALL_BOOKING,
            status: NEEDED_ACTION_STATUSES.PENDING,
            title: 'Confirm missed-call follow-up process',
            type: NEEDED_ACTION_TYPES.DECISION,
          },
        ]),
      }),
      viewer: createClientViewer(),
    })

    expect(page.operationalInsights[0]).toMatchObject({
      id: 'missed-calls',
      relatedActions: [
        expect.objectContaining({
          clinicActionType: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
          relatedCallBookingMetricId: IDS.CALL_BOOKING,
          title: 'Confirm missed-call follow-up process',
        }),
      ],
      suggestedAction: null,
    })
  })

  it('suggests calls and bookings actions without creating workflow records', () => {
    const neededFromClient = createEntityRepository([])

    const page = getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        neededFromClient,
      }),
      viewer: createClientViewer(),
    })

    expect(neededFromClient.list()).toEqual([])
    expect(page.operationalInsights.map((insight) => insight.suggestedAction?.clinicActionType)).toEqual([
      CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
    ])
  })

  it('filters calls and bookings by location, service line, and reporting period', () => {
    const page = getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      filters: {
        location_id: IDS.LOCATION_B,
        period_label: 'June 2026',
        service_line_id: IDS.SERVICE_LINE_B,
      },
      repositories: createFilteringRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.metrics).toHaveLength(1)
    expect(page.metrics[0]).toMatchObject({
      locationId: IDS.LOCATION_B,
      serviceLineId: IDS.SERVICE_LINE_B,
      totalCalls: 13,
    })
    expect(page.totals).toMatchObject({
      bookedFromCalls: 4,
      missedCalls: 5,
      totalCalls: 13,
    })
    expect(page.filters.availableLocations.map((option) => option.label)).toEqual(['North Clinic'])
    expect(page.filters.availableServiceLines.map((option) => option.label)).toEqual(['Veneers'])
  })

  it('filters service line performance by status, compliance, location, service line, and period', () => {
    const page = getClientClinicServiceLinesPage({
      clientId: IDS.CLIENT_A,
      filters: {
        campaign_status: CLINIC_CAMPAIGN_STATUSES.LIMITED_BY_POLICY,
        compliance_status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
        location_id: IDS.LOCATION_B,
        period_label: 'June 2026',
        service_line_id: IDS.SERVICE_LINE_B,
      },
      repositories: createFilteringRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.performanceRecords).toHaveLength(1)
    expect(page.performanceRecords[0]).toMatchObject({
      campaignStatus: CLINIC_CAMPAIGN_STATUSES.LIMITED_BY_POLICY,
      complianceStatus: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
      locationId: IDS.LOCATION_B,
      serviceLineId: IDS.SERVICE_LINE_B,
    })
    expect(page.serviceLines.map((serviceLine) => serviceLine.name)).toEqual(['Veneers'])
    expect(page.serviceLines[0].performanceTotals).toMatchObject({
      bookedAppointments: 6,
      inquiries: 14,
      spend: 1200,
    })
    expect(page.filters.availableCampaignStatuses.map((option) => option.label)).toEqual([
      'Limited by policy',
      'Live',
    ])
    expect(page.filters.availableComplianceStatuses.map((option) => option.label)).toEqual([
      'Approved',
      'Risk flagged',
    ])
  })

  it('returns aggregate reputation and local presence data', () => {
    const page = getClientReputationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.totals).toMatchObject({
      gbpUpdates: 4,
      googleRating: 4.7,
      negativeReviews: 2,
      providerProfileCompleteness: 0.86,
      reviewCount: 286,
      reviewRequestSent: 142,
      reviewResponseDrafts: 3,
      reviewsGained: 18,
      unansweredReviews: 3,
    })
    expect(page.latestSnapshot).toMatchObject({
      location: expect.objectContaining({ name: 'Main Clinic' }),
      periodLabel: 'May 2026',
      reviewRequestStatus: 'Active',
    })
  })

  it('hides draft reputation snapshots from client users', () => {
    const page = getClientReputationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        reputationSnapshots: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.REPUTATION,
            period_label: 'Draft May 2026',
            period_start: '2026-05-01',
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            review_count: 999,
          },
        ]),
      }),
      viewer: createClientViewer(),
    })

    expect(page.snapshots).toEqual([])
    expect(page.totals.reviewCount).toBe(0)
  })

  it('allows owned agency admins to preview draft reputation snapshots explicitly', () => {
    const page = getClientReputationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        reputationSnapshots: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.REPUTATION,
            period_label: 'Draft May 2026',
            period_start: '2026-05-01',
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            review_count: 999,
          },
        ]),
      }),
      source: 'draft',
      viewer: createAdminViewer(),
    })

    expect(page.source).toBe('draft')
    expect(page.snapshots).toHaveLength(1)
  })

  it('returns compliance reviews and medical approval history', () => {
    const page = getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.totals).toMatchObject({
      blockedItems: 1,
      limitedAds: 2,
      openIssues: 3,
      pendingApprovals: 1,
      reviewCount: 1,
      riskFlaggedReviews: 1,
    })
    expect(page.reviews[0]).toMatchObject({
      serviceLine: expect.objectContaining({ name: 'Dental Implants' }),
      statusMeta: {
        label: 'Risk flagged',
      },
    })
    expect(page.approvals[0]).toMatchObject({
      approvalTypeMeta: {
        label: 'Medical claim',
      },
      history: [
        expect.objectContaining({
          actor_label: 'Dr. Patel',
          decision: 'changes_requested',
        }),
      ],
      statusMeta: {
        label: 'Pending medical review',
      },
    })
  })

  it('hides draft compliance reviews and medical approvals from client users', () => {
    const page = getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        complianceReviews: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.COMPLIANCE_REVIEW,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            title: 'Draft compliance issue',
          },
        ]),
        medicalApprovals: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.MEDICAL_APPROVAL,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            title: 'Draft approval',
          },
        ]),
      }),
      viewer: createClientViewer(),
    })

    expect(page.reviews).toEqual([])
    expect(page.approvals).toEqual([])
    expect(page.isEmpty).toBe(true)
  })

  it('allows owned agency admins to preview draft compliance and approval records explicitly', () => {
    const page = getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        complianceReviews: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.COMPLIANCE_REVIEW,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            title: 'Draft compliance issue',
          },
        ]),
        medicalApprovals: createEntityRepository([
          {
            client_id: IDS.CLIENT_A,
            id: IDS.MEDICAL_APPROVAL,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
            title: 'Draft approval',
          },
        ]),
      }),
      source: 'draft',
      viewer: createAdminViewer(),
    })

    expect(page.source).toBe('draft')
    expect(page.reviews).toHaveLength(1)
    expect(page.approvals).toHaveLength(1)
  })

  it('denies cross-client patient acquisition access', () => {
    const page = getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('denies cross-client calls and bookings access', () => {
    const page = getClientCallsBookingsPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('denies cross-client reputation access', () => {
    const page = getClientReputationPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('denies cross-client compliance and approvals access', () => {
    const page = getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('denies cross-client clinic access', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('does not expose generic clients through the clinic foundation read model', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.GENERIC_CLIENT,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('allows agency admins to read clinic records only for their own agency', () => {
    const allowedPage = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })
    const deniedPage = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createOtherAgencyAdminViewer(),
    })

    expect(allowedPage.status).toBe('ready')
    expect(deniedPage).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('blocks patient-level fields from clinic MVP read models', () => {
    const repositories = createRepositories({
      clinicServiceLines: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SERVICE_LINE,
          name: 'Dental Implants',
          patient_name: 'Jane Patient',
          status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
        },
      ]),
    })

    expect(() => getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Clinic service line must stay aggregate-only')
  })

  it('blocks nested patient-level fields from clinic profile data', () => {
    const repositories = createRepositories({
      clinicProfiles: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.PROFILE,
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
          tracking_note: {
            patient_email: 'jane@example.com',
          },
        },
      ]),
    })

    expect(() => getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Clinic profile must stay aggregate-only')
  })

  it('blocks patient-level fields from patient acquisition snapshots', () => {
    const repositories = createRepositories({
      patientAcquisitionSnapshots: createEntityRepository([
        {
          booked_appointments: 1,
          client_id: IDS.CLIENT_A,
          id: IDS.SNAPSHOT,
          patient_phone: '+1 555 0100',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        },
      ]),
    })

    expect(() => getClientPatientAcquisitionPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Patient acquisition snapshot must stay aggregate-only')
  })

  it('blocks patient-level fields from call booking metrics', () => {
    const repositories = createRepositories({
      callBookingMetrics: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.CALL_BOOKING,
          peak_call_times: [
            {
              call_count: 1,
              label: 'Weekdays 9-11 AM',
              patient_phone: '+1 555 0100',
            },
          ],
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          total_calls: 1,
        },
      ]),
    })

    expect(() => getClientCallsBookingsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Call booking metric must stay aggregate-only')
  })

  it('blocks patient-level fields from reputation snapshots', () => {
    const repositories = createRepositories({
      reputationSnapshots: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.REPUTATION,
          patient_name: 'Jane Patient',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          review_count: 1,
        },
      ]),
    })

    expect(() => getClientReputationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Reputation snapshot must stay aggregate-only')
  })

  it('blocks patient-level fields from compliance and approval records', () => {
    const complianceRepositories = createRepositories({
      complianceReviews: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.COMPLIANCE_REVIEW,
          patient_id: 'patient-a',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          title: 'Unsafe compliance review',
        },
      ]),
    })

    expect(() => getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_A,
      repositories: complianceRepositories,
      viewer: createClientViewer(),
    })).toThrow('Compliance review must stay aggregate-only')

    const approvalRepositories = createRepositories({
      complianceReviews: createEntityRepository([]),
      medicalApprovals: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.MEDICAL_APPROVAL,
          patient_email: 'jane@example.com',
          publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
          title: 'Unsafe approval',
        },
      ]),
    })

    expect(() => getClientComplianceApprovalsPage({
      clientId: IDS.CLIENT_A,
      repositories: approvalRepositories,
      viewer: createClientViewer(),
    })).toThrow('Medical approval must stay aggregate-only')
  })
})
