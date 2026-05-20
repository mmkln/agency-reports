import { describe, expect, it } from 'vitest'

import {
  CLIENT_REQUEST_STATUSES,
  CLIENT_REQUEST_TYPES,
} from '../../entities/client-request'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import {
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import {
  createBusinessDeletionRequest,
  createClientRequest,
  getClientRequestsPage,
  listAdminClientRequestsWorkspace,
  updateClientRequestTriage,
} from './clientRequestsService'

const IDS = Object.freeze({
  ACTIVITY: '99999999-9999-4999-8999-999999999999',
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  NEEDED_ACTION: '77777777-7777-4777-8777-777777777777',
  REQUEST_A: '33333333-3333-4333-8333-333333333333',
  REQUEST_B: '44444444-4444-4444-8444-444444444444',
  USER: '55555555-5555-4555-8555-555555555555',
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
    clientRequests: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-16T10:00:00.000Z',
        description: 'Please add a landing page variant.',
        id: IDS.REQUEST_A,
        request_type: CLIENT_REQUEST_TYPES.NEW_WORK,
        status: CLIENT_REQUEST_STATUSES.SUBMITTED,
        title: 'Landing page variant',
        updated_at: '2026-05-16T10:00:00.000Z',
      },
      {
        agency_response: 'We converted this into project work.',
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-15T10:00:00.000Z',
        description: 'Update campaign copy.',
        id: IDS.REQUEST_B,
        request_type: CLIENT_REQUEST_TYPES.CHANGE_REQUEST,
        status: CLIENT_REQUEST_STATUSES.CONVERTED,
        title: 'Update campaign copy',
        updated_at: '2026-05-17T10:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_B,
        created_at: '2026-05-17T10:00:00.000Z',
        description: 'Other client request.',
        id: '66666666-6666-4666-8666-666666666666',
        request_type: CLIENT_REQUEST_TYPES.QUESTION,
        status: CLIENT_REQUEST_STATUSES.SUBMITTED,
        title: 'Other client request',
      },
    ]),
    activityEvents: createEntityRepository([]),
    clientMemberships: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: '12121212-1212-4121-8121-121212121212',
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER,
      },
    ]),
    clients: createEntityRepository([
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
      },
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
      },
    ]),
    neededFromClient: createEntityRepository([]),
    tasks: createEntityRepository([]),
    ...overrides,
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    email: 'client@example.com',
    name: 'Client User',
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER,
  }
}

function createAdminViewer() {
  return {
    email: 'admin@example.com',
    agencyId: 'agency-a',
    name: 'Agency Admin',
    role: USER_ROLES.AGENCY_ADMIN,
    userId: IDS.USER,
  }
}

