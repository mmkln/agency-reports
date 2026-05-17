import { describe, expect, it } from 'vitest'

import { CLIENT_WORK_ITEM_PUBLISH_STATES, CLIENT_WORK_ITEM_STATUSES } from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { listTeamTasks, updateAssignedTask } from './teamTaskService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  PROJECT_A: '44444444-4444-4444-8444-444444444444',
  TASK_A: '55555555-5555-4555-8555-555555555555',
  TASK_B: '66666666-6666-4666-8666-666666666666',
  TASK_OTHER_CLIENT: '77777777-7777-4777-8777-777777777777',
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
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        source_task_id: IDS.TASK_A,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: '',
        title: 'Review active work',
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
      {
        assignee_name: 'Leo Brooks',
        client_id: IDS.CLIENT_A,
        due_date: '2026-05-11',
        id: IDS.TASK_B,
        project_id: IDS.PROJECT_A,
        sort_order: 20,
        status: TASK_STATUSES.TODO,
        title: 'Team task',
        visibility: VISIBILITY.INTERNAL,
      },
      {
        assignee_name: 'Mia Carter',
        client_id: IDS.CLIENT_B,
        due_date: '2026-05-10',
        id: IDS.TASK_OTHER_CLIENT,
        project_id: IDS.PROJECT_A,
        sort_order: 30,
        status: TASK_STATUSES.IN_PROGRESS,
        title: 'Other client task',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
  }
}

function createViewer() {
  return {
    agencyId: IDS.AGENCY,
    clientIds: [IDS.CLIENT_A],
    name: 'Mia Carter',
    role: USER_ROLES.AGENCY_TEAM,
  }
}

describe('teamTaskService', () => {
  it('lists all tasks for assigned clients by default', () => {
    const result = listTeamTasks({
      repositories: createRepositories(),
      viewer: createViewer(),
    })

    expect(result.tasks.map((task) => task.title)).toEqual(['Team task', 'Assigned task'])
    expect(result.tasks[1]).toMatchObject({
      availableTransitions: [
        TASK_STATUSES.BLOCKED,
        TASK_STATUSES.DONE,
        TASK_STATUSES.WAITING_CLIENT,
      ],
      clientName: 'Client A',
      clientWorkItem: {
        id: IDS.WORK_A,
        publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
        summaryStatus: 'missing',
        title: 'Review active work',
      },
      hasClientWorkItem: true,
      isMissingClientSummary: true,
      isPublishedToClient: false,
      isReadyForClientReview: true,
      projectName: 'Project A',
    })
  })

  it('can filter down to my assigned tasks when requested', () => {
    const result = listTeamTasks({
      filters: {
        scope: 'mine',
      },
      repositories: createRepositories(),
      viewer: createViewer(),
    })

    expect(result.tasks.map((task) => task.title)).toEqual(['Assigned task'])
  })

  it('updates assigned task status through allowed transitions', () => {
    const repositories = createRepositories()

    const task = updateAssignedTask({
      input: {
        clientSafeSummary: 'Client-safe progress note',
        internalNote: 'Internal implementation detail',
        status: TASK_STATUSES.DONE,
        visibility: VISIBILITY.INTERNAL,
      },
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      taskId: IDS.TASK_A,
      viewer: createViewer(),
    })

    expect(task).toMatchObject({
      client_safe_summary: 'Client-safe progress note',
      client_visible: false,
      internal_note: 'Internal implementation detail',
      status: TASK_STATUSES.DONE,
      updated_at: '2026-05-09T10:00:00.000Z',
      visibility: VISIBILITY.INTERNAL,
    })
  })

  it('reopens completed tasks back to todo', () => {
    const repositories = createRepositories()

    updateAssignedTask({
      input: {
        status: TASK_STATUSES.DONE,
      },
      repositories,
      taskId: IDS.TASK_A,
      viewer: createViewer(),
    })

    const task = updateAssignedTask({
      input: {
        status: TASK_STATUSES.TODO,
      },
      repositories,
      taskId: IDS.TASK_A,
      viewer: createViewer(),
    })

    expect(task.status).toBe(TASK_STATUSES.TODO)
  })

  it('blocks unsupported status transitions', () => {
    expect(() => updateAssignedTask({
      input: {
        status: TASK_STATUSES.DONE,
      },
      repositories: createRepositories(),
      taskId: IDS.TASK_B,
      viewer: createViewer(),
    })).toThrow('This status change is not allowed from the current task state.')
  })

  it('denies tasks outside assigned clients', () => {
    expect(() => updateAssignedTask({
      input: {
        status: TASK_STATUSES.DONE,
      },
      repositories: createRepositories(),
      taskId: IDS.TASK_OTHER_CLIENT,
      viewer: createViewer(),
    })).toThrow('Task is not available for this team member.')
  })
})
