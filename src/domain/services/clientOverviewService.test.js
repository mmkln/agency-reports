import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
} from '../../entities/performance-dashboard'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { getClientOverviewPage } from './clientOverviewService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  DASHBOARD_ACTIVE: '44444444-4444-4444-8444-444444444444',
  DASHBOARD_DRAFT: '55555555-5555-4555-8555-555555555555',
  DASHBOARD_UNAVAILABLE: '66666666-6666-4666-8666-666666666666',
  PROJECT_A: '77777777-7777-4777-8777-777777777777',
  PROJECT_B: '88888888-8888-4888-8888-888888888888',
  PERFORMANCE_DRAFT: '456e4567-e89b-42d3-a456-426614174100',
  PERFORMANCE_PUBLISHED: '456e4567-e89b-42d3-a456-426614174101',
  REPORT_DRAFT: '99999999-9999-4999-8999-999999999999',
  REPORT_OLD: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  REPORT_PUBLISHED: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  TASK_CLIENT_VISIBLE: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  TASK_DONE: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  TASK_INTERNAL: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  WORK_ITEM_ARCHIVED: 'c87a8d3b-9839-4f3c-ae67-16f6888f0100',
  WORK_ITEM_DELIVERED: 'c87a8d3b-9839-4f3c-ae67-16f6888f0101',
  WORK_ITEM_DRAFT: 'c87a8d3b-9839-4f3c-ae67-16f6888f0102',
  WORK_ITEM_PUBLISHED: 'c87a8d3b-9839-4f3c-ae67-16f6888f0103',
  WORK_ITEM_READY: 'c87a8d3b-9839-4f3c-ae67-16f6888f0104',
  UPDATE_CLIENT_VISIBLE: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  UPDATE_INTERNAL: '123e4567-e89b-42d3-a456-426614174000',
  CLINIC_LOCATION: '123e4567-e89b-42d3-a456-426614174010',
  CLINIC_PROFILE: '123e4567-e89b-42d3-a456-426614174011',
  CLINIC_SERVICE: '123e4567-e89b-42d3-a456-426614174012',
  CLINIC_ACQUISITION: '123e4567-e89b-42d3-a456-426614174013',
  CLINIC_CALLS: '123e4567-e89b-42d3-a456-426614174014',
  CLINIC_REPUTATION: '123e4567-e89b-42d3-a456-426614174015',
  CLINIC_COMPLIANCE: '123e4567-e89b-42d3-a456-426614174016',
  CLINIC_APPROVAL: '123e4567-e89b-42d3-a456-426614174017',
})

function createEntityRepository(records) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return [...records]
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
  }
}