describe('clientRequestsService', () => {
  it('returns only the authenticated client initiated requests', () => {
    const page = getClientRequestsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.requests.map((request) => request.title)).toEqual([
      'Landing page variant',
      'Update campaign copy',
    ])
    expect(page.counts).toMatchObject({
      all: 2,
      open: 2,
      submitted: 1,
    })
    expect(JSON.stringify(page)).not.toContain('Other client request')
  })

  it('creates a submitted client request without creating internal tasks', () => {
    const repositories = createRepositories({
      clientRequests: createEntityRepository([]),
      tasks: createEntityRepository([]),
    })

    const request = createClientRequest({
      idGenerator: () => IDS.REQUEST_A,
      input: {
        clientId: IDS.CLIENT_A,
        description: 'Please create a second landing page variant.',
        desiredDueDate: '2026-05-30',
        referenceLink: 'https://example.com/reference',
        requestType: CLIENT_REQUEST_TYPES.NEW_WORK,
        title: 'Create landing page variant',
      },
      now: () => '2026-05-17T12:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })

    expect(request).toMatchObject({
      description: 'Please create a second landing page variant.',
      desiredDueDate: '2026-05-30',
      requestType: CLIENT_REQUEST_TYPES.NEW_WORK,
      status: CLIENT_REQUEST_STATUSES.SUBMITTED,
      title: 'Create landing page variant',
    })
    expect(repositories.clientRequests.listByClientId(IDS.CLIENT_A)).toHaveLength(1)
    expect(repositories.tasks.list()).toHaveLength(0)
  })

  it('lets a workspace owner submit a business deletion request for admin review', () => {
    const repositories = createRepositories({
      clientRequests: createEntityRepository([]),
    })

    const request = createBusinessDeletionRequest({
      activityIdGenerator: () => IDS.ACTIVITY,
      idGenerator: () => IDS.REQUEST_A,
      input: {
        clientId: IDS.CLIENT_A,
      },
      now: () => '2026-05-20T12:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })

    expect(request).toMatchObject({
      requestType: CLIENT_REQUEST_TYPES.BUSINESS_DELETION,
      status: CLIENT_REQUEST_STATUSES.SUBMITTED,
      title: 'Business deletion request - Client A',
    })
    expect(listAdminClientRequestsWorkspace({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    }).requests).toEqual([
      expect.objectContaining({
        clientName: 'Client A',
        requestType: CLIENT_REQUEST_TYPES.BUSINESS_DELETION,
      }),
    ])
    expect(repositories.activityEvents.findById(IDS.ACTIVITY)).toMatchObject({
      client_id: IDS.CLIENT_A,
      event_type: 'client_request_created',
      metadata: {
        requestId: IDS.REQUEST_A,
        type: CLIENT_REQUEST_TYPES.BUSINESS_DELETION,
      },
    })
  })

  it('blocks non-owners and duplicate business deletion requests', () => {
    const repositories = createRepositories({
      clientMemberships: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '12121212-1212-4121-8121-121212121212',
          role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
          user_id: IDS.USER,
        },
      ]),
    })

    expect(() => createBusinessDeletionRequest({
      idGenerator: () => IDS.REQUEST_A,
      input: {
        clientId: IDS.CLIENT_A,
      },
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only workspace owners can request business deletion.')

    const ownerRepositories = createRepositories({
      clientRequests: createEntityRepository([]),
    })

    createBusinessDeletionRequest({
      idGenerator: () => IDS.REQUEST_A,
      input: {
        clientId: IDS.CLIENT_A,
      },
      repositories: ownerRepositories,
      viewer: createClientViewer(),
    })

    expect(() => createBusinessDeletionRequest({
      idGenerator: () => IDS.REQUEST_B,
      input: {
        clientId: IDS.CLIENT_A,
      },
      repositories: ownerRepositories,
      viewer: createClientViewer(),
    })).toThrow('A business deletion request is already open.')
  })

  it('denies cross-client access and submission', () => {
    const repositories = createRepositories()
    const viewer = createClientViewer(IDS.CLIENT_A)

    expect(getClientRequestsPage({
      clientId: IDS.CLIENT_B,
      repositories,
      viewer,
    })).toEqual({
      reason: 'access_denied',
      status: 'error',
    })

    expect(() => createClientRequest({
      idGenerator: () => IDS.REQUEST_A,
      input: {
        clientId: IDS.CLIENT_B,
        description: 'Not allowed.',
        title: 'Cross client request',
      },
      repositories,
      viewer,
    })).toThrow('Only client users can submit requests for their client.')
  })

  it('lets agency admins triage client-submitted requests without exposing other workflow objects', () => {
    const repositories = createRepositories()

    const workspace = listAdminClientRequestsWorkspace({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(workspace.status).toBe('ready')
    expect(workspace.requests.map((request) => request.title)).toEqual([
      'Landing page variant',
      'Update campaign copy',
    ])
    expect(workspace.requests[0]).toMatchObject({
      clientName: 'Client A',
      status: CLIENT_REQUEST_STATUSES.SUBMITTED,
    })
    expect(JSON.stringify(workspace)).not.toContain('Other client request')
  })

  it('updates client request triage status with auditable agency history', () => {
    const repositories = createRepositories()

    const updatedRequest = updateClientRequestTriage({
      input: {
        agencyResponse: 'We are reviewing scope and timing.',
        status: CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
      },
      now: () => '2026-05-18T09:00:00.000Z',
      repositories,
      requestId: IDS.REQUEST_A,
      viewer: createAdminViewer(),
    })

    expect(updatedRequest).toMatchObject({
      agencyResponse: 'We are reviewing scope and timing.',
      status: CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
      updatedAt: '2026-05-18T09:00:00.000Z',
    })
    expect(updatedRequest.responseHistory.at(-1)).toMatchObject({
      created_at: '2026-05-18T09:00:00.000Z',
      metadata: {
        actor_role: USER_ROLES.AGENCY_ADMIN,
        status: CLIENT_REQUEST_STATUSES.UNDER_REVIEW,
      },
      type: 'agency_triaged',
    })
  })

  it('creates a linked Action Needed clarification when a request waits on the client', () => {
    const repositories = createRepositories()

    const updatedRequest = updateClientRequestTriage({
      idGenerator: () => IDS.NEEDED_ACTION,
      input: {
        agencyResponse: 'Please confirm which offer should be used before we scope this request.',
        status: CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
      },
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      requestId: IDS.REQUEST_A,
      viewer: createAdminViewer(),
    })

    expect(updatedRequest).toMatchObject({
      relatedNeededActionId: IDS.NEEDED_ACTION,
      status: CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
    })
    expect(updatedRequest.responseHistory.at(-1).metadata).toMatchObject({
      related_needed_action_id: IDS.NEEDED_ACTION,
    })

    const neededAction = repositories.neededFromClient.findById(IDS.NEEDED_ACTION)

    expect(neededAction).toMatchObject({
      client_id: IDS.CLIENT_A,
      description: 'Please confirm which offer should be used before we scope this request.',
      related_request_id: IDS.REQUEST_A,
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Clarification needed: Landing page variant',
      type: NEEDED_ACTION_TYPES.FEEDBACK,
    })
  })

  it('reuses an open linked clarification action instead of creating duplicates', () => {
    const repositories = createRepositories({
      clientRequests: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          created_at: '2026-05-16T10:00:00.000Z',
          description: 'Please add a landing page variant.',
          id: IDS.REQUEST_A,
          related_needed_action_id: IDS.NEEDED_ACTION,
          request_type: CLIENT_REQUEST_TYPES.NEW_WORK,
          status: CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
          title: 'Landing page variant',
          updated_at: '2026-05-16T10:00:00.000Z',
        },
      ]),
      neededFromClient: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          created_at: '2026-05-16T10:05:00.000Z',
          description: 'Existing clarification.',
          id: IDS.NEEDED_ACTION,
          related_request_id: IDS.REQUEST_A,
          status: NEEDED_ACTION_STATUSES.PENDING,
          title: 'Clarification needed: Landing page variant',
          type: NEEDED_ACTION_TYPES.FEEDBACK,
          updated_at: '2026-05-16T10:05:00.000Z',
        },
      ]),
    })

    const updatedRequest = updateClientRequestTriage({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        agencyResponse: 'Still waiting on offer details.',
        status: CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT,
      },
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      requestId: IDS.REQUEST_A,
      viewer: createAdminViewer(),
    })

    expect(updatedRequest.relatedNeededActionId).toBe(IDS.NEEDED_ACTION)
    expect(repositories.neededFromClient.listByClientId(IDS.CLIENT_A)).toHaveLength(1)
  })

  it('denies client users from admin request triage', () => {
    const repositories = createRepositories()

    expect(() => listAdminClientRequestsWorkspace({
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only admins can manage requests.')

    expect(() => updateClientRequestTriage({
      input: {
        status: CLIENT_REQUEST_STATUSES.ACCEPTED,
      },
      repositories,
      requestId: IDS.REQUEST_A,
      viewer: createClientViewer(),
    })).toThrow('Only admins can manage requests.')
  })
})
