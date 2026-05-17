import { describe, expect, it } from 'vitest'

import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import {
  createClientWorkItem,
  createClientWorkItemFromTask,
  listAdminClientWorkItems,
  listPublishedClientWorkItems,
  markClientWorkItemReadyForReview,
  publishClientWorkItem,
  suggestClientWorkItemFromTask,
} from './clientWorkItemService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  OTHER_CLIENT: '33333333-3333-4333-8333-333333333333',
  PROJECT: '44444444-4444-4444-8444-444444444444',
  TASK: '55555555-5555-4555-8555-555555555555',
  USER: '66666666-6666-4666-8666-666666666666',
  WORK: '77777777-7777-4777-8777-777777777777',
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
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT,
        name: 'Client A',
        portal_slug: 'client-a',
      },
      {
        agency_id: 'other-agency',
        id: IDS.OTHER_CLIENT,
        name: 'Client B',
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK,
        project_id: IDS.PROJECT,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        sort_order: 10,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Published safe summary.',
        title: 'Published work',
        updated_at: '2026-05-08T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT,
        id: '88888888-8888-4888-8888-888888888888',
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Not visible yet.',
        title: 'Review work',
      },
    ]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.PROJECT,
        name: 'Campaign Setup',
      },
    ]),
    tasks: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        client_safe_summary: 'Task proposed summary.',
        due_date: '2026-05-20',
        id: IDS.TASK,
        project_id: IDS.PROJECT,
        status: TASK_STATUSES.WAITING_CLIENT,
        title: 'Review creatives',
      },
    ]),
    ...overrides,
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: IDS.USER,
  }
}

function createClientViewer(clientIds = [IDS.CLIENT]) {
  return {
    clientIds,
    role: USER_ROLES.CLIENT_USER,
  }
}

function createTeamViewer(clientIds = [IDS.CLIENT]) {
  return {
    agencyId: IDS.AGENCY,
    clientIds,
    role: USER_ROLES.AGENCY_TEAM,
    userId: IDS.USER,
  }
}

