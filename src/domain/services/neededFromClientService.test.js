import { describe, expect, it } from 'vitest'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import {
  answerNeededAction,
  cancelNeededAction,
  createNeededAction,
  listClientNeededActions,
  listNeededActionsWorkspace,
  reopenNeededAction,
  resolveNeededAction,
  updateNeededAction,
} from './neededFromClientService'

const IDS = Object.freeze({
  ACTION: '11111111-1111-4111-8111-111111111111',
  AGENCY: '44444444-4444-4444-8444-444444444444',
  CLIENT: '22222222-2222-4222-8222-222222222222',
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
        clientId: IDS.CLIENT,
        description: 'Please approve the next creative batch.',
        dueDate: '2026-05-10',
        internalNotes: 'We need this before launch.',
        ownerName: 'Sarah Johnson',
        priority: 'high',
        relatedLink: 'https://example.com/creative',
        relatedTaskId: IDS.TASK,
        relatedWorkItemId: IDS.WORK_ITEM,
        title: 'Approve creatives',
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
      due_date: '2026-05-10',
      internal_notes: 'We need this before launch.',
      owner_name: 'Sarah Johnson',
      priority: 'high',
      related_link: 'https://example.com/creative',
      related_task_id: IDS.TASK,
      related_work_item_id: IDS.WORK_ITEM,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Approve creatives',
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
