import { describe, expect, it } from 'vitest'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { getClientActionNeededPage } from './clientActionNeededService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
})

function createEntityRepository(records = []) {
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
  return {
    clients: createEntityRepository([
      {
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
      },
      {
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
      },
    ]),
    neededFromClient: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        description: 'Please approve the May creative batch.',
        due_date: '2026-05-18',
        id: '33333333-3333-4333-8333-333333333333',
        priority: NEEDED_ACTION_PRIORITIES.HIGH,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creative batch',
        type: NEEDED_ACTION_TYPES.APPROVAL,
      },
      {
        client_id: IDS.CLIENT_A,
        description: 'Reconnect analytics access.',
        due_date: '2026-05-20',
        id: '44444444-4444-4444-8444-444444444444',
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Access needed',
        type: NEEDED_ACTION_TYPES.ACCESS,
      },
      {
        client_id: IDS.CLIENT_A,
        client_response: 'Uploaded.',
        due_date: '2026-05-19',
        id: '55555555-5555-4555-8555-555555555555',
        status: NEEDED_ACTION_STATUSES.ANSWERED,
        title: 'Upload files',
      },
      {
        client_id: IDS.CLIENT_A,
        id: '66666666-6666-4666-8666-666666666666',
        status: NEEDED_ACTION_STATUSES.RESOLVED,
        title: 'Confirm launch date',
      },
      {
        client_id: IDS.CLIENT_A,
        id: '77777777-7777-4777-8777-777777777777',
        status: NEEDED_ACTION_STATUSES.CANCELLED,
        title: 'Cancelled item',
      },
    ]),
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

describe('getClientActionNeededPage', () => {
  it('returns client-visible actions with operational counts and inferred action types', () => {
    const page = getClientActionNeededPage({
      clientId: IDS.CLIENT_A,
      now: () => new Date('2026-05-19T09:00:00.000Z'),
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.actions.map((action) => action.title)).toEqual([
      'Approve creative batch',
      'Access needed',
      'Upload files',
      'Confirm launch date',
    ])
    expect(page.counts).toEqual({
      all: 4,
      answered: 1,
      approved: 0,
      changesRequested: 0,
      completed: 1,
      dueSoon: 1,
      open: 2,
      overdue: 1,
    })
    expect(page.actions[0]).toMatchObject({
      actionType: 'approval',
      isOverdue: true,
    })
    expect(page.actions[1]).toMatchObject({
      actionType: 'access_needed',
      isDueSoon: true,
    })
    expect(JSON.stringify(page)).not.toContain('Cancelled item')
  })

  it('denies cross-client access', () => {
    const page = getClientActionNeededPage({
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
