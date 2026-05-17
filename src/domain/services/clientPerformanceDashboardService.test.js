import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import {
  NEEDED_ACTION_STATUSES,
} from '../../entities/needed-from-client'
import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
} from '../../entities/performance-dashboard'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { VISIBILITY } from '../../entities/update'
import {
  getClientPerformanceDashboardPage,
  getClientPerformanceOverviewPreview,
} from './clientPerformanceDashboardService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  DASHBOARD: '33333333-3333-4333-8333-333333333333',
  NEEDED_ACTIVE: '44444444-4444-4444-8444-444444444444',
  NEEDED_CANCELLED: '55555555-5555-4555-8555-555555555555',
  PERIOD_ARCHIVED: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  PERIOD_DRAFT: '66666666-6666-4666-8666-666666666666',
  PERIOD_PUBLISHED: '77777777-7777-4777-8777-777777777777',
  REPORT: '88888888-8888-4888-8888-888888888888',
  TASK_DONE: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  TASK_INTERNAL: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  TASK_ACTIVE: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  WORK_DONE: '12121212-1212-4212-8212-121212121212',
  WORK_DRAFT: '34343434-3434-4434-8434-343434343434',
  WORK_ACTIVE: '56565656-5656-4565-8565-565656565656',
  UPDATE_CLIENT_VISIBLE: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  UPDATE_INTERNAL: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  USER_CLIENT: '99999999-9999-4999-8999-999999999999',
})

function createEntityRepository(records) {
  const items = [...records]

  return {
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
      items.push(record)
      return record
    },
  }
}

function createRepositories() {
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
        id: IDS.DASHBOARD,
        name: 'Looker Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/dashboard',
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_DONE,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        status: CLIENT_WORK_ITEM_STATUSES.DELIVERED,
        title: 'Launch first campaign structure',
        updated_at: '2026-05-01T10:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_ACTIVE,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        title: 'Monitor CPL stability',
        updated_at: '2026-05-03T10:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_DRAFT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        title: 'Draft client work item',
        updated_at: '2026-05-04T10:00:00.000Z',
      },
    ]),
    neededFromClient: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        description: 'Approve the next creative batch.',
        due_date: '2026-05-12',
        id: IDS.NEEDED_ACTIVE,
        related_link: '',
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creative batch',
      },
      {
        client_id: IDS.CLIENT_A,
        description: 'Cancelled item',
        due_date: '2026-05-12',
        id: IDS.NEEDED_CANCELLED,
        status: NEEDED_ACTION_STATUSES.CANCELLED,
        title: 'Cancelled request',
      },
    ]),
    performanceDashboardPeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Published dashboard narrative',
          },
          hero_metric: {
            label: 'Qualified Leads',
            value: 81,
          },
          kpi_cards: [
            {
              name: 'Qualified Leads',
              value: 81,
            },
            {
              name: 'Revenue',
              value: 73200,
            },
            {
              name: 'CPL',
              value: 73.46,
            },
            {
              name: 'Extra',
              value: 1,
            },
          ],
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERIOD_PUBLISHED,
        last_updated_at: '2026-05-01T09:00:00.000Z',
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-02T09:00:00.000Z',
        status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
        title: 'April Dashboard',
      },
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Archived dashboard narrative',
          },
          hero_metric: {
            label: 'Booked Calls',
            value: 34,
          },
          kpi_cards: [
            {
              name: 'Booked Calls',
              value: 34,
            },
          ],
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
        data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
        id: IDS.PERIOD_ARCHIVED,
        last_updated_at: '2026-04-01T09:00:00.000Z',
        period_end: '2026-03-31',
        period_start: '2026-03-01',
        published_at: '2026-04-02T09:00:00.000Z',
        status: PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
        title: 'March Dashboard',
      },
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: 'Draft dashboard narrative',
          },
        },
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.ESTIMATED,
        data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
        id: IDS.PERIOD_DRAFT,
        last_updated_at: '2026-05-08T09:00:00.000Z',
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
        title: 'May Draft',
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-03T09:00:00.000Z',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'April report summary',
        title: 'April Report',
      },
    ]),
    tasks: createEntityRepository([
      {
        assignee_name: 'Agency Strategist',
        client_id: IDS.CLIENT_A,
        id: IDS.TASK_DONE,
        status: 'done',
        title: 'Launch first campaign structure',
        updated_at: '2026-05-01T10:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        assignee_name: 'Agency Analyst',
        client_id: IDS.CLIENT_A,
        id: IDS.TASK_ACTIVE,
        status: 'in_progress',
        title: 'Monitor CPL stability',
        updated_at: '2026-05-03T10:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        assignee_name: 'Internal Team',
        client_id: IDS.CLIENT_A,
        id: IDS.TASK_INTERNAL,
        status: 'done',
        title: 'Debug internal attribution issue',
        updated_at: '2026-05-02T10:00:00.000Z',
        visibility: VISIBILITY.INTERNAL,
      },
    ]),
    updates: createEntityRepository([
      {
        body: 'We launched the first campaign structure and connected the tracking baseline.',
        client_id: IDS.CLIENT_A,
        id: IDS.UPDATE_CLIENT_VISIBLE,
        title: 'Weekly performance update',
        updated_at: '2026-05-04T10:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        body: 'Internal attribution issue is under review.',
        client_id: IDS.CLIENT_A,
        id: IDS.UPDATE_INTERNAL,
        title: 'Internal update',
        updated_at: '2026-05-04T09:00:00.000Z',
        visibility: VISIBILITY.INTERNAL,
      },
    ]),
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER_CLIENT,
  }
}

