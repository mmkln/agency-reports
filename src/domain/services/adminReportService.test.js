import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
} from '../../entities/needed-from-client'
import {
  createAgencyAccessViewer,
  createWorkspaceAccessViewer,
} from '../test/accessViewerTestHelpers'
import { REPORT_STATUSES } from '../../entities/report'
import {
  deleteAdminReport,
  duplicateAdminReport,
  listAdminReports,
  saveAdminReport,
  updateAdminReportStatus,
} from './adminReportService'
import { buildClinicReportDraftFromClientData } from './clinicReportTemplateService'
import { getClientReportsPage } from './clientReportsService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  CLINIC_LOCATION: '99999999-9999-4999-8999-999999999991',
  CLINIC_SERVICE: '99999999-9999-4999-8999-999999999992',
  OTHER_AGENCY: '99999999-9999-4999-8999-999999999999',
  REPORT_DRAFT: '44444444-4444-4444-8444-444444444444',
  REPORT_PUBLISHED: '55555555-5555-4555-8555-555555555555',
  USER_ADMIN: '66666666-6666-4666-8666-666666666666',
  USER_CLIENT: '77777777-7777-4777-8777-777777777777',
})

function createEntityRepository(records) {
  const items = [...records]

  return {
    deleteById(id) {
      const index = items.findIndex((item) => item.id === id)

      if (index < 0) {
        return false
      }

      items.splice(index, 1)
      return true
    },
    findById(id) {
      return items.find((record) => record.id === id) ?? null
    },
    list() {
      return items
    },
    listByClientId(clientId) {
      return items.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = items.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        items[index] = { ...items[index], ...record }
      } else {
        items.push(record)
      }

      return record
    },
  }
}

function createRepositories() {
  return {
    get workspaces() {
      return this.clients
    },
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        status: CLIENT_STATUSES.ON_TRACK,
        type: CLIENT_TYPES.GENERIC,
      },
      {
        agency_id: IDS.OTHER_AGENCY,
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        status: CLIENT_STATUSES.ON_TRACK,
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-01T09:00:00.000Z',
        id: IDS.REPORT_PUBLISHED,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-04T09:00:00.000Z',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Published summary',
        title: 'April Summary',
        updated_at: '2026-05-04T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-08T09:00:00.000Z',
        id: IDS.REPORT_DRAFT,
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft summary',
        title: 'May Draft',
        updated_at: '2026-05-08T09:00:00.000Z',
      },
    ]),
  }
}

function createClinicRepositories() {
  return {
    get workspaces() {
      return this.clients
    },
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental',
        status: CLIENT_STATUSES.ON_TRACK,
        type: CLIENT_TYPES.CLINIC,
      },
    ]),
    reports: createEntityRepository([]),
    clinicLocations: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.CLINIC_LOCATION,
        is_active: true,
        name: 'Main Clinic',
      },
    ]),
    clinicProfiles: createEntityRepository([]),
    clinicServiceLines: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.CLINIC_SERVICE,
        location_ids: [IDS.CLINIC_LOCATION],
        name: 'Dental Implants',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      },
    ]),
    patientAcquisitionSnapshots: createEntityRepository([
      {
        booked_appointments: 18,
        calls: 22,
        channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
        chats: 2,
        client_id: IDS.CLIENT_A,
        forms: 9,
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        location_id: IDS.CLINIC_LOCATION,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        qualified_inquiries: 29,
        service_line_id: IDS.CLINIC_SERVICE,
        spend: 2700,
      },
    ]),
    callBookingMetrics: createEntityRepository([
      {
        answered_calls: 34,
        average_response_seconds: 140,
        booked_from_calls: 16,
        client_id: IDS.CLIENT_A,
        follow_up_needed_count: 4,
        form_leads: 9,
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        location_id: IDS.CLINIC_LOCATION,
        missed_calls: 6,
        no_response_leads: 3,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.CLINIC_SERVICE,
        total_calls: 40,
      },
    ]),
    serviceLinePerformance: createEntityRepository([
      {
        booked_appointments: 18,
        campaign_status: 'live',
        client_id: IDS.CLIENT_A,
        compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        inquiries: 31,
        location_id: IDS.CLINIC_LOCATION,
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        service_line_id: IDS.CLINIC_SERVICE,
        spend: 2700,
      },
    ]),
    reputationSnapshots: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        google_rating: 4.8,
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        period_label: 'May 2026',
        period_start: '2026-05-01',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        review_count: 220,
        reviews_gained: 12,
        unanswered_reviews: 2,
      },
    ]),
    complianceReviews: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        limited_ads: 1,
        next_action: 'Doctor approval is needed before launch.',
        open_issues: 2,
        pending_approvals: 1,
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
        title: 'Ad claims review',
      },
    ]),
    medicalApprovals: createEntityRepository([
      {
        approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
        client_id: IDS.CLIENT_A,
        id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
        status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
        title: 'Implant claim wording',
      },
    ]),
    neededFromClient: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
        id: '12121212-1212-4212-8212-121212121212',
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Confirm missed-call follow-up',
      },
    ]),
  }
}

