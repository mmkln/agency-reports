import { describe, expect, it } from 'vitest'

import {
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_TYPES,
} from '../../entities/client-file-link'
import { USER_ROLES } from '../../entities/profile'
import { VISIBILITY } from '../../entities/update'
import {
  archiveClientFileLink,
  createClientFileLink,
  getClientFilesLinksPage,
  listAdminClientFileLinksWorkspace,
  listClientVisibleFileLinks,
  updateClientFileLink,
} from './clientFilesLinksService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  PROJECT: '33333333-3333-4333-8333-333333333333',
  REPORT: '44444444-4444-4444-8444-444444444444',
  FILE_LINK: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
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
        description: 'Review the latest creative batch.',
        display_order: 20,
        id: '55555555-5555-4555-8555-555555555555',
        project_id: IDS.PROJECT,
        status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
        title: 'Creative batch',
        type: CLIENT_FILE_LINK_TYPES.DELIVERABLE,
        updated_at: '2026-05-17T09:00:00.000Z',
        url: 'https://drive.google.com/creative',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: '66666666-6666-4666-8666-666666666666',
        related_report_id: IDS.REPORT,
        status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
        title: 'April report PDF',
        type: CLIENT_FILE_LINK_TYPES.REPORT,
        url: 'https://example.com/report.pdf',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        id: '77777777-7777-4777-8777-777777777777',
        status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
        title: 'Internal notes',
        type: CLIENT_FILE_LINK_TYPES.SHARED_LINK,
        url: 'https://example.com/internal',
        visibility: VISIBILITY.INTERNAL,
      },
      {
        client_id: IDS.CLIENT_A,
        id: '88888888-8888-4888-8888-888888888888',
        status: CLIENT_FILE_LINK_STATUSES.ARCHIVED,
        title: 'Archived contract',
        type: CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN,
        url: 'https://example.com/contract',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ]),
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
    name: 'Agency Admin',
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  }
}

describe('clientFilesLinksService', () => {
  it('returns only visible active client files and links with safe metadata', () => {
    const page = getClientFilesLinksPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.fileLinks.map((fileLink) => fileLink.title)).toEqual([
      'Creative batch',
      'April report PDF',
    ])
    expect(page.fileLinks[0]).toMatchObject({
      projectName: 'May Campaign',
      typeMeta: {
        label: 'Deliverable',
      },
    })
    expect(page.fileLinks[1]).toMatchObject({
      relatedReportTitle: 'April Report',
    })
    expect(page.counts).toMatchObject({
      all: 2,
      deliverables: 1,
      reports: 1,
    })
    expect(JSON.stringify(page)).not.toContain('Internal notes')
    expect(JSON.stringify(page)).not.toContain('Archived contract')
  })

  it('filters file links by project for project detail use', () => {
    const result = listClientVisibleFileLinks({
      clientId: IDS.CLIENT_A,
      projectId: IDS.PROJECT,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(result.status).toBe('ready')
    expect(result.fileLinks.map((fileLink) => fileLink.title)).toEqual(['Creative batch'])
  })

  it('denies cross-client access', () => {
    const page = getClientFilesLinksPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('returns all admin-owned files and links for a client including internal and archived records', () => {
    const page = listAdminClientFileLinksWorkspace({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.fileLinks.map((fileLink) => fileLink.title)).toEqual([
      'Creative batch',
      'April report PDF',
      'Internal notes',
      'Archived contract',
    ])
    expect(page.counts).toMatchObject({
      all: 4,
      archived: 1,
      clientVisible: 3,
      internal: 1,
    })
  })

  it('lets agency admins create, update, and archive client-visible resources', () => {
    const repositories = createRepositories({
      clientFileLinks: createEntityRepository([]),
    })

    const createdFileLink = createClientFileLink({
      idGenerator: () => IDS.FILE_LINK,
      input: {
        clientId: IDS.CLIENT_A,
        description: 'Published brand folder.',
        title: 'Brand folder',
        type: CLIENT_FILE_LINK_TYPES.BRAND_ASSET,
        url: 'https://drive.google.com/brand',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      now: () => '2026-05-18T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(createdFileLink).toMatchObject({
      status: CLIENT_FILE_LINK_STATUSES.ACTIVE,
      title: 'Brand folder',
      type: CLIENT_FILE_LINK_TYPES.BRAND_ASSET,
      visibility: VISIBILITY.CLIENT_VISIBLE,
    })

    const updatedFileLink = updateClientFileLink({
      fileLinkId: IDS.FILE_LINK,
      input: {
        ...createdFileLink,
        status: CLIENT_FILE_LINK_STATUSES.UNAVAILABLE,
        title: 'Brand asset folder',
        url: 'https://drive.google.com/brand-v2',
      },
      now: () => '2026-05-18T11:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedFileLink).toMatchObject({
      status: CLIENT_FILE_LINK_STATUSES.UNAVAILABLE,
      title: 'Brand asset folder',
      updatedAt: '2026-05-18T11:00:00.000Z',
      url: 'https://drive.google.com/brand-v2',
    })

    const archivedFileLink = archiveClientFileLink({
      fileLinkId: IDS.FILE_LINK,
      now: () => '2026-05-18T12:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(archivedFileLink).toMatchObject({
      status: CLIENT_FILE_LINK_STATUSES.ARCHIVED,
      updatedAt: '2026-05-18T12:00:00.000Z',
    })
  })

  it('denies client users from admin file and link management', () => {
    const repositories = createRepositories()

    expect(() => listAdminClientFileLinksWorkspace({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only agency admins can manage files and links.')

    expect(() => createClientFileLink({
      idGenerator: () => IDS.FILE_LINK,
      input: {
        clientId: IDS.CLIENT_A,
        title: 'Not allowed',
        url: 'https://example.com',
      },
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Only agency admins can manage files and links.')
  })
})
