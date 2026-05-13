import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import {
  discardAdminClientOverviewDraft,
  getAdminClientOverviewEditor,
  publishAdminClientOverview,
  saveAdminClientOverview,
} from './adminOverviewService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  DASHBOARD_A: '55555555-5555-4555-8555-555555555555',
  NEW_NEEDED_ACTION: '123e4567-e89b-42d3-a456-426614174000',
  NEW_PROJECT: '66666666-6666-4666-8666-666666666666',
  NEW_TASK: '77777777-7777-4777-8777-777777777777',
  PROJECT_A: '88888888-8888-4888-8888-888888888888',
  REPORT_A: '99999999-9999-4999-8999-999999999999',
  UPDATE_A: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
})

function createEntityRepository(initialRecords = []) {
  const records = initialRecords.map((record) => ({ ...record }))

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

function createRepositories() {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY_A,
        current_focus: ['Campaign launch'],
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        primary_contact_email: 'client@example.com',
        primary_contact_name: 'Client Contact',
        status: CLIENT_STATUSES.ON_TRACK,
        updated_at: '2026-05-01T09:00:00.000Z',
      },
      {
        agency_id: IDS.AGENCY_B,
        current_focus: [],
        id: IDS.CLIENT_B,
        name: 'Client B',
        status: CLIENT_STATUSES.PAUSED,
      },
    ]),
    dashboardLinks: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.DASHBOARD_A,
        name: 'Dashboard A',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/dashboard',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
    neededFromClient: createEntityRepository([]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        description: 'Existing project',
        id: IDS.PROJECT_A,
        name: 'Project A',
        progress_percent: 20,
        status: 'in_progress',
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.REPORT_A,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'April summary',
        title: 'April Report',
      },
    ]),
    tasks: createEntityRepository([]),
    updates: createEntityRepository([
      {
        body: 'Existing update',
        client_id: IDS.CLIENT_A,
        id: IDS.UPDATE_A,
        title: 'Weekly update',
        updated_at: '2026-05-01T09:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    agencyId,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  }
}

describe('adminOverviewService', () => {
  it('returns all editable overview records for an agency admin', () => {
    const editor = getAdminClientOverviewEditor({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(editor.status).toBe('ready')
    expect(editor.client.name).toBe('Client A')
    expect(editor.currentFocus).toEqual(['Campaign launch'])
    expect(editor.projects).toHaveLength(1)
    expect(editor.dashboardLinks).toHaveLength(1)
    expect(editor.reports).toHaveLength(1)
    expect(editor.updates).toHaveLength(1)
  })

  it('denies editing clients outside the admin agency', () => {
    expect(() => getAdminClientOverviewEditor({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Client overview is not available for this admin.')
  })

  it('saves client status, focus, and new overview records into a draft only', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.NEW_PROJECT, IDS.NEW_TASK, IDS.NEW_NEEDED_ACTION]

    const editor = saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        client: {
          status: CLIENT_STATUSES.WAITING_CLIENT,
        },
        currentFocus: ['Approve creative batch', '  ', 'Budget review', 'Ignored fourth item'],
        dashboardLinks: [],
        neededActions: [
          {
            due_date: '2026-05-12',
            status: NEEDED_ACTION_STATUSES.PENDING,
            title: 'Approve creative batch',
          },
        ],
        projects: [
          {
            name: 'New Project',
            progress_percent: 126,
            status: 'in_progress',
          },
        ],
        reports: [],
        tasks: [
          {
            assignee_name: 'Team',
            status: TASK_STATUSES.IN_PROGRESS,
            title: 'Visible task',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
        updates: [],
      },
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    const client = repositories.clients.findById(IDS.CLIENT_A)

    expect(client.status).toBe(CLIENT_STATUSES.ON_TRACK)
    expect(client.current_focus).toEqual(['Campaign launch'])
    expect(client.overview_draft_saved_at).toBe('2026-05-09T10:00:00.000Z')
    expect(client.overview_draft).toMatchObject({
      client: {
        status: CLIENT_STATUSES.WAITING_CLIENT,
      },
    })
    expect(editor.client.hasDraft).toBe(true)
    expect(editor.client.status).toBe(CLIENT_STATUSES.WAITING_CLIENT)
    expect(editor.currentFocus).toEqual(['Approve creative batch', 'Budget review', 'Ignored fourth item'])
    expect(editor.projects.find((project) => project.id === IDS.NEW_PROJECT)).toMatchObject({
      progress_percent: 100,
      name: 'New Project',
    })
    expect(editor.tasks.find((task) => task.id === IDS.NEW_TASK)).toMatchObject({
      assignee_name: 'Team',
      client_visible: true,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })
    expect(repositories.projects.findById(IDS.NEW_PROJECT)).toBeNull()
    expect(repositories.tasks.findById(IDS.NEW_TASK)).toBeNull()
  })

  it('rejects unsafe client-visible records and invalid URLs', () => {
    const repositories = createRepositories()

    expect(() => saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.NEW_TASK,
      input: {
        client: {
          status: CLIENT_STATUSES.ON_TRACK,
        },
        currentFocus: [],
        dashboardLinks: [],
        neededActions: [],
        projects: [],
        reports: [],
        tasks: [
          {
            status: TASK_STATUSES.IN_PROGRESS,
            title: 'Visible task without assignee',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
        updates: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('must have an assignee')

    expect(() => saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.DASHBOARD_A,
      input: {
        client: {
          status: CLIENT_STATUSES.ON_TRACK,
        },
        currentFocus: [],
        dashboardLinks: [
          {
            name: 'Dashboard',
            public_url: 'not-a-url',
            status: DASHBOARD_LINK_STATUSES.ACTIVE,
          },
        ],
        neededActions: [],
        projects: [],
        reports: [],
        tasks: [],
        updates: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Dashboard public URL must be a valid http(s) URL.')

    expect(() => saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.UPDATE_A,
      input: {
        client: {
          status: CLIENT_STATUSES.ON_TRACK,
        },
        currentFocus: [],
        dashboardLinks: [],
        neededActions: [],
        projects: [],
        reports: [],
        tasks: [],
        updates: [
          {
            title: 'Title only',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Client-visible updates must include update body text.')
  })

  it('preserves project and task ordering through sort_order', () => {
    const repositories = createRepositories()
    const generatedIds = [
      IDS.NEW_PROJECT,
      IDS.NEW_TASK,
      '77777777-7777-4777-8777-777777777778',
    ]

    const editor = saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        client: {
          status: CLIENT_STATUSES.ON_TRACK,
        },
        currentFocus: [],
        dashboardLinks: [],
        neededActions: [],
        projects: [
          {
            id: IDS.PROJECT_A,
            name: 'Existing second',
            progress_percent: 10,
            sort_order: 20,
          },
          {
            name: 'New first',
            progress_percent: 30,
            sort_order: 10,
          },
        ],
        reports: [],
        tasks: [
          {
            assignee_name: 'Owner',
            sort_order: 20,
            status: TASK_STATUSES.TODO,
            title: 'Second',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
          {
            assignee_name: 'Owner',
            sort_order: 10,
            status: TASK_STATUSES.TODO,
            title: 'First',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
        updates: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(editor.projects.map((project) => project.name)).toEqual(['New first', 'Existing second'])
    expect(editor.tasks.map((task) => task.title)).toEqual(['First', 'Second'])
  })

  it('marks the overview as published on the client record', () => {
    const repositories = createRepositories()

    const editor = publishAdminClientOverview({
      clientId: IDS.CLIENT_A,
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(editor.client.overviewPublishedAt).toBe('2026-05-09T10:00:00.000Z')
    expect(editor.client.overviewPublishedBy).toBe('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
    expect(repositories.clients.findById(IDS.CLIENT_A).overview_published_at).toBe('2026-05-09T10:00:00.000Z')
  })

  it('publishes the saved draft into the client-facing records', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.NEW_PROJECT, IDS.NEW_TASK]

    saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        client: {
          status: CLIENT_STATUSES.BLOCKED,
        },
        currentFocus: ['Fix attribution'],
        dashboardLinks: [],
        neededActions: [],
        projects: [
          {
            name: 'Attribution repair',
            progress_percent: 45,
          },
        ],
        reports: [],
        tasks: [
          {
            assignee_name: 'Analytics',
            status: TASK_STATUSES.BLOCKED,
            title: 'Reconnect GA4 event',
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
        updates: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    const editor = publishAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      now: () => '2026-05-10T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(editor.client.hasDraft).toBe(false)
    expect(editor.client.status).toBe(CLIENT_STATUSES.BLOCKED)
    expect(repositories.clients.findById(IDS.CLIENT_A)).toMatchObject({
      current_focus: ['Fix attribution'],
      overview_draft: null,
      overview_published_at: '2026-05-10T10:00:00.000Z',
      status: CLIENT_STATUSES.BLOCKED,
    })
    expect(repositories.projects.findById(IDS.NEW_PROJECT)).toMatchObject({
      name: 'Attribution repair',
      progress_percent: 45,
    })
    expect(repositories.tasks.findById(IDS.NEW_TASK)).toMatchObject({
      title: 'Reconnect GA4 event',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })
  })

  it('discards draft changes and restores the published editor state', () => {
    const repositories = createRepositories()

    saveAdminClientOverview({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.NEW_PROJECT,
      input: {
        client: {
          status: CLIENT_STATUSES.WAITING_CLIENT,
        },
        currentFocus: ['Draft-only focus'],
        dashboardLinks: [],
        neededActions: [],
        projects: [],
        reports: [],
        tasks: [],
        updates: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    const editor = discardAdminClientOverviewDraft({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(editor.client.hasDraft).toBe(false)
    expect(editor.client.status).toBe(CLIENT_STATUSES.ON_TRACK)
    expect(editor.currentFocus).toEqual(['Campaign launch'])
    expect(repositories.clients.findById(IDS.CLIENT_A).overview_draft).toBeNull()
  })
})
