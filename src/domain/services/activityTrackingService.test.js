import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
import {
  ACTIVITY_EVENT_TYPES,
  isActivityEventVisibleToClient,
  listClientActivityEvents,
  listClientVisibleActivityEvents,
  recordActivityEvent,
} from './activityTrackingService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  EVENT_A: '44444444-4444-4444-8444-444444444444',
  EVENT_B: '55555555-5555-4555-8555-555555555555',
  PROFILE_ADMIN: '66666666-6666-4666-8666-666666666666',
  USER_ADMIN: '77777777-7777-4777-8777-777777777777',
  USER_CLIENT: '88888888-8888-4888-8888-888888888888',
})

function createEntityRepository(initialRecords = []) {
  const records = initialRecords.map((record) => ({ ...record }))

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    findByUserId(userId) {
      return records.find((record) => record.user_id === userId) ?? null
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
    activityEvents: createEntityRepository([]),
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Client A',
        status: CLIENT_STATUSES.ON_TRACK,
      },
      {
        agency_id: '99999999-9999-4999-8999-999999999999',
        id: IDS.CLIENT_B,
        name: 'Client B',
        status: CLIENT_STATUSES.ON_TRACK,
      },
    ]),
    profiles: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        email: 'admin@example.com',
        id: IDS.PROFILE_ADMIN,
        name: 'Admin User',
        role: USER_ROLES.AGENCY_ADMIN,
        user_id: IDS.USER_ADMIN,
      },
    ]),
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: IDS.USER_ADMIN,
  }
}

function createClientViewer() {
  return {
    clientIds: [IDS.CLIENT_A],
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER_CLIENT,
  }
}

describe('activityTrackingService', () => {
  it('records a valid client activity event', () => {
    const repositories = createRepositories()

    const event = recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      idGenerator: () => IDS.EVENT_A,
      metadata: {
        source: 'client_overview',
      },
      now: () => '2026-05-12T10:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })

    expect(event).toEqual({
      client_id: IDS.CLIENT_A,
      created_at: '2026-05-12T10:00:00.000Z',
      event_type: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      id: IDS.EVENT_A,
      metadata: {
        source: 'client_overview',
      },
      user_id: IDS.USER_CLIENT,
    })
    expect(repositories.activityEvents.findById(IDS.EVENT_A)).toMatchObject(event)
  })

  it('lists recent client activity for agency users only', () => {
    const repositories = createRepositories()

    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      idGenerator: () => IDS.EVENT_A,
      now: () => '2026-05-12T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.REPORT_OPENED,
      idGenerator: () => IDS.EVENT_B,
      metadata: {
        reportId: 'report-1',
      },
      now: () => '2026-05-12T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    const events = listClientActivityEvents({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(events.map((event) => event.eventType)).toEqual([
      ACTIVITY_EVENT_TYPES.REPORT_OPENED,
      ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
    ])
    expect(events[0]).toMatchObject({
      actorEmail: 'admin@example.com',
      actorName: 'Admin User',
      metadata: {
        reportId: 'report-1',
      },
    })
    expect(() => listClientActivityEvents({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only agency users can read client activity.')
  })

  it('lists only curated client-visible activity without internal metadata', () => {
    const repositories = createRepositories()
    const generatedIds = [
      IDS.EVENT_A,
      IDS.EVENT_B,
      '99999999-9999-4999-8999-999999999991',
      '99999999-9999-4999-8999-999999999992',
    ]

    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_READY_FOR_REVIEW,
      idGenerator: () => generatedIds.shift(),
      metadata: {
        sourceTaskId: 'internal-task',
        title: 'Internal review item',
        workItemId: 'work-1',
      },
      now: () => '2026-05-12T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
      idGenerator: () => generatedIds.shift(),
      metadata: {
        sourceTaskId: 'internal-task',
        title: 'Published work',
        workItemId: 'work-1',
      },
      now: () => '2026-05-12T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
      idGenerator: () => generatedIds.shift(),
      metadata: {
        actionId: 'action-1',
        internalNote: 'Private agency note.',
        relatedTaskId: 'internal-task',
        status: 'answered',
      },
      now: () => '2026-05-12T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: ACTIVITY_EVENT_TYPES.REPORT_OPENED,
      idGenerator: () => generatedIds.shift(),
      metadata: {
        reportId: 'report-1',
      },
      now: () => '2026-05-12T12:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    const events = listClientVisibleActivityEvents({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(events.map((event) => event.eventType)).toEqual([
      ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
      ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
    ])
    expect(JSON.stringify(events)).not.toContain('CLIENT_WORK_ITEM_READY_FOR_REVIEW')
    expect(JSON.stringify(events)).not.toContain('sourceTaskId')
    expect(JSON.stringify(events)).not.toContain('relatedTaskId')
    expect(JSON.stringify(events)).not.toContain('Private agency note')
    expect(events[0].metadata).toEqual({
      actionId: 'action-1',
      status: 'answered',
    })
  })

  it('keeps internal review events out of the client-visible activity policy', () => {
    expect(isActivityEventVisibleToClient(ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_READY_FOR_REVIEW)).toBe(false)
    expect(isActivityEventVisibleToClient(ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED)).toBe(false)
    expect(isActivityEventVisibleToClient(ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED)).toBe(true)
    expect(isActivityEventVisibleToClient(ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_RESOLVED)).toBe(true)
  })

  it('rejects invalid event types and inaccessible clients', () => {
    const repositories = createRepositories()

    expect(() => recordActivityEvent({
      clientId: IDS.CLIENT_A,
      eventType: 'invalid_event',
      idGenerator: () => IDS.EVENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Activity event type is invalid.')

    expect(() => recordActivityEvent({
      clientId: IDS.CLIENT_B,
      eventType: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      idGenerator: () => IDS.EVENT_A,
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('Client activity is not available.')
  })
})
