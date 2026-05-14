import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import {
  deleteAdminReport,
  listAdminReports,
  saveAdminReport,
  updateAdminReportStatus,
} from './adminReportService'
import { getClientReportsPage } from './clientReportsService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT_A: '22222222-2222-4222-8222-222222222222',
  CLIENT_B: '33333333-3333-4333-8333-333333333333',
  OTHER_AGENCY: '99999999-9999-4999-8999-999999999999',
  REPORT_DRAFT: '44444444-4444-4444-8444-444444444444',
  REPORT_PUBLISHED: '55555555-5555-4555-8555-555555555555',
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
        agency_id: IDS.OTHER_AGENCY,
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
        status: CLIENT_STATUSES.ON_TRACK,
      },
    ]),
    reports: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-01T09:00:00.000Z',
        id: IDS.REPORT_PUBLISHED,
        period_end: '2026-04-30',
        period_start: '2026-04-01',
        published_at: '2026-05-04T09:00:00.000Z',
        status: REPORT_STATUSES.PUBLISHED,
        summary: 'Published summary',
        title: 'April Summary',
        updated_at: '2026-05-04T09:00:00.000Z',
      },
      {
        client_id: IDS.CLIENT_A,
        created_at: '2026-05-08T09:00:00.000Z',
        id: IDS.REPORT_DRAFT,
        period_end: '2026-05-31',
        period_start: '2026-05-01',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft summary',
        title: 'May Draft',
        updated_at: '2026-05-08T09:00:00.000Z',
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
    clientId: IDS.CLIENT_A,
    clientIds: [IDS.CLIENT_A],
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER_CLIENT,
  }
}

describe('adminReportService', () => {
  it('lists reports for agency-owned clients with client and status metadata', () => {
    const reports = listAdminReports({
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(reports).toHaveLength(2)
    expect(reports[0]).toMatchObject({
      client: {
        id: IDS.CLIENT_A,
        name: 'Client A',
      },
      statusMeta: {
        label: 'Draft',
      },
      title: 'May Draft',
    })
  })

  it('creates a draft report without exposing it to the client reports archive', () => {
    const repositories = createRepositories()
    const report = saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'https://example.com/dashboard',
        periodEnd: '2026-06-30',
        periodStart: '2026-06-01',
        results: 'Spend: $9,100\nLeads: 119',
        status: REPORT_STATUSES.DRAFT,
        summary: 'Draft client-facing explanation.',
        title: 'June Summary',
        whatWeDid: 'Optimized search campaigns.',
      },
      now: () => '2026-06-01T09:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(report.id).toBe('88888888-8888-4888-8888-888888888888')
    expect(report.status).toBe(REPORT_STATUSES.DRAFT)
    expect(JSON.stringify(clientPage)).not.toContain('June Summary')
  })

  it('publishes a report and makes it visible to the client reports archive', () => {
    const repositories = createRepositories()

    const publishedReport = updateAdminReportStatus({
      now: () => '2026-05-09T09:00:00.000Z',
      reportId: IDS.REPORT_DRAFT,
      repositories,
      status: REPORT_STATUSES.PUBLISHED,
      viewer: createAdminViewer(),
    })
    const clientPage = getClientReportsPage({
      clientId: IDS.CLIENT_A,
      reportId: IDS.REPORT_DRAFT,
      repositories,
      viewer: createClientViewer(),
    })

    expect(publishedReport.status).toBe(REPORT_STATUSES.PUBLISHED)
    expect(publishedReport.publishedAt).toBe('2026-05-09T09:00:00.000Z')
    expect(clientPage.selectedReport.title).toBe('May Draft')
  })

  it('validates report period and external links', () => {
    expect(() => saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'not-a-url',
        periodEnd: '2026-04-30',
        periodStart: '2026-05-01',
        title: 'Broken Report',
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Period end must be after period start.')

    expect(() => saveAdminReport({
      idGenerator: () => '88888888-8888-4888-8888-888888888888',
      input: {
        clientId: IDS.CLIENT_A,
        dashboardUrl: 'not-a-url',
        periodEnd: '2026-05-31',
        periodStart: '2026-05-01',
        title: 'Broken Report',
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Report dashboard URL must be a valid http(s) URL.')
  })

  it('deletes reports through admin-only operations', () => {
    const repositories = createRepositories()

    expect(deleteAdminReport({
      reportId: IDS.REPORT_DRAFT,
      repositories,
      viewer: createAdminViewer(),
    })).toBe(true)
    expect(repositories.reports.findById(IDS.REPORT_DRAFT)).toBeNull()
  })
})

