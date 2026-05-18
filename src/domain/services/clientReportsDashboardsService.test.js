import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
} from '../../entities/performance-dashboard'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { VISIBILITY } from '../../entities/update'
import { getClientReportsDashboardsPage } from './clientReportsDashboardsService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  DASHBOARD_ACTIVE: '33333333-3333-4333-8333-333333333333',
  DASHBOARD_DRAFT: '44444444-4444-4444-8444-444444444444',
  PERIOD_DRAFT: '55555555-5555-4555-8555-555555555555',
  PERIOD_PUBLISHED: '66666666-6666-4666-8666-666666666666',
  REPORT_PUBLISHED: '77777777-7777-4777-8777-777777777777',
})

function createEntityRepository(records = []) {
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
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        status: CLIENT_STATUSES.ON_TRACK,
      },
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        status: CLIENT_STATUSES.ON_TRACK,
      },
    ]),
    dashboardLinks: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        embed_url: 'https://example.com/embed',
        id: IDS.DASHBOARD_ACTIVE,
        name: 'Live Looker Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/dashboard',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        embed_url: 'https://example.com/draft',
        id: IDS.DASHBOARD_DRAFT,
        name: 'Draft Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/draft',
        status: DASHBOARD_LINK_STATUSES.DRAFT,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
    neededFromClient: createEntityRepository([]),
    performanceDashboardPeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Published dashboard narrative.',
          },
          hero_metric: {
            label: 'Qualified Leads',
            value: 42,
          },
          kpi_cards: [],
        },
        attribution_note: 'Manual report compiled from CRM and ad exports.',
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERIOD_PUBLISHED,
        last_updated_at: '2026-05-16T09:00:00.000Z',
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
        source_summary: 'CRM export, ad platform exports, and Looker Studio.',
        title: 'April Performance',
      },
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Draft dashboard narrative.',
          },
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.ESTIMATED,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERIOD_DRAFT,
        last_updated_at: '2026-05-17T09:00:00.000Z',
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
        title: 'May Draft Performance',
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_PUBLISHED,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
      status: REPORT_STATUSES.PUBLISHED,
        summary: 'April report summary.',
        title: 'April Report',
      },
    ]),
    tasks: createEntityRepository([]),
    updates: createEntityRepository([]),
    ...overrides,
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
  }
}

