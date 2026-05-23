import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import {
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
  PERFORMANCE_METRIC_STATUSES,
} from '../../entities/performance-dashboard'
import {
  createAgencyAccessViewer,
  createWorkspaceAccessViewer,
} from '../test/accessViewerTestHelpers'
import {
  duplicateAdminPerformanceDashboardPeriod,
  importAdminPerformanceDashboardJson,
  listAdminPerformanceDashboardPeriods,
  publishAdminPerformanceDashboardPeriod,
  saveAdminPerformanceDashboardPeriod,
  updateAdminPerformanceDashboardPeriodStatus,
} from './adminPerformanceDashboardService'
import { getClientPerformanceDashboardPage } from './clientPerformanceDashboardService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  PERIOD_DRAFT: '44444444-4444-4444-8444-444444444444',
  PERIOD_NEW: '55555555-5555-4555-8555-555555555555',
  PERIOD_PUBLISHED: '66666666-6666-4666-8666-666666666666',
  USER_ADMIN: '77777777-7777-4777-8777-777777777777',
  USER_CLIENT: '88888888-8888-4888-8888-888888888888',
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
    listByWorkspaceId(clientId) {
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

function createValidContent() {
  return {
    channel_breakdown: [],
    executive_summary: {
      main_issue: 'Lead quality needs tightening.',
      main_win: 'Qualified leads increased.',
      narrative: 'Marketing produced more qualified opportunities this period.',
      next_focus: 'Improve qualification before scaling.',
    },
    hero_metric: {
      label: 'Qualified Leads',
      source: 'CRM export',
      status: PERFORMANCE_METRIC_STATUSES.AHEAD,
      value: 81,
    },
    insights: [
      {
        body: 'Search generated higher-quality appointment requests.',
        title: 'Search quality improved',
      },
    ],
    kpi_cards: [
      {
        definition: 'Sales-approved leads.',
        name: 'Qualified Leads',
        source: 'CRM export',
        value: 81,
      },
    ],
    next_steps: [
      {
        owner: 'Agency',
        title: 'Tighten Meta lead qualification',
      },
    ],
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
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        status: CLIENT_STATUSES.ON_TRACK,
      },
    ]),
    dashboardLinks: createEntityRepository([]),
    neededFromClient: createEntityRepository([]),
    performanceDashboardPeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        content: createValidContent(),
        created_at: '2026-05-01T09:00:00.000Z',
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        data_mode: PERFORMANCE_DATA_MODES.MANUAL,
        id: IDS.PERIOD_PUBLISHED,
        last_updated_at: '2026-05-01T09:00:00.000Z',
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-02T09:00:00.000Z',
        status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
        title: 'April Dashboard',
        updated_at: '2026-05-02T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        content: {
          executive_summary: {
            narrative: '',
          },
        },
        created_at: '2026-05-08T09:00:00.000Z',
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.ESTIMATED,
        data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
        id: IDS.PERIOD_DRAFT,
        last_updated_at: '',
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        published_at: null,
        status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
        title: 'May Draft',
        updated_at: '2026-05-08T09:00:00.000Z',
      },
    ]),
    reports: createEntityRepository([]),
  }
}

function createAdminViewer() {
  return createAgencyAccessViewer({
    agencyId: IDS.AGENCY,
    managedWorkspaceIds: [IDS.CLIENT_A, IDS.CLIENT_B],
    userId: IDS.USER_ADMIN,
  })
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return createWorkspaceAccessViewer({
    userId: IDS.USER_CLIENT,
    workspaceId: clientId,
  })
}

