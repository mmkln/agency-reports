import { describe, expect, it } from 'vitest'

import {
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import {
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_TYPES,
} from '../../entities/client-file-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { getClientProjectsPage } from './clientProjectsService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  PROJECT_A: '33333333-3333-4333-8333-333333333333',
  PROJECT_B: '44444444-4444-4444-8444-444444444444',
  WORK_A: '55555555-5555-4555-8555-555555555555',
  WORK_B: '66666666-6666-4666-8666-666666666666',
})

function createEntityRepository(records = []) {
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
    clientFileLinks: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        description: 'Published creative review folder.',
        id: '99999999-9999-4999-8999-999999999999',
        project_id: IDS.PROJECT_A,
        status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
        title: 'Creative folder',
        type: CLIENT_FILE_LINK_TYPES.DELIVERABLE,
        url: 'https://drive.google.com/creative',
        visibility: 'client_visible',
      },
      {
        client_id: IDS.CLIENT_A,
        id: '12121212-1212-4121-8121-121212121212',
        project_id: IDS.PROJECT_A,
        status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
        title: 'Internal folder',
        type: CLIENT_FILE_LINK_TYPES.SHARED_LINK,
        url: 'https://drive.google.com/internal',
        visibility: 'internal',
      },
    ]),
    clientWorkItems: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_A,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
        summary: 'Review the first creative direction.',
        title: 'Creative review',
        updated_at: '2026-05-17T10:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.WORK_B,
        project_id: IDS.PROJECT_A,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
        status: CLIENT_WORK_ITEM_STATUSES.DELIVERED,
        summary: 'Tracking baseline delivered.',
        title: 'Tracking setup',
        updated_at: '2026-05-16T10:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        id: '77777777-7777-4777-8777-777777777777',
        project_id: IDS.PROJECT_B,
        publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
        status: CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
        summary: 'Internal draft.',
        title: 'Draft SEO work',
      },
    ]),
    neededFromClient: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: '88888888-8888-4888-8888-888888888888',
        related_work_item_id: IDS.WORK_A,
        status: NEEDED_ACTION_STATUSES.PENDING,
        title: 'Approve creative direction',
      },
    ]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        description: 'Launch and optimize the May paid campaign.',
        end_date: '2026-05-27',
        id: IDS.PROJECT_A,
        name: 'May Campaign',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.PROJECT_B,
        name: 'SEO Cleanup',
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

describe('getClientProjectsPage', () => {
  it('groups published client-visible work into project view models', () => {
    const page = getClientProjectsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.projects).toHaveLength(1)
    expect(page.selectedProject).toMatchObject({
      activeWorkItems: [
        expect.objectContaining({
          title: 'Creative review',
        }),
      ],
      clientActions: [
        expect.objectContaining({
          title: 'Approve creative direction',
        }),
      ],
      fileLinks: [
        expect.objectContaining({
          title: 'Creative folder',
        }),
      ],
      id: IDS.PROJECT_A,
      name: 'May Campaign',
      progressPercent: 50,
      status: CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
      targetDate: '2026-05-27',
    })
    expect(JSON.stringify(page)).not.toContain('Draft SEO work')
  })

  it('selects a requested project or returns a controlled not-found reason', () => {
    const page = getClientProjectsPage({
      clientId: IDS.CLIENT_A,
      projectId: '99999999-9999-4999-8999-999999999999',
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.reason).toBe('project_not_found')
    expect(page.selectedProject).toBeNull()
  })

  it('denies cross-client access', () => {
    const page = getClientProjectsPage({
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
