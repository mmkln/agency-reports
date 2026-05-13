import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { VISIBILITY } from '../../entities/update'
import { getClientDashboardPage } from './clientDashboardService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  DASHBOARD_ACTIVE: '44444444-4444-4444-8444-444444444444',
  DASHBOARD_DRAFT: '55555555-5555-4555-8555-555555555555',
  DASHBOARD_UNAVAILABLE: '66666666-6666-4666-8666-666666666666',
  REPORT_DRAFT: '77777777-7777-4777-8777-777777777777',
  REPORT_PUBLISHED: '88888888-8888-4888-8888-888888888888',
})

function createEntityRepository(records) {
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
  const data = {
    clients: [
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
    ],
    dashboardLinks: [
      {
        client_id: IDS.CLIENT_A,
        embed_url: 'https://example.com/embed',
        fallback_message: 'Dashboard fallback',
        id: IDS.DASHBOARD_ACTIVE,
        name: 'Active Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/full',
        show_on_overview: true,
        status: DASHBOARD_LINK_STATUSES.ACTIVE,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
      {
        client_id: IDS.CLIENT_A,
        embed_url: 'https://example.com/draft-embed',
        fallback_message: 'Draft fallback',
        id: IDS.DASHBOARD_DRAFT,
        name: 'Draft Dashboard',
        provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
        public_url: 'https://example.com/draft',
        show_on_overview: false,
        status: DASHBOARD_LINK_STATUSES.DRAFT,
        visibility: VISIBILITY.CLIENT_VISIBLE,
      },
    ],
    reports: [
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/full',
        id: IDS.REPORT_PUBLISHED,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Published summary',
        title: 'April Summary',
      },
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/full',
        id: IDS.REPORT_DRAFT,
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft summary',
        title: 'May Draft',
      },
    ],
    ...overrides,
  }

  return {
    clients: createEntityRepository(data.clients),
    dashboardLinks: createEntityRepository(data.dashboardLinks),
    reports: createEntityRepository(data.reports),
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
  }
}

describe('getClientDashboardPage', () => {
  it('returns the primary visible dashboard and latest visible report', () => {
    const page = getClientDashboardPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.dashboard.name).toBe('Active Dashboard')
    expect(page.dashboard.embedUrl).toBe('https://example.com/embed')
    expect(page.latestReport.title).toBe('April Summary')
    expect(JSON.stringify(page)).not.toContain('Draft Dashboard')
    expect(JSON.stringify(page)).not.toContain('May Draft')
  })

  it('returns unavailable dashboards as controlled fallback surfaces', () => {
    const page = getClientDashboardPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories({
        dashboardLinks: [
          {
            client_id: IDS.CLIENT_A,
            embed_url: '',
            fallback_message: 'Provider access needs to be refreshed.',
            id: IDS.DASHBOARD_UNAVAILABLE,
            name: 'Unavailable Dashboard',
            provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
            public_url: 'https://example.com/full',
            show_on_overview: true,
            status: DASHBOARD_LINK_STATUSES.UNAVAILABLE,
            visibility: VISIBILITY.CLIENT_VISIBLE,
          },
        ],
      }),
      viewer: createClientViewer(),
    })

    expect(page.dashboard).toMatchObject({
      fallbackMessage: 'Provider access needs to be refreshed.',
      isAvailable: false,
      name: 'Unavailable Dashboard',
    })
  })

  it('denies cross-client access', () => {
    const page = getClientDashboardPage({
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
