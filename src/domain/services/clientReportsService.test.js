import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { getClientReportsPage } from './clientReportsService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  REPORT_ARCHIVED: '44444444-4444-4444-8444-444444444444',
  REPORT_DRAFT: '55555555-5555-4555-8555-555555555555',
  REPORT_PUBLISHED: '66666666-6666-4666-8666-666666666666',
  REPORT_READY: '77777777-7777-4777-8777-777777777777',
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
    reports: [
      {
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_ARCHIVED,
        period_end: '2026-03-31',
        period_start: '2026-03-01',
        status: REPORT_STATUSES.ARCHIVED,
        summary: 'Archived summary',
        title: 'March Summary',
      },
      {
        client_decisions_needed: 'Approve next budget.',
        client_id: IDS.CLIENT_A,
        dashboard_url: 'https://example.com/dashboard',
        id: IDS.REPORT_PUBLISHED,
        next_actions: 'Scale winning campaign.',
        pdf_url: 'https://example.com/report.pdf',
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        problems: 'More conversion data is needed.',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Published summary',
        title: 'April Summary',
        what_we_did: 'Optimized campaigns.',
        results: 'Generated 119 leads.',
        wins: 'Campaign launched.',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.REPORT_DRAFT,
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft summary',
        title: 'May Draft',
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.REPORT_READY,
        period_end: '2026-06-30',
        period_start: '2026-06-01',
        status: REPORT_STATUSES.READY,
        summary: 'Ready summary',
        title: 'June Ready',
      },
    ],
    ...overrides,
  }

  return {
    clients: createEntityRepository(data.clients),
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

describe('getClientReportsPage', () => {
  it('returns only published and archived reports sorted by latest period', () => {
    const page = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.reports.map((report) => report.title)).toEqual(['April Summary', 'March Summary'])
    expect(page.selectedReport.title).toBe('April Summary')
    expect(page.selectedReport.whatWeDid).toBe('Optimized campaigns.')
    expect(page.selectedReport.results).toBe('Generated 119 leads.')
    expect(JSON.stringify(page)).not.toContain('May Draft')
    expect(JSON.stringify(page)).not.toContain('June Ready')
  })

  it('selects a visible report by id', () => {
    const page = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      reportId: IDS.REPORT_ARCHIVED,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.selectedReport.title).toBe('March Summary')
    expect(page.latestReport.title).toBe('April Summary')
  })

  it('does not select draft or ready reports', () => {
    const page = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      reportId: IDS.REPORT_DRAFT,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.reason).toBe('report_not_found')
    expect(page.selectedReport).toBeNull()
  })

  it('denies cross-client access', () => {
    const page = getClientReportsPage({
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