function createAdminViewer(agencyId = 'agency-a') {
  return {
    agencyId,
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

describe('getClientReportsDashboardsPage', () => {
  it('composes current performance, source dashboard, and report archive for clients', () => {
    const page = getClientReportsDashboardsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.client).toMatchObject({
      id: IDS.CLIENT_A,
      name: 'Client A',
    })
    expect(page.copy).toMatchObject({
      pageTitle: 'Reports & Dashboards',
      trustTitle: 'Data Trust Context',
    })
    expect(page.template).toBe(CLIENT_TYPES.GENERIC)
    expect(page.performancePage.performanceDashboard).toMatchObject({
      id: IDS.PERIOD_PUBLISHED,
      title: 'April Performance',
    })
    expect(page.dashboardPage.dashboard).toMatchObject({
      id: IDS.DASHBOARD_ACTIVE,
      name: 'Live Looker Dashboard',
    })
    expect(page.reportsPage.reports.map((report) => report.title)).toEqual(['April Report'])
    expect(page.trustContext).toMatchObject({
      attributionNote: 'Manual report compiled from CRM and ad exports.',
      dataConfidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
      dataMode: PERFORMANCE_DATA_MODES.MANUAL,
      latestReport: {
        id: IDS.REPORT_PUBLISHED,
      },
      performancePeriod: {
        id: IDS.PERIOD_PUBLISHED,
      },
      sourceDashboard: {
        id: IDS.DASHBOARD_ACTIVE,
      },
      sourceSummary: 'CRM export, ad platform exports, and Looker Studio.',
    })
    expect(page.trustContext.caveats.map((caveat) => caveat.id)).toEqual([
      'source-summary',
      'attribution',
    ])
    expect(JSON.stringify(page)).not.toContain('Draft Dashboard')
    expect(JSON.stringify(page)).not.toContain('May Draft Performance')
  })

  it('uses clinic results copy for clinic clients', () => {
    const page = getClientReportsDashboardsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        clients: createEntityRepository([
          {
            agency_id: 'agency-a',
            id: IDS.CLIENT_A,
            name: 'Clinic A',
            portal_slug: 'clinic-a',
            status: CLIENT_STATUSES.ON_TRACK,
            type: CLIENT_TYPES.CLINIC,
          },
        ]),
      }),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.template).toBe(CLIENT_TYPES.CLINIC)
    expect(page.copy).toMatchObject({
      headerEyebrow: 'Clinic results hub',
      pageTitle: 'Clinic Results',
      selectedReportTitle: 'Clinic growth report',
      trustTitle: 'Clinic Data Trust',
    })
    expect(page.trustContext.copy).toMatchObject({
      title: 'Clinic Data Trust',
    })
  })

  it('surfaces stale and low-confidence trust context without using hidden draft analytics', () => {
    const page = getClientReportsDashboardsPage({
      clientId: IDS.CLIENT_A,
      now: () => new Date('2026-06-10T09:00:00.000Z'),
      repositories: createRepositories({
        performanceDashboardPeriods: createEntityRepository([
          {
            attribution_note: 'Directional estimate only.',
            client_id: IDS.CLIENT_A,
            content: {
              executive_summary: {
                narrative: 'Published low confidence dashboard narrative.',
              },
              hero_metric: {
                label: 'Qualified Leads',
                value: 42,
              },
              kpi_cards: [],
            },
            data_confidence: PERFORMANCE_DATA_CONFIDENCE.LOW,
            data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
            id: IDS.PERIOD_PUBLISHED,
            last_updated_at: '2026-05-16T09:00:00.000Z',
            period_end: '2026-04-30',
            period_start: '2026-04-01',
            status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
            title: 'April Performance',
          },
          {
            client_id: IDS.CLIENT_A,
            content: {
              executive_summary: {
                narrative: 'Hidden draft should not affect trust context.',
              },
            },
            data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
            data_mode: PERFORMANCE_DATA_MODES.INTEGRATION,
            id: IDS.PERIOD_DRAFT,
            last_updated_at: '2026-06-09T09:00:00.000Z',
            period_end: '2026-05-31',
            period_start: '2026-05-01',
            status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
            title: 'May Draft Performance',
          },
        ]),
      }),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.trustContext.dataFreshness).toMatchObject({
      ageDays: 25,
      isStale: true,
    })
    expect(page.trustContext.dataConfidenceMeta).toMatchObject({
      label: 'Low confidence',
    })
    expect(page.trustContext.dataModeMeta).toMatchObject({
      label: 'JSON Import',
    })
    expect(page.trustContext.performancePeriod).toMatchObject({
      id: IDS.PERIOD_PUBLISHED,
    })
    expect(JSON.stringify(page.trustContext)).not.toContain('May Draft Performance')
    expect(JSON.stringify(page.trustContext)).not.toContain('Integration')
  })

  it('keeps draft analytics available only in admin preview mode', () => {
    const page = getClientReportsDashboardsPage({
      clientId: IDS.CLIENT_A,
      dashboardId: IDS.DASHBOARD_DRAFT,
      mode: 'admin_preview',
      performancePeriodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.performancePage.performanceDashboard).toMatchObject({
      id: IDS.PERIOD_DRAFT,
      title: 'May Draft Performance',
    })
    expect(page.dashboardPage.dashboard).toMatchObject({
      id: IDS.DASHBOARD_DRAFT,
      name: 'Draft Dashboard',
    })
  })

  it('denies cross-client access', () => {
    const page = getClientReportsDashboardsPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })
})
