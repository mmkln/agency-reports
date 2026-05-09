import { describe, expect, it } from 'vitest'

import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { answerNeededAction } from './neededFromClientService'

const IDS = Object.freeze({
  ACTION: '11111111-1111-4111-8111-111111111111',
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
  })

  it('rejects agency users responding as the client', () => {
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
  })
})
