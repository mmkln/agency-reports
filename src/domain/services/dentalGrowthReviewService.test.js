import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_VIEW_PRESETS,
  DENTAL_GROWTH_REVIEW_ZONES,
} from '../../entities/dental-growth-review'
import {
  CLINIC_REPORTING_CAPABILITIES,
  USER_ROLES,
} from '../../entities/profile'
import { buildViewerFromProfile } from './authService'
import { getDentalGrowthReviewDashboardPage } from './dentalGrowthReviewService'

const IDS = Object.freeze({
  AGENCY: 'agency-a',
  CLIENT: 'client-a',
  OTHER_CLIENT: 'client-b',
  SOURCE_BATCH: 'source-batch-a',
  PERIOD_DRAFT: 'period-draft',
  PERIOD: 'period-current',
  PREVIOUS: 'period-previous',
})

function createEntityRepository(records = []) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
  }
}

function createPeriod(
  id,
  periodEnd = '2026-05-17',
  publishState = DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
) {
  return {
    client_id: IDS.CLIENT,
    calculated_at: '2026-05-20T08:00:00.000Z',
    calculation_source_batch_id: id === IDS.PERIOD_DRAFT ? IDS.SOURCE_BATCH : '',
    calculation_version: id === IDS.PERIOD_DRAFT ? 'dental-growth-review-calculation-v1' : '',
    content: {
      decisions: [
        { id: 'decision-1', title: 'Approve added hygiene capacity' },
      ],
      hero_metrics: [
        { id: 'bookings', title: 'Bookings This Period' },
        { id: 'attended', title: 'Attended Appointments' },
        { id: 'revenue', title: 'Projected 90-Day Revenue Range' },
        { id: 'investment', title: 'Total Marketing Investment' },
        { id: 'cost', title: 'Cost Per New/Reactivated Patient' },
        { id: 'leak', title: 'Biggest Funnel Leak' },
      ],
    },
    id,
    label: id === IDS.PERIOD_DRAFT
      ? 'Draft week'
      : periodEnd === '2026-05-17' ? 'Week ending May 17, 2026' : 'Previous week',
    period_end: periodEnd,
    period_start: periodEnd === '2026-05-17' ? '2026-05-11' : '2026-05-04',
    period_type: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
    publish_state: publishState,
    title: id === IDS.PERIOD_DRAFT ? 'Draft Dental Growth Review' : 'Published Dental Growth Review',
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name,
      zone_number: zone.number,
    })),
  }
}

function createRepositories() {
  return {
    clients: createEntityRepository([
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
    ]),
    dentalGrowthReviewPeriods: createEntityRepository([
      createPeriod(IDS.PERIOD),
      createPeriod(IDS.PREVIOUS, '2026-05-10'),
      createPeriod(IDS.PERIOD_DRAFT, '2026-05-24', DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT),
    ]),
    dentalGrowthReviewSourceBatches: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.SOURCE_BATCH,
        imported_at: '2026-05-20T07:55:00.000Z',
        payload: {},
        period_end: '2026-05-24',
        period_start: '2026-05-18',
        source_type: 'json_import',
        validation_state: 'valid',
      },
    ]),
  }
}

function viewer(profile) {
  return buildViewerFromProfile({
    profile,
    repositories: {
      clientMemberships: {
        list: () => [
          { client_id: IDS.CLIENT, user_id: 'client-user' },
          { client_id: IDS.CLIENT, user_id: 'agency-team' },
        ],
      },
    },
  })
}

describe('dentalGrowthReviewService', () => {
  it('allows client admin with executive preset', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: viewer({
        agency_id: IDS.AGENCY,
        id: 'profile-client',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: 'client-user',
      }),
    })

    expect(page.status).toBe('ready')
    expect(page.calculationMeta).toBeNull()
    expect(page.preset).toBe(DENTAL_GROWTH_REVIEW_VIEW_PRESETS.EXECUTIVE)
    expect(page.zones).toHaveLength(9)
    expect(page.period.content.hero_metrics).toHaveLength(6)
    expect(page.previousPeriod.id).toBe(IDS.PREVIOUS)
    expect(page.reviewPeriodOptions.map((option) => option.key)).toEqual([
      'current_week',
      'previous_week',
      'custom',
    ])
    expect(page.selectedReviewPeriodOptionKey).toBe('current_week')
  })

  it('allows assigned agency team with operator preset', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: viewer({
        agency_id: IDS.AGENCY,
        client_ids: [IDS.CLIENT],
        id: 'profile-team',
        role: USER_ROLES.AGENCY_TEAM,
        user_id: 'agency-team',
      }),
    })

    expect(page.status).toBe('ready')
    expect(page.preset).toBe(DENTAL_GROWTH_REVIEW_VIEW_PRESETS.OPERATOR)
    expect(page.zones.every((zone) => zone.defaultCollapsed === false)).toBe(true)
  })

  it('denies client team without explicit capability', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: viewer({
        agency_id: IDS.AGENCY,
        id: 'profile-frontdesk',
        role: USER_ROLES.CLIENT_TEAM,
        user_id: 'client-user',
      }),
    })

    expect(page).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('allows explicitly capable client team', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      repositories: createRepositories(),
      viewer: viewer({
        agency_id: IDS.AGENCY,
        capabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
        id: 'profile-capable-team',
        role: USER_ROLES.CLIENT_TEAM,
        user_id: 'client-user',
      }),
    })

    expect(page.status).toBe('ready')
  })

  it('allows agency admin to preview draft review periods', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      source: 'draft',
      viewer: viewer({
        agency_id: IDS.AGENCY,
        id: 'profile-admin',
        role: USER_ROLES.AGENCY_ADMIN,
        user_id: 'admin-user',
      }),
    })

    expect(page).toMatchObject({
      calculationMeta: {
        calculatedAt: '2026-05-20T08:00:00.000Z',
        calculationVersion: 'dental-growth-review-calculation-v1',
        importedAt: '2026-05-20T07:55:00.000Z',
        sourceBatchId: IDS.SOURCE_BATCH,
        sourceType: 'json_import',
        validationState: 'valid',
      },
      period: {
        id: IDS.PERIOD_DRAFT,
        publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
        title: 'Draft Dental Growth Review',
      },
      source: 'draft',
      status: 'ready',
    })
  })

  it('denies client users who try to preview drafts by URL', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      source: 'draft',
      viewer: viewer({
        agency_id: IDS.AGENCY,
        id: 'profile-client',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: 'client-user',
      }),
    })

    expect(page).toMatchObject({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('does not expose draft periods through the published dashboard source', () => {
    const page = getDentalGrowthReviewDashboardPage({
      clientId: IDS.CLIENT,
      periodId: IDS.PERIOD_DRAFT,
      repositories: createRepositories(),
      viewer: viewer({
        agency_id: IDS.AGENCY,
        id: 'profile-client',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: 'client-user',
      }),
    })

    expect(page).toMatchObject({
      calculationMeta: null,
      period: null,
      reason: 'period_not_found',
      source: 'published',
      status: 'ready',
    })
  })
})