describe('clientWorkItemService', () => {
  it('lists only published own work items for client users', () => {
    const result = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_USER,
      },
    })

    expect(result.status).toBe('ready')
    expect(result.workItems.map((item) => item.title)).toEqual(['Published work'])
    expect(result.workItems[0]).toMatchObject({
      projectName: 'Campaign Setup',
      summary: 'Published safe summary.',
    })
    expect(result.workItems[0].publishState).toBeUndefined()
  })

  it('returns access denied when a client asks for another client work list', () => {
    const result = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: {
        clientIds: [IDS.OTHER_CLIENT],
        role: USER_ROLES.CLIENT_USER,
      },
    })

    expect(result).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('lists admin client work items with source task context', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.WORK,
          project_id: IDS.PROJECT,
          publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
          source_task_id: IDS.TASK,
          status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
          summary: 'Published safe summary.',
          title: 'Published work',
        },
      ]),
    })

    const result = listAdminClientWorkItems({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.workItems).toHaveLength(1)
    expect(result.workItems[0]).toMatchObject({
      publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
      sourceTask: {
        id: IDS.TASK,
        status: TASK_STATUSES.WAITING_CLIENT,
      },
    })
  })

  it('creates standalone client work items for agency admins', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([]),
    })

    const createdWorkItem = createClientWorkItem({
      idGenerator: () => IDS.WORK,
      input: {
        clientId: IDS.CLIENT,
        projectId: IDS.PROJECT,
        summary: 'Safe summary.',
        targetDate: '2026-05-30',
        title: 'Plan SEO cleanup',
      },
      now: () => '2026-05-17T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(createdWorkItem).toMatchObject({
      clientId: IDS.CLIENT,
      publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
      status: CLIENT_WORK_ITEM_STATUSES.PLANNED,
      summary: 'Safe summary.',
      targetDate: '2026-05-30',
      title: 'Plan SEO cleanup',
    })
    expect(repositories.clientWorkItems.findById(IDS.WORK)).toMatchObject({
      client_id: IDS.CLIENT,
    })
  })

  it('creates client work items from internal tasks without publishing automatically', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([]),
    })

    const createdWorkItem = createClientWorkItemFromTask({
      idGenerator: () => IDS.WORK,
      now: () => '2026-05-17T09:00:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })

    expect(createdWorkItem).toMatchObject({
      projectId: IDS.PROJECT,
      publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
      sourceTaskId: IDS.TASK,
      status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
      summary: 'Task proposed summary.',
      targetDate: '2026-05-20',
      title: 'Review creatives',
    })
  })

  it('lets assigned team members send a task summary to admin review without publishing it', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([]),
    })

    const workItem = suggestClientWorkItemFromTask({
      idGenerator: () => IDS.WORK,
      now: () => '2026-05-17T10:30:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createTeamViewer(),
    })

    expect(workItem).toMatchObject({
      clientId: IDS.CLIENT,
      publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
      publishedAt: null,
      sourceTaskId: IDS.TASK,
      summary: 'Task proposed summary.',
      title: 'Review creatives',
    })

    const clientResult = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(clientResult.workItems).toEqual([])

    publishClientWorkItem({
      now: () => '2026-05-17T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK,
    })

    const publishedClientResult = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(publishedClientResult.workItems.map((item) => item.title)).toEqual(['Review creatives'])
  })

  it('requires a client-safe summary before team members can send a task to admin review', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([]),
      tasks: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          client_safe_summary: '',
          due_date: '2026-05-20',
          id: IDS.TASK,
          project_id: IDS.PROJECT,
          status: TASK_STATUSES.IN_PROGRESS,
          title: 'Review creatives',
        },
      ]),
    })

    expect(() => suggestClientWorkItemFromTask({
      idGenerator: () => IDS.WORK,
      repositories,
      taskId: IDS.TASK,
      viewer: createTeamViewer(),
    })).toThrow('Client-safe summary is required before sending work for review.')
  })

  it('blocks team members from suggesting work for unassigned clients', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([]),
    })

    expect(() => suggestClientWorkItemFromTask({
      idGenerator: () => IDS.WORK,
      repositories,
      taskId: IDS.TASK,
      viewer: createTeamViewer([IDS.OTHER_CLIENT]),
    })).toThrow('Source task was not found.')
  })

  it('lets team members mark assigned client work ready for review but not publish', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.WORK,
          publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
          status: CLIENT_WORK_ITEM_STATUSES.PLANNED,
          summary: 'Safe summary.',
          title: 'Draft work',
        },
      ]),
    })
    const teamViewer = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.AGENCY_TEAM,
      userId: IDS.USER,
    }

    const updatedWorkItem = markClientWorkItemReadyForReview({
      now: () => '2026-05-17T10:00:00.000Z',
      repositories,
      viewer: teamViewer,
      workItemId: IDS.WORK,
    })

    expect(updatedWorkItem.publish_state).toBe(CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW)
    expect(() => publishClientWorkItem({
      repositories,
      viewer: teamViewer,
      workItemId: IDS.WORK,
    })).toThrow('Client work item was not found.')
  })

  it('publishes reviewed client work items for agency admins', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.WORK,
          publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
          status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
          summary: 'Safe summary.',
          title: 'Review work',
        },
      ]),
    })

    const publishedWorkItem = publishClientWorkItem({
      now: () => '2026-05-17T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK,
    })

    expect(publishedWorkItem).toMatchObject({
      publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
      publishedAt: '2026-05-17T11:00:00.000Z',
      publishedBy: IDS.USER,
    })
  })

  it('keeps client work hidden until publish and returns only client-safe fields', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.WORK,
          project_id: IDS.PROJECT,
          publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
          source_task_id: IDS.TASK,
          status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
          summary: 'Client-safe progress summary.',
          target_date: '2026-05-20',
          title: 'Client-safe work',
          updated_at: '2026-05-09T09:00:00.000Z',
        },
      ]),
      tasks: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          client_safe_summary: 'Client-safe progress summary.',
          due_date: '2026-05-20',
          id: IDS.TASK,
          internal_note: 'Private margin and delivery risk.',
          project_id: IDS.PROJECT,
          status: TASK_STATUSES.IN_PROGRESS,
          title: 'Internal source task title',
        },
      ]),
    })

    const beforePublish = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(beforePublish.workItems).toEqual([])

    publishClientWorkItem({
      now: () => '2026-05-17T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK,
    })

    const afterPublish = listPublishedClientWorkItems({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(afterPublish.workItems).toHaveLength(1)
    expect(afterPublish.workItems[0]).toMatchObject({
      projectName: 'Campaign Setup',
      summary: 'Client-safe progress summary.',
      targetDate: '2026-05-20',
      title: 'Client-safe work',
    })
    expect(afterPublish.workItems[0]).not.toHaveProperty('publishState')
    expect(afterPublish.workItems[0]).not.toHaveProperty('sourceTask')
    expect(JSON.stringify(afterPublish)).not.toContain('Private margin')
    expect(JSON.stringify(afterPublish)).not.toContain('Internal source task title')
  })

  it('requires a safe summary before publishing', () => {
    const repositories = createRepositories({
      clientWorkItems: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.WORK,
          publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
          status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
          summary: '',
          title: 'Review work',
        },
      ]),
    })

    expect(() => publishClientWorkItem({
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK,
    })).toThrow('Client work item summary is required before publishing.')
  })
})
