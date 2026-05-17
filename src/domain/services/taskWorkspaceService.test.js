import { describe, expect, it } from 'vitest'

import { CLIENT_WORK_ITEM_PUBLISH_STATES, CLIENT_WORK_ITEM_STATUSES } from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { createTask, listTaskWorkspace, updateWorkspaceTask } from './taskWorkspaceService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  OTHER_AGENCY_CLIENT: '44444444-4444-4444-8444-444444444444',
  NEW_TASK: '55555555-5555-4555-8555-555555555555',
  PROJECT_A: '66666666-6666-4666-8666-666666666666',
  TASK_A: '77777777-7777-4777-8777-777777777777',
  WORK_A: '88888888-8888-4888-8888-888888888888',
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

function createRepositories() {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Client A',
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_B,
        name: 'Client B',
      },
      {
        agency_id: 'other-agency',
        id: IDS.OTHER_AGENCY_CLIENT,
        name: 'Other Client',
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        source_task_id: IDS.TASK_A,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Published client-safe work summary.',
        title: 'Published active work',
        updated_at: '2026-05-12T09:00:00.000Z',
      },
    ]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.PROJECT_A,
        name: 'Project A',
      },
    ]),
    tasks: createEntityRepository([
      {
        assignee_name: 'Mia Carter',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-12',
        id: IDS.TASK_A,
        project_id: IDS.PROJECT_A,
        sort_order: 10,
        status: TASK_STATUSES.IN_PROGRESS,
        title: 'Assigned task',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    name: 'GrowthLab Admin',
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

function createTeamViewer() {
  return {
    agencyId: IDS.AGENCY,
    clientIds: [IDS.CLIENT_A],
    name: 'Mia Carter',
    role: USER_ROLES.AGENCY_TEAM,
  }
}

describe('taskWorkspaceService', () => {
  it('lists all agency tasks for admins and assigned-client tasks for team members', () => {
    const adminResult = listTaskWorkspace({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })
    const teamResult = listTaskWorkspace({
      repositories: createRepositories(),
      viewer: createTeamViewer(),
    })

    expect(adminResult.clients.map((client) => client.id)).toEqual([IDS.CLIENT_A, IDS.CLIENT_B])
    expect(adminResult.canCreateClientVisibleTasks).toBe(true)
    expect(adminResult.canCreateClientWorkItems).toBe(true)
    expect(teamResult.clients.map((client) => client.id)).toEqual([IDS.CLIENT_A])
    expect(teamResult.canCreateClientVisibleTasks).toBe(false)
  })

  it('adds linked client work item state to task read models', () => {
    const result = listTaskWorkspace({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })
    const task = result.tasks.find((item) => item.id === IDS.TASK_A)

    expect(task).toMatchObject({
      clientWorkItem: {
        id: IDS.WORK_A,
        publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summaryStatus: 'ready',
        title: 'Published active work',
      },
      hasClientWorkItem: true,
      isMissingClientSummary: false,
      isPublishedToClient: true,
      isReadyForClientReview: false,
    })
  })

  it('lets admins create client-visible tasks for agency clients', () => {
    const repositories = createRepositories()

    const task = createTask({
      idGenerator: () => IDS.NEW_TASK,
      input: {
        assigneeName: 'Leo Brooks',
        clientId: IDS.CLIENT_A,
        dueDate: '2026-05-20',
        projectId: IDS.PROJECT_A,
        status: TASK_STATUSES.TODO,
        title: 'Create landing page QA checklist',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      now: () => '2026-05-14T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(task).toMatchObject({
      assignee_name: 'Leo Brooks',
      client_id: IDS.CLIENT_A,
      client_visible: true,
      due_date: '2026-05-20',
      id: IDS.NEW_TASK,
      project_id: IDS.PROJECT_A,
      sort_order: 20,
      title: 'Create landing page QA checklist',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })
  })

  it('lets team members create only internal self-assigned tasks', () => {
    const task = createTask({
      idGenerator: () => IDS.NEW_TASK,
      input: {
        clientId: IDS.CLIENT_A,
        title: 'Check tracking regression',
        visibility: VISIBILITY.INTERNAL,
      },
      repositories: createRepositories(),
      viewer: createTeamViewer(),
    })

    expect(task).toMatchObject({
      assignee_name: 'Mia Carter',
      client_visible: false,
      title: 'Check tracking regression',
      visibility: VISIBILITY.INTERNAL,
    })
  })

  it('blocks team-created client-visible tasks', () => {
    expect(() => createTask({
      idGenerator: () => IDS.NEW_TASK,
      input: {
        clientId: IDS.CLIENT_A,
        title: 'Publish this to client',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      repositories: createRepositories(),
      viewer: createTeamViewer(),
    })).toThrow('Team-created tasks must stay internal')
  })

  it('lets admins update task visibility without status-transition limits', () => {
    const task = updateWorkspaceTask({
      input: {
        status: TASK_STATUSES.DONE,
        visibility: VISIBILITY.INTERNAL,
      },
      repositories: createRepositories(),
      taskId: IDS.TASK_A,
      viewer: createAdminViewer(),
    })

    expect(task).toMatchObject({
      client_visible: false,
      status: TASK_STATUSES.DONE,
      visibility: VISIBILITY.INTERNAL,
    })
  })
})
