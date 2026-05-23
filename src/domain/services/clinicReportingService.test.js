import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_REPORTING_CAPABILITIES,
} from '../../entities/profile'
import { AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import {
  createAgencyAccessViewer,
  createWorkspaceAccessViewer,
} from '../test/accessViewerTestHelpers'
import {
  CLINIC_REPORTING_LAYERS,
  CLINIC_REPORTING_PUBLISH_STATES,
} from '../../entities/clinic-reporting'
import { buildViewerFromProfile } from './authService'
import {
  getClinicDailyOperationsPage,
  getClinicExecutivePerformancePage,
  getClinicMonthlyStrategyPage,
  getClinicWeeklyOperatorPage,
} from './clinicReportingService'

const IDS = Object.freeze({
  AGENCY: 'agency-a',
  CLIENT: 'client-a',
  OTHER_CLIENT: 'client-b',
  DAILY: 'daily-a',
  EXECUTIVE: 'executive-a',
  MONTHLY: 'monthly-a',
  WEEKLY: 'weekly-a',
})

const VIEWER_TYPES = Object.freeze({
  AGENCY_ADMIN: 'agency-admin',
  AGENCY_TEAM: 'agency-team',
  CLIENT_OWNER: 'client-owner',
  CLIENT_TEAM: 'client-team',
})

function createEntityRepository(records = []) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByWorkspaceId(workspaceId) {
      return records.filter((record) => record.workspace_id === workspaceId || record.client_id === workspaceId)
    },
    upsert(record) {
      records.push(record)
      return record
    },
  }
}

function createRepositories() {
  const clients = createEntityRepository([
    {
      agency_id: IDS.AGENCY,
      id: IDS.CLIENT,
      name: 'Green Dental',
      portal_slug: 'green-dental',
      type: CLIENT_TYPES.CLINIC,
    },
    {
      agency_id: IDS.AGENCY,
      id: IDS.OTHER_CLIENT,
      name: 'Unassigned Dental',
      portal_slug: 'unassigned-dental',
      type: CLIENT_TYPES.CLINIC,
    },
  ])
  const workspaceMemberships = createEntityRepository([
    {
      id: 'membership-a',
      role: WORKSPACE_ROLES.OWNER,
      user_id: 'legacy-client',
      workspace_id: IDS.CLIENT,
    },
    {
      id: 'membership-team',
      user_id: 'client-team',
      workspace_id: IDS.CLIENT,
    },
  ])

  return {
    clients,
    workspaceMemberships,
    workspaces: clients,
    clinicDailyOperations: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        content: {
          alerts: [{ id: 'waiting-replies', label: 'Replies waiting', value: 2 }],
          call_queue: [{ id: 'call-a', title: 'Call patient back' }],
          callback_queue: [{ id: 'callback-a', title: 'Callback at 2pm' }],
          reply_queue: [{ id: 'reply-a', title: 'Reply waiting' }],
        },
        id: IDS.DAILY,
        layer: CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS,
        period_end: '2026-05-20',
        period_label: 'May 20, 2026',
        period_start: '2026-05-20',
        publish_state: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
        title: 'Daily Ops',
      },
    ]),
    clinicExecutivePerformancePeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        content: {
          hero_metrics: [{ id: 'new-patients', label: 'New patients', value: 12 }],
          narrative: { narrative: 'Executive summary.' },
        },
        id: IDS.EXECUTIVE,
        layer: CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE,
        period_end: '2026-05-15',
        period_label: 'May 1-15',
        period_start: '2026-05-01',
        publish_state: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
        title: 'Executive',
      },
    ]),
    clinicMonthlyStrategyPeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        content: {
          financials: [{ id: 'collections', label: 'Collections', value: 181000 }],
        },
        id: IDS.MONTHLY,
        layer: CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY,
        period_end: '2026-04-30',
        period_label: 'April 2026',
        period_start: '2026-04-01',
        publish_state: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
        title: 'Monthly',
      },
    ]),
    clinicWeeklyOperatorPeriods: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        content: {
          funnel: [{ id: 'lead-booked', label: 'Lead booked', value: 24 }],
        },
        id: IDS.WEEKLY,
        layer: CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR,
        period_end: '2026-05-17',
        period_label: 'Week of May 11',
        period_start: '2026-05-11',
        publish_state: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
        title: 'Weekly',
      },
    ]),
    profiles: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: 'legacy-profile',
        user_id: 'legacy-client',
      },
    ]),
  }
}

