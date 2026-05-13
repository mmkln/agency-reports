import { describe, expect, it } from 'vitest'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import {
  answerNeededAction,
  cancelNeededAction,
  resolveNeededAction,
} from './neededFromClientService'

const IDS = Object.freeze({
  ACTION: '11111111-1111-4111-8111-111111111111',
  AGENCY: '44444444-4444-4444-8444-444444444444',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  USER: '33333333-3333-4333-8333-333333333333',
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

describe('neededFromClientService', () => {
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
})