function createAdminViewer() {
  return createAgencyAccessViewer({
    agencyId: IDS.AGENCY,
    managedWorkspaceIds: [IDS.CLIENT_A, IDS.CLIENT_B],
    userId: IDS.USER_ADMIN,
  })
}

function createClientViewer() {
  return createWorkspaceAccessViewer({
    userId: IDS.USER_CLIENT,
    workspaceId: IDS.CLIENT_A,
  })
}

describe('adminReportService', () => {
  it('lists reports for agency-owned clients with client and status metadata', () => {
    const reports = listAdminReports({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(reports).toHaveLength(2)
    expect(reports[0]).toMatchObject({
      client: {
        id: IDS.CLIENT_A,
        name: 'Client A',
      },
      statusMeta: {
        label: 'Draft',
      },
      title: 'May Draft',
    })
  })

  it('creates a draft report without exposing it to the client reports archive', () => {
    const repositories = createRepositories()
    const report = saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'https://example.com/dashboard',
        periodEnd: '2026-06-30',
        periodStart: '2026-06-01',
        results: 'Spend: $9,100\nLeads: 119',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft client-facing explanation.',
        title: 'June Summary',
        whatWeDid: 'Optimized search campaigns.',
      },
      now: () => '2026-06-01T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(report.id).toBe('88888888-8888-4888-8888-888888888888')
    expect(report.status).toBe(REPORT_STATUSES.DRAFT)
    expect(JSON.stringify(clientPage)).not.toContain('June Summary')
  })

  it('creates clinic report templates from published aggregate clinic data', () => {
    const repositories = createClinicRepositories()
    const template = buildClinicReportDraftFromClientData({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })
    const report = saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        ...template,
        clientId: IDS.CLIENT_A,
        periodEnd: '2026-05-31',
        periodStart: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        title: 'May Clinic Summary',
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(template.clinicSections).toMatchObject({
      bookingLeakage: {
        followUpNeeded: 4,
        missedCalls: 6,
        noResponseLeads: 3,
      },
      compliance: {
        limitedAds: 1,
        openIssues: 2,
        pendingApprovals: 1,
      },
      patientAcquisition: {
        bookedAppointments: 18,
        inquiries: 33,
        topServiceLines: ['Dental Implants'],
      },
      reputation: {
        googleRating: 4.8,
        reviewsGained: 12,
        unansweredReviews: 2,
      },
    })
    expect(report).toMatchObject({
      clinicSections: expect.objectContaining({
        clinicActionsNeeded: ['Confirm missed-call follow-up'],
      }),
      status: REPORT_STATUSES.DRAFT,
      template: CLIENT_TYPES.CLINIC,
    })
    expect(repositories.reports.findById(report.id).clinic_sections).toMatchObject({
      patient_acquisition: {
        booked_appointments: 18,
      },
    })
  })

  it('publishes a report and makes it visible to the client reports archive', () => {
    const repositories = createRepositories()

    const publishedReport = updateAdminReportStatus({
      now: () => '2026-05-09T09:00:00.000Z',
      reportId: IDS.REPORT_DRAFT,
      repositories,
      status: REPORT_STATUSES.PUBLISHED,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      reportId: IDS.REPORT_DRAFT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(publishedReport.status).toBe(REPORT_STATUSES.PUBLISHED)
    expect(publishedReport.publishedAt).toBe('2026-05-09T09:00:00.000Z')
    expect(clientPage.selectedReport.title).toBe('May Draft')
  })

  it('duplicates an existing report as a new draft hidden from clients', () => {
    const repositories = createRepositories()

    const duplicatedReport = duplicateAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      now: () => '2026-05-10T09:00:00.000Z',
      reportId: IDS.REPORT_PUBLISHED,
      repositories,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(duplicatedReport).toMatchObject({
      id: '88888888-8888-4888-8888-888888888888',
      publishedAt: null,
      status: REPORT_STATUSES.DRAFT,
      summary: 'Published summary',
      title: 'Copy of April Summary',
    })
    expect(JSON.stringify(clientPage)).not.toContain('Copy of April Summary')
  })

  it('validates report period and external links', () => {
    expect(() => saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'not-a-url',
        periodEnd: '2026-04-30',
        periodStart: '2026-05-01',
        title: 'Broken Report',
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Period end must be after period start.')

    expect(() => saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'not-a-url',
        periodEnd: '2026-05-31',
        periodStart: '2026-05-01',
        title: 'Broken Report',
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Report dashboard URL must be a valid http(s) URL.')
  })

  it('deletes reports through admin-only operations', () => {
    const repositories = createRepositories()

    expect(deleteAdminReport({
      reportId: IDS.REPORT_DRAFT,
      repositories,
      viewer: createAdminViewer(),
    })).toBe(true)
    expect(repositories.reports.findById(IDS.REPORT_DRAFT)).toBeNull()
  })
})