describe('clientPerformanceDashboardService', () => {
  it('returns the latest published dashboard with source links, report, and active needed actions', () => {
    const page = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.performanceDashboard).toMatchObject({
      id: IDS.PERIOD_PUBLISHED,
      title: 'April Dashboard',
    })
    expect(page.sourceLinks).toHaveLength(1)
    expect(page.latestReport.title).toBe('April Report')
    expect(page.neededFromClient.map((item) => item.title)).toEqual(['Approve creative batch'])
    expect(page.workSummary.completedWorkItems.map((item) => item.title)).toEqual(['Launch first campaign structure'])
    expect(page.workSummary.completedTasks.map((task) => task.title)).toEqual(['Launch first campaign structure'])
    expect(page.workSummary.activeWorkItems.map((item) => item.title)).toEqual(['Monitor CPL stability'])
    expect(page.workSummary.activeTasks.map((task) => task.title)).toEqual(['Monitor CPL stability'])
    expect(page.workSummary.recentUpdates.map((update) => update.title)).toEqual(['Weekly performance update'])
    expect(page.periods.map((period) => period.id)).toEqual([
      IDS.PERIOD_PUBLISHED,
      IDS.PERIOD_ARCHIVED,
    ])
    expect(JSON.stringify(page)).not.toContain('May Draft')
    expect(JSON.stringify(page)).not.toContain('Draft client work item')
    expect(JSON.stringify(page)).not.toContain('Cancelled request')
    expect(JSON.stringify(page)).not.toContain('Internal update')
    expect(JSON.stringify(page)).not.toContain('Debug internal attribution issue')
  })

  it('allows a client to open an archived dashboard period for their own client', () => {
    const page = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      now: () => new Date('2026-05-16T09:00:00.000Z'),
      periodId: IDS.PERIOD_ARCHIVED,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.performanceDashboard).toMatchObject({
      id: IDS.PERIOD_ARCHIVED,
      status: PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
      title: 'March Dashboard',
    })
    expect(page.performanceDashboard.freshness).toMatchObject({
      ageDays: 45,
      isStale: true,
    })
  })

  it('denies access to another client dashboard', () => {
    const page = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_B),
    })

    expect(page).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('returns not found when a client requests a hidden draft by id', () => {
    const page = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page).toMatchObject({
      performanceDashboard: null,
      reason: 'performance_dashboard_not_found',
      status: 'ready',
    })
  })

  it('allows admin preview mode to read draft periods for owned clients', () => {
    const page = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      mode: 'admin_preview',
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      viewer: {
        agencyId: 'agency-a',
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin',
      },
    })

    expect(page.performanceDashboard).toMatchObject({
      id: IDS.PERIOD_DRAFT,
      title: 'May Draft',
    })
  })

  it('returns a compact overview preview with hero metric and at most three KPI cards', () => {
    const preview = getClientPerformanceOverviewPreview({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(preview.status).toBe('ready')
    expect(preview.performanceDashboard.heroMetric).toMatchObject({
      label: 'Qualified Leads',
      value: 81,
    })
    expect(preview.performanceDashboard.kpiCards).toHaveLength(3)
  })
})
