import { describe, expect, it } from 'vitest'

import {
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import {
  answerNeededAction,
  cancelNeededAction,
  createNeededAction,
  createNeededActionFromTask,
  createNeededActionFromWorkItem,
  linkNeededActionToTask,
  linkNeededActionToWorkItem,
  listClientNeededActions,
  listNeededActionsWorkspace,
  listOpenNeededActionsForWorkItem,
  listWaitingClientTasksWithoutRequests,
  reopenNeededAction,
  resolveNeededAction,
  updateNeededAction,
} from './neededFromClientService'

const IDS = Object.freeze({
  ACTION: '11111111-1111-4111-8111-111111111111',
  AGENCY: '44444444-4444-4444-8444-444444444444',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  OTHER_CLIENT: '77777777-7777-4777-8777-777777777777',
  TASK: '55555555-5555-4555-8555-555555555555',
  USER: '33333333-3333-4333-8333-333333333333',
  WORK_ITEM: '66666666-6666-4666-8666-666666666666',
})

function createRepository(record) {
  let currentRecord = record

  return {
    findById(id) {
      return currentRecord?.id === id ? currentRecord : null
    },
    upsert(nextRecord) {
      currentRecord = nextRecord
      return nextRecord
    },
  }
}

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

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user',
  }
}

function createClientViewer() {
  return {
    clientId: IDS.CLIENT,
    clientIds: [IDS.CLIENT],
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER,
  }
}

function createWorkflowRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT,
        name: 'Client A',
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.OTHER_CLIENT,
        name: 'Client B',
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.WORK_ITEM,
        source_task_id: IDS.TASK,
        status: 'waiting_client',
        summary: 'Client-facing work summary.',
        target_date: '2026-05-20',
        title: 'Launch setup',
      },
    ]),
    neededFromClient: createEntityRepository([]),
    tasks: createEntityRepository([
      {
        blocker_note: 'Launch is paused until the client confirms access.',
        client_id: IDS.CLIENT,
        client_safe_summary: 'We need access confirmation before launch.',
        due_date: '2026-05-20',
        id: IDS.TASK,
        project_id: '',
        status: TASK_STATUSES.WAITING_CLIENT,
        title: 'Confirm analytics access',
      },
    ]),
    ...overrides,
  }
}

