import { describe, expect, it } from 'vitest'

import {
  CLIENT_UPDATE_TYPES,
  VISIBILITY,
} from '../../entities/update'
import { USER_ROLES } from '../../entities/profile'
import {
  createClientUpdate,
  getClientUpdatesPage,
  hideClientUpdate,
  listAdminClientUpdatesWorkspace,
  updateClientUpdate,
} from './clientUpdatesService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  FILE_LINK: '33333333-3333-4333-8333-333333333333',
  PROJECT: '44444444-4444-4444-8444-444444444444',
  REPORT: '55555555-5555-4555-8555-555555555555',
  UPDATE: '99999999-9999-4999-8999-999999999999',
})

function createEntityRepository(records = []) {
  const storedRecords = records.map((record) => ({ ...record }))

  return {
    findById(id) {
      return storedRecords.find((record) => record.id === id) ?? null
    },
    list() {
      return storedRecords
    },
    listByClientId(clientId) {
      return storedRecords.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = storedRecords.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        storedRecords[index] = { ...storedRecords[index], ...record }
      } else {
        storedRecords.push(record)
      }

      return record
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    clientFileLinks: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.FILE_LINK,
        title: 'Published creative folder',
      },
    ]),
    clients: createEntityRepository([
      {
        agency_id: 'agency-1',
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
      },
      {
        agency_id: 'agency-1',
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
      },
    ]),
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.PROJECT,
        name: 'May Campaign',
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.REPORT,
        title: 'April Report',
      },
    ]),
    updates: createEntityRepository([
      {
        body: 'Report is now available.',
        client_id: IDS.CLIENT_A,
        id: '66666666-6666-4666-8666-666666666666',
        published_at: '2026-05-17T10:00:00.000Z',
        related_report_id: IDS.REPORT,
        title: 'April report published',
        type: CLIENT_UPDATE_TYPES.REPORT_PUBLISHED,
        visibility: VISIBILITY.CLIENT_VISIBLE,
        what_next: 'Review the report before the next call.',
      },
      {
        body: 'We launched the creative test.',
        client_id: IDS.CLIENT_A,
        id: '77777777-7777-4777-8777-777777777777',
        project_id: IDS.PROJECT,
        published_at: '2026-05-16T10:00:00.000Z',
        related_file_link_id: IDS.FILE_LINK,
        title: 'Creative test launched',
        type: CLIENT_UPDATE_TYPES.LAUNCH_UPDATE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
        what_changed: 'The second creative batch went live.',
      },
      {
        body: 'Internal-only tracking note.',
        client_id: IDS.CLIENT_A,
        id: '88888888-8888-4888-8888-888888888888',
        published_at: '2026-05-18T10:00:00.000Z',
        title: 'Internal tracking note',
        type: CLIENT_UPDATE_TYPES.ISSUE_UPDATE,
        visibility: VISIBILITY.INTERNAL,
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

function createAdminViewer() {
  return {
    agencyId: 'agency-1',
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  }
}

describe('getClientUpdatesPage', () => {
  it('returns only curated client-visible updates sorted by published date', () => {
    const page = getClientUpdatesPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.updates.map((update) => update.title)).toEqual([
      'April report published',
      'Creative test launched',
    ])
    expect(page.latestUpdate.title).toBe('April report published')
    expect(page.updates[0]).toMatchObject({
      relatedReportTitle: 'April Report',
      typeMeta: {
        label: 'Report published',
      },
    })
    expect(page.updates[1]).toMatchObject({
      projectName: 'May Campaign',
      relatedFileLinkTitle: 'Published creative folder',
      whatChanged: 'The second creative batch went live.',
    })
    expect(JSON.stringify(page)).not.toContain('Internal tracking note')
  })

  it('denies cross-client access', () => {
    const page = getClientUpdatesPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('returns admin curated updates including hidden internal records for the selected client', () => {
    const page = listAdminClientUpdatesWorkspace({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.updates.map((update) => update.title)).toEqual([
      'Internal tracking note',
      'April report published',
      'Creative test launched',
    ])
    expect(page.counts).toMatchObject({
      all: 3,
      clientVisible: 2,
      internal: 1,
    })
  })

  it('lets agency admins create, edit, and hide client updates', () => {
    const repositories = createRepositories({
      updates: createEntityRepository([]),
    })

    const createdUpdate = createClientUpdate({
      idGenerator: () => IDS.UPDATE,
      input: {
        body: 'Weekly summary for the client.',
        clientId: IDS.CLIENT_A,
        title: 'Weekly update',
        type: CLIENT_UPDATE_TYPES.WEEKLY_UPDATE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
        whatNext: 'Approve the next creative direction.',
      },
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(createdUpdate).toMatchObject({
      publishedAt: '2026-05-18T10:00:00.000Z',
      title: 'Weekly update',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })

    const updatedUpdate = updateClientUpdate({
      input: {
        ...createdUpdate,
        title: 'Weekly client update',
        visibility: VISIBILITY.CLIENT_VISIBLE,
        whatChanged: 'Creative testing is ahead of schedule.',
      },
      now: () => '2026-05-18T11:00:00.000Z',
      repositories,
      updateId: IDS.UPDATE,
      viewer: createAdminViewer(),
    })

    expect(updatedUpdate).toMatchObject({
      title: 'Weekly client update',
      updatedAt: '2026-05-18T11:00:00.000Z',
      whatChanged: 'Creative testing is ahead of schedule.',
    })

    const hiddenUpdate = hideClientUpdate({
      now: () => '2026-05-18T12:00:00.000Z',
      repositories,
      updateId: IDS.UPDATE,
      viewer: createAdminViewer(),
    })

    expect(hiddenUpdate).toMatchObject({
      updatedAt: '2026-05-18T12:00:00.000Z',
      visibility: VISIBILITY.INTERNAL,
    })
  })

  it('denies client users from admin update management', () => {
    const repositories = createRepositories()

    expect(() => listAdminClientUpdatesWorkspace({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only agency admins can manage client updates.')

    expect(() => createClientUpdate({
      idGenerator: () => IDS.UPDATE,
      input: {
        clientId: IDS.CLIENT_A,
        title: 'Not allowed',
      },
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only agency admins can manage client updates.')
  })
})
