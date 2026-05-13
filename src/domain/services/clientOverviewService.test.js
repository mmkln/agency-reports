import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { getClientOverview } from './clientOverviewService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  DASHBOARD_ACTIVE: '44444444-4444-4444-8444-444444444444',
  DASHBOARD_DRAFT: '55555555-5555-4555-8555-555555555555',
  DASHBOARD_UNAVAILABLE: '66666666-6666-4666-8666-666666666666',
  PROJECT_A: '77777777-7777-4777-8777-777777777777',
  PROJECT_B: '88888888-8888-4888-8888-888888888888',
  REPORT_DRAFT: '99999999-9999-4999-8999-999999999999',
  REPORT_OLD: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  REPORT_PUBLISHED: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  TASK_CLIENT_VISIBLE: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  TASK_DONE: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  TASK_INTERNAL: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  UPDATE_CLIENT_VISIBLE: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  UPDATE_INTERNAL: '123e4567-e89b-42d3-a456-426614174000',
})

function createEntityRepository(records) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
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
    dashboardLinks: createEntityRepository(data.dashboardLinks),
    neededFromClient: createEntityRepository(data.neededFromClient),
    projects: createEntityRepository(data.projects),
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
    const overview = getClientOverview({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(overview.status).toBe('ready')
    expect(overview.client.id).toBe(IDS.CLIENT_A)
    expect(overview.currentFocus).toEqual(['Campaign optimization', 'Landing page review'])
    expect(overview.activeTasks.map((task) => task.title)).toEqual(['Visible task'])
    expect(overview.latestUpdate.title).toBe('Visible update')
    expect(overview.neededActions.map((action) => action.title)).toEqual(['Approve creative batch'])
    expect(overview.dashboard.name).toBe('Active Dashboard')
    expect(overview.isEmpty).toBe(false)
    expect(overview.latestReport.title).toBe('April Summary')
  })

  it('denies access when a client user requests another client overview', () => {
    const overview = getClientOverview({
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
    const overview = getClientOverview({
      clientId: '123e4567-e89b-42d3-a456-426614174999',
      repositories: createRepositories(),
      viewer: createClientViewer('123e4567-e89b-42d3-a456-426614174999'),
    })

    expect(overview.status).toBe('error')
    expect(overview.reason).toBe('access_denied')
  })

  it('never returns internal tasks, done tasks, internal updates, draft dashboards, or draft reports', () => {
    const overview = getClientOverview({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    const serializedOverview = JSON.stringify(overview)

    expect(serializedOverview).not.toContain('Internal task')
    expect(serializedOverview).not.toContain('Done task')
    expect(serializedOverview).not.toContain('Internal update')
    expect(serializedOverview).not.toContain('Draft Dashboard')
    expect(serializedOverview).not.toContain('May Draft Summary')
  })

  it('returns empty-state-safe values when optional overview records are missing', () => {
    const overview = getClientOverview({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        dashboardLinks: [],
        neededFromClient: [],
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
    expect(overview.activeTasks).toEqual([])
    expect(overview.dashboard).toBeNull()
    expect(overview.latestReport).toBeNull()
    expect(overview.latestUpdate).toBeNull()
    expect(overview.neededActions).toEqual([])
    expect(overview.progressSummary).toEqual([])
    expect(overview.isEmpty).toBe(true)
  })

  it('maps unavailable dashboards as visible but unavailable', () => {
    const overview = getClientOverview({
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
            neededActions: [],
            projects: [
              {
                client_id: IDS.CLIENT_A,
                id: IDS.PROJECT_A,
                name: 'Draft Project',
                progress_percent: 10,
              },
            ],
            reports: [],
            tasks: [],
            updates: [],
          },
          portal_slug: 'client-a',
          primary_contact_email: 'client-a@example.com',
          primary_contact_name: 'Client A Contact',
          status: CLIENT_STATUSES.ON_TRACK,
        },
      ],
    })

    const publishedOverview = getClientOverview({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })
    const draftPreview = getClientOverview({
      clientId: IDS.CLIENT_A,
      repositories,
      source: 'draft',
      viewer: createAdminViewer(),
    })
    const deniedDraftPreview = getClientOverview({
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
})