function createViewer(viewerType, extra = {}) {
  if (viewerType === VIEWER_TYPES.AGENCY_ADMIN || viewerType === VIEWER_TYPES.AGENCY_TEAM) {
    return createAgencyAccessViewer({
      agencyId: IDS.AGENCY,
      capabilities: [
        CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW,
        CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW,
        CLINIC_REPORTING_CAPABILITIES.OPERATIONAL_ROWS_VIEW,
        ...(extra.capabilities ?? []),
      ],
      managedWorkspaceIds: [IDS.CLIENT],
      role: viewerType === VIEWER_TYPES.AGENCY_ADMIN ? AGENCY_ROLES.ADMIN : AGENCY_ROLES.TEAM,
      userId: `${viewerType}-user`,
    })
  }

  return createWorkspaceAccessViewer({
    capabilities: [
      CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
      ...(extra.capabilities ?? []),
    ],
    role: viewerType === VIEWER_TYPES.CLIENT_TEAM ? WORKSPACE_ROLES.FRONT_DESK : WORKSPACE_ROLES.CLINIC_OWNER,
    userId: `${viewerType}-user`,
    workspaceId: IDS.CLIENT,
  })
}

describe('clinic reporting foundations', () => {
  it('builds workspace access from membership instead of profile role fallback', () => {
    const repositories = createRepositories()
    const viewer = buildViewerFromProfile({
      profile: repositories.profiles.findById('legacy-profile'),
      repositories,
    })

    expect(viewer).toMatchObject({
      activeWorkspaceId: IDS.CLIENT,
      workspaceMemberships: [expect.objectContaining({
        role: WORKSPACE_ROLES.CLINIC_OWNER,
        workspaceId: IDS.CLIENT,
      })],
    })
    expect(viewer.capabilities).toContain(CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW)
  })

  it('allows client admins to read executive reporting but not monthly finance by default', () => {
    const repositories = createRepositories()
    const viewer = createViewer(VIEWER_TYPES.CLIENT_OWNER)

    expect(getClinicExecutivePerformancePage({
      clientId: IDS.CLIENT,
      repositories,
      viewer,
    }).status).toBe('ready')
    expect(getClinicMonthlyStrategyPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer,
    })).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('allows monthly strategy only when the viewer has finance capability', () => {
    const repositories = createRepositories()
    const viewer = createViewer(VIEWER_TYPES.CLIENT_OWNER, {
      capabilities: [CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW],
    })

    expect(getClinicMonthlyStrategyPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer,
    })).toMatchObject({
      period: expect.objectContaining({ id: IDS.MONTHLY }),
      status: 'ready',
    })
  })

  it('returns Layer 1 operational rows to agency team viewers only by default', () => {
    const repositories = createRepositories()
    const agencyTeamPage = getClinicDailyOperationsPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createViewer(VIEWER_TYPES.AGENCY_TEAM),
    })
    const clientTeamPage = getClinicDailyOperationsPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createViewer(VIEWER_TYPES.CLIENT_TEAM, {
        capabilities: [CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW],
      }),
    })

    expect(agencyTeamPage.period.content.reply_queue).toHaveLength(1)
    expect(agencyTeamPage.operationalRowsVisible).toBe(true)
    expect(clientTeamPage.period.content.reply_queue).toEqual([])
    expect(clientTeamPage.period.content.call_queue).toEqual([])
    expect(clientTeamPage.operationalRowsVisible).toBe(false)
  })

  it('allows agency team to read weekly operator reporting for assigned clients', () => {
    const repositories = createRepositories()

    expect(getClinicWeeklyOperatorPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createViewer(VIEWER_TYPES.AGENCY_TEAM),
    })).toMatchObject({
      period: expect.objectContaining({ id: IDS.WEEKLY }),
      status: 'ready',
    })
  })

  it('denies agency team weekly operator reporting for unassigned clients', () => {
    const repositories = createRepositories()

    expect(getClinicWeeklyOperatorPage({
      clientId: IDS.OTHER_CLIENT,
      repositories,
      viewer: createViewer(VIEWER_TYPES.AGENCY_TEAM),
    })).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })
})