describe('adminPerformanceDashboardService', () => {
  it('lists performance dashboard periods for agency-owned clients', () => {
    const rows = listAdminPerformanceDashboardPeriods({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
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

  it('creates a draft hidden from client dashboard pages', () => {
    const repositories = createRepositories()
    const period = saveAdminPerformanceDashboardPeriod({
      idGenerator: () => IDS.PERIOD_NEW,
      input: {
        clientId: IDS.CLIENT_A,
        content: createValidContent(),
        dataConfidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        dataMode: PERFORMANCE_DATA_MODES.MANUAL,
        lastUpdatedAt: '2026-06-01T09:00:00.000Z',
        periodEnd: '2026-06-30',
        periodStart: '2026-06-01',
        status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
        title: 'June Dashboard',
      },
      now: () => '2026-06-01T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(period.status).toBe(PERFORMANCE_DASHBOARD_STATUSES.DRAFT)
    expect(JSON.stringify(clientPage)).not.toContain('June Dashboard')
  })

  it('blocks publishing incomplete performance dashboards', () => {
    expect(() => publishAdminPerformanceDashboardPeriod({
      now: () => '2026-05-09T09:00:00.000Z',
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('not publishable')
  })

  it('publishes a complete draft and makes it visible to clients', () => {
    const repositories = createRepositories()

    saveAdminPerformanceDashboardPeriod({
      idGenerator: () => IDS.PERIOD_DRAFT,
      input: {
        id: IDS.PERIOD_DRAFT,
        content: createValidContent(),
        dataConfidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        lastUpdatedAt: '2026-05-09T09:00:00.000Z',
        title: 'May Draft',
      },
      now: () => '2026-05-09T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    const published = publishAdminPerformanceDashboardPeriod({
      now: () => '2026-05-10T09:00:00.000Z',
      periodId: IDS.PERIOD_DRAFT,
      repositories,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      periodId: IDS.PERIOD_DRAFT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(published.status).toBe(PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED)
    expect(published.publishedAt).toBe('2026-05-10T09:00:00.000Z')
    expect(clientPage.performanceDashboard.title).toBe('May Draft')
  })

  it('archives a published dashboard period and keeps it client-visible', () => {
    const repositories = createRepositories()

    const archived = updateAdminPerformanceDashboardPeriodStatus({
      now: () => '2026-05-11T09:00:00.000Z',
      periodId: IDS.PERIOD_PUBLISHED,
      repositories,
      status: PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientPerformanceDashboardPage({
      clientId: IDS.CLIENT_A,
      periodId: IDS.PERIOD_PUBLISHED,
      repositories,
      viewer: createClientViewer(),
    })

    expect(archived.status).toBe(PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED)
    expect(clientPage.performanceDashboard.title).toBe('April Dashboard')
  })

  it('duplicates an existing period as a new draft', () => {
    const repositories = createRepositories()

    const duplicate = duplicateAdminPerformanceDashboardPeriod({
      idGenerator: () => IDS.PERIOD_NEW,
      now: () => '2026-05-12T09:00:00.000Z',
      periodId: IDS.PERIOD_PUBLISHED,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(duplicate).toMatchObject({
      id: IDS.PERIOD_NEW,
      publishedAt: null,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title: 'Copy of April Dashboard',
    })
  })

  it('imports valid JSON as a draft without auto-publishing', () => {
    const repositories = createRepositories()
    const result = importAdminPerformanceDashboardJson({
      idGenerator: () => IDS.PERIOD_NEW,
      rawJson: JSON.stringify({
        client_id: IDS.CLIENT_A,
        content: createValidContent(),
        data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
        last_updated_at: '2026-06-01T09:00:00.000Z',
        period_end: '2026-06-30',
        period_start: '2026-06-01',
        title: 'June Imported Dashboard',
      }),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.isValid).toBe(true)
    expect(result.period).toMatchObject({
      dataMode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title: 'June Imported Dashboard',
    })
  })

  it('does not persist invalid JSON imports', () => {
    const repositories = createRepositories()
    const beforeCount = repositories.performanceDashboardPeriods.list().length
    const result = importAdminPerformanceDashboardJson({
      idGenerator: () => IDS.PERIOD_NEW,
      rawJson: '{broken',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.isValid).toBe(false)
    expect(repositories.performanceDashboardPeriods.list()).toHaveLength(beforeCount)
  })
})