function createRepositories(overrides = {}) {
  const data = {
    clients: [
      {
        agency_id: IDS.AGENCY,
        current_focus: ['Campaign optimization', 'Landing page review'],
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        primary_contact_email: 'client-a@example.com',
        primary_contact_name: 'Client A Contact',
        status: CLIENT_STATUSES.ON_TRACK,
      },
      {
        agency_id: IDS.AGENCY,
        current_focus: ['Private client work'],
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        primary_contact_email: 'client-b@example.com',
        primary_contact_name: 'Client B Contact',
        status: CLIENT_STATUSES.BLOCKED,
      },
    ],
    clientWorkItems: [
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ITEM_ARCHIVED,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
        sort_order: 0,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Archived work item must stay hidden.',
        target_date: '2026-05-11',
        title: 'Archived work item',
        updated_at: '2026-05-08T08:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ITEM_PUBLISHED,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        sort_order: 1,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Safe published work item summary.',
        target_date: '2026-05-12',
        title: 'Published work item',
        updated_at: '2026-05-08T08:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ITEM_DRAFT,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
        sort_order: 2,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Draft work item must stay hidden.',
        target_date: '2026-05-13',
        title: 'Draft work item',
        updated_at: '2026-05-08T08:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ITEM_READY,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        sort_order: 3,
        status: CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION,
        summary: 'Ready work item must stay hidden.',
        target_date: '2026-05-14',
        title: 'Ready for review work item',
        updated_at: '2026-05-08T08:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ITEM_DELIVERED,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        sort_order: 4,
        status: CLIENT_WORK_ITEM_STATUSES.DELIVERED,
        summary: 'Delivered work item is visible elsewhere but not active overview work.',
        target_date: '2026-05-01',
        title: 'Delivered work item',
        updated_at: '2026-05-08T08:00:00.000Z',
      },
    ],
    clinicLocations: [],
    clinicProfiles: [],
    clinicServiceLines: [],
    patientAcquisitionSnapshots: [],
    callBookingMetrics: [],
    reputationSnapshots: [],
    complianceReviews: [],
    medicalApprovals: [],
    dashboardLinks: [
      {
        client_id: IDS.CLIENT_A,
        fallback_message: 'Dashboard fallback',
        id: IDS.DASHBOARD_ACTIVE,
        name: 'Active Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/dashboard',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        fallback_message: 'Draft dashboard',
        id: IDS.DASHBOARD_DRAFT,
        name: 'Draft Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/draft-dashboard',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.DRAFT,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ],
    neededFromClient: [
      {
        client_id: IDS.CLIENT_A,
        description: 'Please approve creative batch.',
        due_date: '2026-05-09',
        id: '123e4567-e89b-42d3-a456-426614174001',
        related_link: '',
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creative batch',
      },
      {
        client_id: IDS.CLIENT_A,
        description: 'Cancelled action should stay hidden.',
        due_date: '2026-05-08',
        id: '123e4567-e89b-42d3-a456-426614174002',
        related_link: '',
        status: NEEDED_ACTION_STATUSES.CANCELLED,
        title: 'Cancelled action',
      },
    ],
    projects: [
      {
        client_id: IDS.CLIENT_A,
        description: 'Primary project',
        id: IDS.PROJECT_A,
        name: 'Campaign Setup',
        progress_percent: 80,
        status: 'in_progress',
      },
      {
        client_id: IDS.CLIENT_A,
        description: 'Secondary project',
        id: IDS.PROJECT_B,
        name: 'Reporting Setup',
        progress_percent: 40,
        status: 'in_progress',
      },
    ],
    performanceDashboardPeriods: [
      {
        account_manager: 'Sarah Johnson',
        attribution_note: 'Manual demo attribution.',
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Performance improved this month.',
          },
          hero_metric: {
            label: 'Qualified Leads',
            unit: 'number',
            value: 81,
          },
          insights: [
            {
              body: 'Search lead quality improved.',
              severity: 'positive',
              title: 'Lead quality improved',
            },
          ],
          kpi_cards: [
            {
              name: 'Pipeline',
              unit: 'currency',
              value: 124000,
            },
            {
              name: 'CPL',
              unit: 'currency',
              value: 48,
            },
            {
              name: 'Conversion Rate',
              unit: 'percent',
              value: 12,
            },
            {
              name: 'Spend',
              unit: 'currency',
              value: 3900,
            },
          ],
          next_steps: [
            {
              title: 'Scale search campaigns',
            },
          ],
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERFORMANCE_PUBLISHED,
        last_updated_at: '2026-05-08T10:00:00.000Z',
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-08T10:00:00.000Z',
        status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
        title: 'April Performance',
      },
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Draft performance must stay hidden.',
          },
          hero_metric: {
            label: 'Draft Leads',
            value: 999,
          },
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERFORMANCE_DRAFT,
        last_updated_at: '2026-06-01T10:00:00.000Z',
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
        title: 'May Draft Performance',
      },
    ],
    reports: [
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_OLD,
        period_end: '2026-03-31',
        period_start: '2026-03-01',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Older visible summary',
        title: 'March Summary',
      },
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_PUBLISHED,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Latest visible summary',
        title: 'April Summary',
      },
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_DRAFT,
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft summary must stay hidden',
        title: 'May Draft Summary',
      },
    ],
    tasks: [
      {
        assignee_name: 'Owner A',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-09',
        id: IDS.TASK_CLIENT_VISIBLE,
        project_id: IDS.PROJECT_A,
        sort_order: 1,
        status: TASK_STATUSES.IN_PROGRESS,
        title: 'Visible task',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        assignee_name: 'Owner B',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-10',
        id: IDS.TASK_INTERNAL,
        project_id: IDS.PROJECT_A,
        sort_order: 2,
        status: TASK_STATUSES.IN_PROGRESS,
        title: 'Internal task',
        visibility: VISIBILITY.INTERNAL,
      },
      {
        assignee_name: 'Owner C',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-11',
        id: IDS.TASK_DONE,
        project_id: IDS.PROJECT_A,
        sort_order: 3,
        status: TASK_STATUSES.DONE,
        title: 'Done task',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ],
    updates: [
      {
        body: 'Visible update body',
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-08T09:00:00.000Z',
        id: IDS.UPDATE_CLIENT_VISIBLE,
        project_id: IDS.PROJECT_A,
        title: 'Visible update',
        updated_at: '2026-05-08T09:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        body: 'Internal update body',
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-08T10:00:00.000Z',
        id: IDS.UPDATE_INTERNAL,
        project_id: IDS.PROJECT_A,
        title: 'Internal update',
        updated_at: '2026-05-08T10:00:00.000Z',
        visibility: VISIBILITY.INTERNAL,
      },
    ],
    ...overrides,
  }

  return {
    clients: createEntityRepository(data.clients),
    clientWorkItems: createEntityRepository(data.clientWorkItems),
    callBookingMetrics: createEntityRepository(data.callBookingMetrics),
    clinicLocations: createEntityRepository(data.clinicLocations),
    clinicProfiles: createEntityRepository(data.clinicProfiles),
    clinicServiceLines: createEntityRepository(data.clinicServiceLines),
    complianceReviews: createEntityRepository(data.complianceReviews),
    dashboardLinks: createEntityRepository(data.dashboardLinks),
    medicalApprovals: createEntityRepository(data.medicalApprovals),
    neededFromClient: createEntityRepository(data.neededFromClient),
    performanceDashboardPeriods: createEntityRepository(data.performanceDashboardPeriods),
    patientAcquisitionSnapshots: createEntityRepository(data.patientAcquisitionSnapshots),
    projects: createEntityRepository(data.projects),
    reputationSnapshots: createEntityRepository(data.reputationSnapshots),
    reports: createEntityRepository(data.reports),
    tasks: createEntityRepository(data.tasks),
    updates: createEntityRepository(data.updates),
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  }
}

