import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { USER_ROLES } from '../../entities/profile'
import { VISIBILITY } from '../../entities/update'
import {
  deleteAdminDashboardLink,
  listAdminDashboardLinks,
  saveAdminDashboardLink,
  updateAdminDashboardLinkStatus,
} from './dashboardLinkService'
import { getClientDashboardPage } from './clientDashboardService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  DASHBOARD_A: '44444444-4444-4444-8444-444444444444',
  DASHBOARD_B: '55555555-5555-4555-8555-555555555555',
  USER_ADMIN: '66666666-6666-4666-8666-666666666666',
  USER_CLIENT: '77777777-7777-4777-8777-777777777777',
})

function createEntityRepository(records) {
  const items = [...records]

  return {
    deleteById(id) {
      const index = items.findIndex((item) => item.id === id)

      if (index < 0) {
        return false
      }

      items.splice(index, 1)
      return true
    },
    findById(id) {
      return items.find((record) => record.id === id) ?? null
    },
    list() {
      return items
    },
    listByClientId(clientId) {
      return items.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = items.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        items[index] = { ...items[index], ...record }
      } else {
        items.push(record)
      }

      return record
    },
  }
}

function createRepositories() {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        status: CLIENT_STATUSES.ON_TRACK,
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        status: CLIENT_STATUSES.ON_TRACK,
      },
    ]),
    dashboardLinks: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-01T09:00:00.000Z',
        embed_url: 'https://example.com/embed-a',
        fallback_message: 'Fallback A',
        id: IDS.DASHBOARD_A,
        name: 'Dashboard A',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/a',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        updated_at: '2026-05-01T09:00:00.000Z',
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-01T09:00:00.000Z',
        embed_url: '',
        fallback_message: 'Fallback B',
        id: IDS.DASHBOARD_B,
        name: 'Dashboard B',
        provider: DASHBOARD_PROVIDERS.CUSTOM,
        public_url: 'https://example.com/b',
        show_on_overview: false,
        status: DASHBOARD_LINK_STATUSES.DRAFT,
        updated_at: '2026-05-01T09:00:00.000Z',
        visibility: VISIBILITY.INTERNAL,
      },
    ]),
    reports: createEntityRepository([]),
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
    clientId: IDS.CLIENT_A,
    clientIds: [IDS.CLIENT_A],
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER_CLIENT,
  }
}

describe('dashboardLinkService', () => {
  it('lists dashboard links with client and status metadata for agency admins', () => {
    const rows = listAdminDashboardLinks({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      client: {
        id: IDS.CLIENT_A,
        name: 'Client A',
      },
      name: 'Dashboard A',
      providerMeta: {
        label: 'Looker Studio',
      },
      statusMeta: {
        label: 'Active',
      },
    })
  })

  it('creates a dashboard link and makes it the overview dashboard when requested', () => {
    const repositories = createRepositories()
    const dashboardLink = saveAdminDashboardLink({
      idGenerator: () => '77777777-7777-4777-8777-777777777777',
      input: {
        clientId: IDS.CLIENT_A,
        embedUrl: 'https://example.com/embed-new',
        name: 'New Dashboard',
        provider: DASHBOARD_PROVIDERS.DATABOX,
        publicUrl: 'https://example.com/new',
        showOnOverview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      now: () => '2026-05-08T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(dashboardLink.id).toBe('77777777-7777-4777-8777-777777777777')
    expect(dashboardLink.showOnOverview).toBe(true)
    expect(repositories.dashboardLinks.findById(IDS.DASHBOARD_A).show_on_overview).toBe(false)
  })

  it('blocks active dashboards without any usable URL', () => {
    expect(() => saveAdminDashboardLink({
      idGenerator: () => '77777777-7777-4777-8777-777777777777',
      input: {
        clientId: IDS.CLIENT_A,
        name: 'Broken Dashboard',
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Active or unavailable dashboards must include a public or embed URL.')
  })

  it('updates status and deletes dashboard links through admin-only operations', () => {
    const repositories = createRepositories()

    const updated = updateAdminDashboardLinkStatus({
      dashboardLinkId: IDS.DASHBOARD_A,
      repositories,
      status: DASHBOARD_LINK_STATUSES.UNAVAILABLE,
      viewer: createAdminViewer(),
    })

    expect(updated.status).toBe(DASHBOARD_LINK_STATUSES.UNAVAILABLE)
    expect(deleteAdminDashboardLink({
      dashboardLinkId: IDS.DASHBOARD_B,
      repositories,
      viewer: createAdminViewer(),
    })).toBe(true)
    expect(repositories.dashboardLinks.findById(IDS.DASHBOARD_B)).toBeNull()
  })

  it('publishes an admin-created active dashboard to the client dashboard surface', () => {
    const repositories = createRepositories()

    const dashboardLink = saveAdminDashboardLink({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        description: 'Executive marketing performance overview.',
        embedUrl: 'https://example.com/embed-client',
        name: 'Client Marketing Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        publicUrl: 'https://example.com/client-dashboard',
        showOnOverview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      now: () => '2026-05-09T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    const page = getClientDashboardPage({
      clientId: IDS.CLIENT_A,
      dashboardId: dashboardLink.id,
      repositories,
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.dashboard).toMatchObject({
      description: 'Executive marketing performance overview.',
      embedUrl: 'https://example.com/embed-client',
      id: dashboardLink.id,
      isAvailable: true,
      name: 'Client Marketing Dashboard',
      publicUrl: 'https://example.com/client-dashboard',
    })
    expect(JSON.stringify(page)).not.toContain('Dashboard B')
  })
})