describe('neededFromClientService', () => {
  it('lists client requests for agency admins by client and status', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
        {
          agency_id: 'other-agency',
          id: '55555555-5555-4555-8555-555555555555',
          name: 'Other Client',
        },
      ]),
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          due_date: '2026-05-10',
          id: IDS.ACTION,
          internal_notes: 'Client should not see this.',
          priority: 'high',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve creatives',
        },
        {
          client_id: IDS.CLIENT,
          id: '66666666-6666-4666-8666-666666666666',
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved item',
        },
      ]),
    }

    const result = listNeededActionsWorkspace({
      filters: {
        clientId: IDS.CLIENT,
        status: NEEDED_ACTION_STATUSES.PENDING,
      },
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Approve creatives'])
    expect(result.actions[0]).toMatchObject({
      clientName: 'Client A',
      priority: 'high',
      status: NEEDED_ACTION_STATUSES.PENDING,
    })
    expect(result.actions[0].internalNotes).toBe('Client should not see this.')
  })

  it('creates pending client requests for agency admins', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
      ]),
      neededFromClient: createEntityRepository([]),
    }

    const createdAction = createNeededAction({
      idGenerator: () => IDS.ACTION,
      input: {
        agencyOwner: 'Mia Carter',
        clientOwner: 'Sarah Johnson',
        clientId: IDS.CLIENT,
        description: 'Please approve the next creative batch.',
        dueDate: '2026-05-10',
        impactIfDelayed: 'Launch moves by one day.',
        internalNotes: 'We need this before launch.',
        lastRemindedAt: '2026-05-09T09:00:00.000Z',
        ownerName: 'Sarah Johnson',
        priority: 'high',
        relatedLink: 'https://example.com/creative',
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
        title: 'Approve creatives',
        type: NEEDED_ACTION_TYPES.APPROVAL,
        whyNeeded: 'We need client sign-off before launch.',
      },
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(createdAction).toMatchObject({
      agency_owner: 'Mia Carter',
      client_owner: 'Sarah Johnson',
      due_date: '2026-05-10',
      impact_if_delayed: 'Launch moves by one day.',
      internal_notes: 'We need this before launch.',
      last_reminded_at: '2026-05-09T09:00:00.000Z',
      owner_name: 'Sarah Johnson',
      priority: 'high',
      related_link: 'https://example.com/creative',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Approve creatives',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      why_needed: 'We need client sign-off before launch.',
    })
    expect(repositories.neededFromClient.findById(IDS.ACTION)).toMatchObject({
      client_id: IDS.CLIENT,
    })
    expect(createdAction.response_history).toEqual([
      expect.objectContaining({
        metadata: expect.objectContaining({
          actor_role: USER_ROLES.AGENCY_ADMIN,
          title: 'Approve creatives',
        }),
        type: 'admin_created',
      }),
    ])
  })

  it('lists only client-visible own requests for client users', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          id: IDS.CLIENT,
          name: 'Client A',
          portal_slug: 'client-a',
        },
      ]),
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          internal_notes: 'Internal only.',
          priority: 'high',
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Approve creatives',
        },
        {
          client_id: IDS.CLIENT,
          id: '66666666-6666-4666-8666-666666666666',
          status: NEEDED_ACTION_STATUSES.CANCELLED,
          title: 'Cancelled request',
        },
      ]),
    }

    const result = listClientNeededActions({
      clientId: IDS.CLIENT,
      repositories,
      viewer: {
        clientId: IDS.CLIENT,
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_USER,
      },
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Approve creatives'])
    expect(result.actions[0]).toMatchObject({
      priority: 'high',
      status: NEEDED_ACTION_STATUSES.PENDING,
    })
    expect(result.actions[0].internalNotes).toBeUndefined()
  })

  it('requires generated request ids to be string UUIDs', () => {
    const repositories = {
      clients: createEntityRepository([
        {
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
          name: 'Client A',
        },
      ]),
      neededFromClient: createEntityRepository([]),
    }

    expect(() => createNeededAction({
      idGenerator: () => '1',
      input: {
        clientId: IDS.CLIENT,
        title: 'Approve creatives',
      },
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })).toThrow('Needed action id must be a string uuid.')
  })

  it('lets agency admins update editable request fields', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        description: 'Old description',
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Old title',
      }),
    }

    const updatedAction = updateNeededAction({
      actionId: IDS.ACTION,
      input: {
        description: 'New details',
        dueDate: '2026-05-20',
        internalNotes: 'Internal follow-up note',
        ownerName: 'Sarah Johnson',
        priority: 'high',
        relatedLink: 'https://example.com/request',
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
        title: 'Updated request',
      },
      now: () => '2026-05-10T10:00:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(updatedAction).toMatchObject({
      description: 'New details',
      due_date: '2026-05-20',
      internal_notes: 'Internal follow-up note',
      owner_name: 'Sarah Johnson',
      priority: 'high',
      related_link: 'https://example.com/request',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Updated request',
      updated_at: '2026-05-10T10:00:00.000Z',
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_updated',
      }),
    ])
  })

  it('creates needed actions from waiting-client tasks without exposing the task as the client workflow', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromTask({
      idGenerator: () => IDS.ACTION,
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      description: 'We need access confirmation before launch.',
      impact_if_delayed: 'Launch is paused until the client confirms access.',
      related_task_id: IDS.TASK,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Action needed: Confirm analytics access',
      type: NEEDED_ACTION_TYPES.OTHER,
      why_needed: 'We need access confirmation before launch.',
    })
  })

  it('creates needed actions from client work items and links source task context', () => {
    const repositories = createWorkflowRepositories()

    const action = createNeededActionFromWorkItem({
      idGenerator: () => IDS.ACTION,
      input: {
        type: NEEDED_ACTION_TYPES.ACCESS,
      },
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(action).toMatchObject({
      client_id: IDS.CLIENT,
      description: 'Client-facing work summary.',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      title: 'Action needed: Launch setup',
      type: NEEDED_ACTION_TYPES.ACCESS,
      why_needed: 'Client-facing work summary.',
    })
  })

  it('links existing needed actions to a task and client work item', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
      ]),
    })

    const linkedToTask = linkNeededActionToTask({
      actionId: IDS.ACTION,
      now: () => '2026-05-17T12:10:00.000Z',
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })
    const linkedToWorkItem = linkNeededActionToWorkItem({
      actionId: IDS.ACTION,
      now: () => '2026-05-17T12:15:00.000Z',
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(linkedToTask).toMatchObject({
      related_task_id: IDS.TASK,
    })
    expect(linkedToWorkItem).toMatchObject({
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
    })
    expect(linkedToWorkItem.response_history.map((event) => event.type)).toEqual([
      'admin_linked_task',
      'admin_linked_work_item',
    ])
  })

  it('lists open needed actions for a client work item', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
        {
          client_id: IDS.CLIENT,
          id: '88888888-8888-4888-8888-888888888888',
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved access',
        },
      ]),
    })

    const result = listOpenNeededActionsForWorkItem({
      repositories,
      viewer: createAdminViewer(),
      workItemId: IDS.WORK_ITEM,
    })

    expect(result.actions.map((action) => action.title)).toEqual(['Confirm access'])
  })

  it('lists waiting-client tasks without open linked requests', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.RESOLVED,
          title: 'Resolved access',
        },
      ]),
    })

    const beforeOpenRequest = listWaitingClientTasksWithoutRequests({
      repositories,
      viewer: createAdminViewer(),
    })

    expect(beforeOpenRequest.tasks.map((task) => task.id)).toEqual([IDS.TASK])

    createNeededActionFromTask({
      idGenerator: () => IDS.ACTION,
      repositories,
      taskId: IDS.TASK,
      viewer: createAdminViewer(),
    })

    const afterOpenRequest = listWaitingClientTasksWithoutRequests({
      repositories,
      viewer: createAdminViewer(),
    })

    expect(afterOpenRequest.tasks).toEqual([])
  })

  it('lets a client user answer a pending needed action', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creatives',
      }),
    }

    const updatedAction = answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Approved.',
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: {
        clientId: IDS.CLIENT,
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_USER,
        userId: IDS.USER,
      },
    })

    expect(updatedAction).toMatchObject({
      client_response: 'Approved.',
      client_responded_at: '2026-05-09T10:00:00.000Z',
      client_responded_by: IDS.USER,
      responded_at: '2026-05-09T10:00:00.000Z',
      responded_by: IDS.USER,
      status: NEEDED_ACTION_STATUSES.ANSWERED,
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'client_answered',
      }),
    ])
  })

  it('keeps linked internal task status unchanged when the client responds', () => {
    const repositories = createWorkflowRepositories({
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT,
          id: IDS.ACTION,
          related_task_id: IDS.TASK,
          related_work_item_id: IDS.WORK_ITEM,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Confirm access',
        },
      ]),
    })

    answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Access confirmed.',
      repositories,
      viewer: createClientViewer(),
    })

    expect(repositories.tasks.findById(IDS.TASK)).toMatchObject({
      status: TASK_STATUSES.WAITING_CLIENT,
    })
  })

  it('rejects agency users and closed actions when responding as the client', () => {
    const repositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
      }),
    }

    expect(() => answerNeededAction({
      actionId: IDS.ACTION,
      repositories,
      viewer: {
        role: USER_ROLES.AGENCY_ADMIN,
      },
    })).toThrow('Needed action was not found.')

    const closedRepositories = {
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.RESOLVED,
      }),
    }

    expect(() => answerNeededAction({
      actionId: IDS.ACTION,
      message: 'Done.',
      repositories: closedRepositories,
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_USER,
        userId: IDS.USER,
      },
    })).toThrow('Only pending actions can be answered.')
  })

  it('lets agency admins resolve answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.ANSWERED,
      }),
    }

    const updatedAction = resolveNeededAction({
      actionId: IDS.ACTION,
      note: 'Processed.',
      now: () => '2026-05-09T11:00:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(updatedAction).toMatchObject({
      resolution_note: 'Processed.',
      resolved_by: 'admin-user',
      status: NEEDED_ACTION_STATUSES.RESOLVED,
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_resolved',
      }),
    ])
  })

  it('lets agency admins cancel pending or answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.PENDING,
      }),
    }

    const updatedAction = cancelNeededAction({
      actionId: IDS.ACTION,
      note: 'No longer needed.',
      now: () => '2026-05-09T11:30:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(updatedAction).toMatchObject({
      cancellation_note: 'No longer needed.',
      cancelled_by: 'admin-user',
      status: NEEDED_ACTION_STATUSES.CANCELLED,
    })
  })

  it('lets agency admins reopen closed or answered actions', () => {
    const repositories = {
      clients: {
        findById: () => ({
          agency_id: IDS.AGENCY,
          id: IDS.CLIENT,
        }),
      },
      neededFromClient: createRepository({
        cancelled_at: '2026-05-09T11:30:00.000Z',
        cancelled_by: 'admin-user',
        cancellation_note: 'No longer needed.',
        client_id: IDS.CLIENT,
        id: IDS.ACTION,
        status: NEEDED_ACTION_STATUSES.CANCELLED,
      }),
    }

    const updatedAction = reopenNeededAction({
      actionId: IDS.ACTION,
      note: 'Needed again.',
      now: () => '2026-05-10T11:30:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(updatedAction).toMatchObject({
      cancellation_note: '',
      cancelled_at: null,
      cancelled_by: null,
      status: NEEDED_ACTION_STATUSES.PENDING,
      updated_at: '2026-05-10T11:30:00.000Z',
    })
    expect(updatedAction.response_history).toEqual([
      expect.objectContaining({
        type: 'admin_reopened',
      }),
    ])
  })
})