describe('getClientOverview', () => {
  it('returns a safe client overview for the matching client user', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(overview.status).toBe('ready')
    expect(overview.client.id).toBe(IDS.CLIENT_A)
    expect(overview.currentFocus).toEqual(['Campaign optimization', 'Landing page review'])
    expect(overview.activeWorkItems.map((item) => item.title)).toEqual(['Published work item'])
    expect(overview.latestUpdate.title).toBe('Visible update')
    expect(overview.neededActions.map((action) => action.title)).toEqual(['Approve creative batch'])
    expect(overview.dashboard.name).toBe('Active Dashboard')
    expect(overview.isEmpty).toBe(false)
    expect(overview.latestReport.title).toBe('April Summary')
    expect(overview.performancePreview.heroMetric).toMatchObject({
      label: 'Qualified Leads',
      value: 81,
    })
    expect(overview.performancePreview.kpiCards).toHaveLength(3)
  })

  it('adds a clinic control center preview for clinic clients', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        clients: [
          {
            agency_id: IDS.AGENCY,
            current_focus: ['Improve booked appointments'],
            id: IDS.CLIENT_A,
            name: 'Clinic A',
            portal_slug: 'clinic-a',
            primary_contact_email: 'clinic@example.com',
            primary_contact_name: 'Clinic Manager',
            status: CLIENT_STATUSES.NEEDS_ATTENTION,
            type: CLIENT_TYPES.CLINIC,
          },
        ],
        clinicLocations: [
          {
            client_id: IDS.CLIENT_A,
            id: IDS.CLINIC_LOCATION,
            name: 'Main Clinic',
          },
        ],
        clinicProfiles: [
          {
            client_id: IDS.CLIENT_A,
            id: IDS.CLINIC_PROFILE,
            specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
          },
        ],
        clinicServiceLines: [
          {
            client_id: IDS.CLIENT_A,
            id: IDS.CLINIC_SERVICE,
            location_ids: [IDS.CLINIC_LOCATION],
            name: 'Dental Implants',
            status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
          },
        ],
        patientAcquisitionSnapshots: [
          {
            booked_appointments: 14,
            calls: 18,
            channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
            chats: 3,
            client_id: IDS.CLIENT_A,
            forms: 9,
            id: IDS.CLINIC_ACQUISITION,
            location_id: IDS.CLINIC_LOCATION,
            period_start: '2026-05-01',
            publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
            qualified_inquiries: 21,
            service_line_id: IDS.CLINIC_SERVICE,
            spend: 1860,
          },
        ],
        callBookingMetrics: [
          {
            booked_from_calls: 11,
            client_id: IDS.CLIENT_A,
            follow_up_needed_count: 5,
            id: IDS.CLINIC_CALLS,
            missed_calls: 6,
            no_response_leads: 3,
            period_start: '2026-05-01',
            publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
            total_calls: 43,
          },
        ],
        reputationSnapshots: [
          {
            client_id: IDS.CLIENT_A,
            google_rating: 4.7,
            id: IDS.CLINIC_REPUTATION,
            period_start: '2026-05-01',
            publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
            reviews_gained: 18,
            unanswered_reviews: 3,
          },
        ],
        complianceReviews: [
          {
            client_id: IDS.CLIENT_A,
            id: IDS.CLINIC_COMPLIANCE,
            limited_ads: 1,
            open_issues: 2,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
            status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
            title: 'Ad claims review',
          },
        ],
        medicalApprovals: [
          {
            approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
            client_id: IDS.CLIENT_A,
            id: IDS.CLINIC_APPROVAL,
            publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
            status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
            title: 'Implant claim',
          },
        ],
      }),
      viewer: createClientViewer(),
    })

    expect(overview.status).toBe('ready')
    expect(overview.template).toBe(CLIENT_TYPES.CLINIC)
    expect(overview.client.type).toBe(CLIENT_TYPES.CLINIC)
    expect(overview.clinicOverview).toMatchObject({
      actionNeededCount: 1,
      clientId: IDS.CLIENT_A,
      booking: {
        followUpNeededCount: 5,
        missedCalls: 6,
        noResponseLeads: 3,
      },
      compliance: {
        limitedAds: 1,
        openIssues: 2,
        pendingApprovals: 1,
        riskFlaggedReviews: 1,
      },
      patientAcquisition: {
        bookedAppointments: 14,
        costPerBookedAppointment: 1860 / 14,
        inquiries: 30,
        topServiceLine: 'Dental Implants',
        topLocation: 'Main Clinic',
      },
      reputation: {
        googleRating: 4.7,
        reviewsGained: 18,
        unansweredReviews: 3,
      },
    })
  })

  it('denies access when a client user requests another client overview', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(overview).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('denies access when the client does not exist', () => {
    const overview = getClientOverviewPage({
      clientId: '123e4567-e89b-42d3-a456-426614174999',
      repositories: createRepositories(),
      viewer: createClientViewer('123e4567-e89b-42d3-a456-426614174999'),
    })

    expect(overview.status).toBe('error')
    expect(overview.reason).toBe('access_denied')
  })

  it('never returns internal tasks, non-published work items, done work, internal updates, draft dashboards, or draft reports', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    const serializedOverview = JSON.stringify(overview)

    expect(serializedOverview).not.toContain('Internal task')
    expect(serializedOverview).not.toContain('Done task')
    expect(serializedOverview).not.toContain('Draft work item')
    expect(serializedOverview).not.toContain('Ready for review work item')
    expect(serializedOverview).not.toContain('Archived work item')
    expect(serializedOverview).not.toContain('Delivered work item')
    expect(serializedOverview).not.toContain('Internal update')
    expect(serializedOverview).not.toContain('Draft Dashboard')
    expect(serializedOverview).not.toContain('May Draft Summary')
    expect(serializedOverview).not.toContain('May Draft Performance')
  })

  it('does not treat task visibility or waiting-client status as client-facing active work', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        clientWorkItems: [],
        tasks: [
          {
            assignee_name: 'Mia Carter',
            client_id: IDS.CLIENT_A,
            client_safe_summary: 'Task summary should remain only a proposal.',
            client_visible: true,
            due_date: '2026-05-20',
            id: IDS.TASK_CLIENT_VISIBLE,
            project_id: IDS.PROJECT_A,
            status: TASK_STATUSES.WAITING_CLIENT,
            title: 'Waiting-client task marked visible',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
      }),
      viewer: createClientViewer(),
    })

    expect(overview.status).toBe('ready')
    expect(overview.activeWorkItems).toEqual([])
    expect(JSON.stringify(overview)).not.toContain('Waiting-client task marked visible')
  })

  it('returns empty-state-safe values when optional overview records are missing', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        clientWorkItems: [],
        dashboardLinks: [],
        neededFromClient: [],
        performanceDashboardPeriods: [],
        projects: [],
        reports: [],
        tasks: [],
        updates: [],
        clients: [
          {
            agency_id: IDS.AGENCY,
            current_focus: [],
            id: IDS.CLIENT_A,
            name: 'Client A',
            portal_slug: 'client-a',
            primary_contact_email: 'client-a@example.com',
            primary_contact_name: 'Client A Contact',
            status: CLIENT_STATUSES.ON_TRACK,
          },
        ],
      }),
      viewer: createClientViewer(),
    })

    expect(overview.status).toBe('ready')
    expect(overview.activeWorkItems).toEqual([])
    expect(overview.dashboard).toBeNull()
    expect(overview.latestReport).toBeNull()
    expect(overview.latestUpdate).toBeNull()
    expect(overview.neededActions).toEqual([])
    expect(overview.progressSummary).toEqual([])
    expect(overview.isEmpty).toBe(true)
  })

  it('maps unavailable dashboards as visible but unavailable', () => {
    const overview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        dashboardLinks: [
          {
            client_id: IDS.CLIENT_A,
            fallback_message: 'Dashboard is temporarily unavailable.',
            id: IDS.DASHBOARD_UNAVAILABLE,
            name: 'Unavailable Dashboard',
            provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
            public_url: 'https://example.com/dashboard',
            show_on_overview: true,
            status: DASHBOARD_LINK_STATUSES.UNAVAILABLE,
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
      }),
      viewer: createClientViewer(),
    })

    expect(overview.dashboard).toMatchObject({
      fallbackMessage: 'Dashboard is temporarily unavailable.',
      isAvailable: false,
      name: 'Unavailable Dashboard',
      status: DASHBOARD_LINK_STATUSES.UNAVAILABLE,
    })
  })

  it('keeps draft overview data hidden from client users but available to admin preview', () => {
    const repositories = createRepositories({
      clients: [
        {
          agency_id: IDS.AGENCY,
          current_focus: ['Published focus'],
          id: IDS.CLIENT_A,
          name: 'Client A',
          overview_draft: {
            client: {
              status: CLIENT_STATUSES.WAITING_CLIENT,
            },
            currentFocus: ['Draft focus'],
            dashboardLinks: [],
            projects: [
              {
                client_id: IDS.CLIENT_A,
                id: IDS.PROJECT_A,
                name: 'Draft Project',
                progress_percent: 10,
              },
            ],
            reports: [],
            updates: [],
          },
          portal_slug: 'client-a',
          primary_contact_email: 'client-a@example.com',
          primary_contact_name: 'Client A Contact',
          status: CLIENT_STATUSES.ON_TRACK,
        },
      ],
    })

    const publishedOverview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })
    const draftPreview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createAdminViewer(),
    })
    const deniedDraftPreview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createClientViewer(),
    })

    expect(publishedOverview.client.status).toBe(CLIENT_STATUSES.ON_TRACK)
    expect(publishedOverview.currentFocus).toEqual(['Published focus'])
    expect(draftPreview.client.status).toBe(CLIENT_STATUSES.WAITING_CLIENT)
    expect(draftPreview.currentFocus).toEqual(['Draft focus'])
    expect(draftPreview.progressSummary.map((project) => project.name)).toEqual(['Draft Project'])
    expect(deniedDraftPreview).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('reads published preview from the published snapshot instead of current draft or live edits', () => {
    const repositories = createRepositories({
      clients: [
        {
          agency_id: IDS.AGENCY,
          current_focus: ['Live mutable focus'],
          id: IDS.CLIENT_A,
          name: 'Client A',
          overview_draft: {
            client: {
              status: CLIENT_STATUSES.WAITING_CLIENT,
            },
            currentFocus: ['Draft focus'],
            dashboardLinks: [],
            projects: [],
            reports: [],
            updates: [],
          },
          overview_published_snapshot: {
            client: {
              status: CLIENT_STATUSES.ON_TRACK,
            },
            currentFocus: ['Published snapshot focus'],
            dashboardLinks: [],
            projects: [
              {
                client_id: IDS.CLIENT_A,
                id: IDS.PROJECT_A,
                name: 'Published Snapshot Project',
                progress_percent: 70,
              },
            ],
            reports: [],
            updates: [],
          },
          portal_slug: 'client-a',
          primary_contact_email: 'client-a@example.com',
          primary_contact_name: 'Client A Contact',
          status: CLIENT_STATUSES.NEEDS_ATTENTION,
        },
      ],
    })

    const publishedPreview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'published',
      viewer: createAdminViewer(),
    })
    const draftPreview = getClientOverviewPage({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createAdminViewer(),
    })

    expect(publishedPreview.client.status).toBe(CLIENT_STATUSES.ON_TRACK)
    expect(publishedPreview.currentFocus).toEqual(['Published snapshot focus'])
    expect(publishedPreview.progressSummary.map((project) => project.name)).toEqual(['Published Snapshot Project'])
    expect(publishedPreview.activeWorkItems.map((item) => item.title)).toEqual(['Published work item'])
    expect(publishedPreview.neededActions.map((action) => action.title)).toEqual(['Approve creative batch'])
    expect(draftPreview.client.status).toBe(CLIENT_STATUSES.WAITING_CLIENT)
    expect(draftPreview.currentFocus).toEqual(['Draft focus'])
    expect(draftPreview.activeWorkItems.map((item) => item.title)).toEqual(['Published work item'])
    expect(draftPreview.neededActions.map((action) => action.title)).toEqual(['Approve creative batch'])
  })
})
