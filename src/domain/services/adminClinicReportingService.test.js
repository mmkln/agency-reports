import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  DENTAL_GROWTH_REVIEW_LAYER,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_ZONES,
} from '../../entities/dental-growth-review'
import {
  CLINIC_REPORTING_CAPABILITIES,
  USER_ROLES,
} from '../../entities/profile'
import {
  CLINIC_REPORTING_FRESHNESS_STATUSES,
  CLINIC_REPORTING_LAYERS,
  CLINIC_REPORTING_PUBLISH_STATES,
} from '../../entities/clinic-reporting'
import {
  createAdminDentalGrowthReviewDraft,
  getAdminDentalGrowthReviewDraft,
  getAdminClinicReportingPage,
  importAdminClinicReportingJson,
  previewAdminClinicReportingImport,
  updateAdminDentalGrowthReviewDraft,
  updateAdminClinicReportingPublishState,
} from './adminClinicReportingService'

const IDS = Object.freeze({
  AGENCY: 'agency-a',
  CLIENT: 'client-a',
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
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = record
      } else {
        records.push(record)
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
        id: IDS.CLIENT,
        name: 'Green Dental',
        type: CLIENT_TYPES.CLINIC,
      },
    ]),
    clinicDailyOperations: createEntityRepository([]),
    clinicExecutivePerformancePeriods: createEntityRepository([]),
    clinicMonthlyStrategyPeriods: createEntityRepository([]),
    clinicWeeklyOperatorPeriods: createEntityRepository([]),
    dentalGrowthReviewPeriods: createEntityRepository([]),
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    capabilities: Object.values(CLINIC_REPORTING_CAPABILITIES),
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user',
  }
}

function createDentalGrowthReviewImportPayload(overrides = {}) {
  return {
    content: {
      decisions: [
        { id: 'decision-1', title: 'Approve hygiene capacity' },
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
    data_sources: [
      {
        affected_metrics: ['Bookings'],
        freshness_status: 'green',
        last_updated_at: '2026-05-20T08:00:00.000Z',
        source_name: 'GHL',
      },
    ],
    label: 'Week ending May 17, 2026',
    period_end: '2026-05-17',
    period_start: '2026-05-11',
    period_type: 'weekly',
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
    title: 'Dental Growth Review Import',
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name,
      zone_number: zone.number,
    })),
    ...overrides,
  }
}

describe('admin clinic reporting foundations', () => {
  it('imports valid JSON as draft only', () => {
    const repositories = createRepositories()
    const result = importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'period-a',
      layer: CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE,
      rawJson: {
        content: {
          hero_metrics: [{ id: 'new-patients', label: 'New patients', value: 12 }],
        },
        period_end: '2026-05-15',
        period_label: 'May 1-15',
        period_start: '2026-05-01',
        publish_state: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
        title: 'Executive import',
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      isValid: true,
      period: {
        id: 'period-a',
        publishState: CLINIC_REPORTING_PUBLISH_STATES.DRAFT,
      },
    })
    expect(repositories.clinicExecutivePerformancePeriods.findById('period-a')).toMatchObject({
      publish_state: CLINIC_REPORTING_PUBLISH_STATES.DRAFT,
    })
  })

  it('lists imported periods with layer, status, freshness, and validation-ready summaries', () => {
    const repositories = createRepositories()

    importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'period-a',
      layer: CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS,
      rawJson: {
        period_end: '2026-05-20',
        period_label: 'May 20',
        period_start: '2026-05-20',
        source_trust: [{
          freshness_status: CLINIC_REPORTING_FRESHNESS_STATUSES.STALE,
          last_updated_at: '2026-05-20T08:00:00.000Z',
          name: 'GHL',
        }],
        title: 'Daily import',
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(getAdminClinicReportingPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      records: [
        {
          layer: CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS,
          periodLabel: 'May 20',
          publishState: CLINIC_REPORTING_PUBLISH_STATES.DRAFT,
          sourceTrust: [{
            freshness_status: CLINIC_REPORTING_FRESHNESS_STATUSES.STALE,
            last_updated_at: '2026-05-20T08:00:00.000Z',
          }],
          title: 'Daily import',
        },
      ],
    })
  })

  it('rejects patient-level fields from client-facing layer imports', () => {
    const result = previewAdminClinicReportingImport({
      clientId: IDS.CLIENT,
      idGenerator: () => 'period-a',
      layer: CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY,
      rawJson: {
        content: {
          financials: [{ label: 'Collections', patient_name: 'Jane Patient', value: 181000 }],
        },
        period_end: '2026-04-30',
        period_label: 'April 2026',
        period_start: '2026-04-01',
        title: 'Monthly import',
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      isValid: false,
      period: null,
    })
    expect(result.errors[0].message).toContain('patient-level field')
  })

  it('publishes and archives imported records explicitly', () => {
    const repositories = createRepositories()

    importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'period-a',
      layer: CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR,
      rawJson: {
        period_end: '2026-05-17',
        period_label: 'Week of May 11',
        period_start: '2026-05-11',
        title: 'Weekly import',
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updateAdminClinicReportingPublishState({
      layer: CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR,
      periodId: 'period-a',
      publishState: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      publishState: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
    })
    expect(updateAdminClinicReportingPublishState({
      layer: CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR,
      periodId: 'period-a',
      publishState: CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED,
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      publishState: CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED,
    })
  })

  it('imports dental growth review records as draft and lists them in the admin table', () => {
    const repositories = createRepositories()
    const result = importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-a',
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      rawJson: createDentalGrowthReviewImportPayload(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      contractVersion: 'dental-growth-review/v1',
      isValid: true,
      period: {
        id: 'growth-review-a',
        layer: DENTAL_GROWTH_REVIEW_LAYER,
        periodLabel: 'Week ending May 17, 2026',
        publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      },
    })
    expect(repositories.dentalGrowthReviewPeriods.findById('growth-review-a')).toMatchObject({
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    })
    expect(getAdminClinicReportingPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    }).records).toEqual([
      expect.objectContaining({
        layer: DENTAL_GROWTH_REVIEW_LAYER,
        layerMeta: expect.objectContaining({ label: 'Dental Growth Review' }),
      }),
    ])
  })

  it('rejects invalid dental growth review imports before saving', () => {
    const repositories = createRepositories()
    const result = previewAdminClinicReportingImport({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-a',
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      rawJson: createDentalGrowthReviewImportPayload({
        content: {
          hero_metrics: [
            { id: 'bookings', title: 'Bookings This Period' },
            { id: 'ltv-cac', title: 'LTV:CAC Ratio' },
          ],
        },
      }),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      contractVersion: 'dental-growth-review/v1',
      isValid: false,
      period: null,
    })
    expect(result.errors[0].message).toContain('exactly 6 hero metrics')
    expect(repositories.dentalGrowthReviewPeriods.list()).toHaveLength(0)
  })

  it('publishes and archives dental growth review records explicitly', () => {
    const repositories = createRepositories()

    importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-a',
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      rawJson: createDentalGrowthReviewImportPayload(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updateAdminClinicReportingPublishState({
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      periodId: 'growth-review-a',
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
    })
    expect(updateAdminClinicReportingPublishState({
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      periodId: 'growth-review-a',
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.ARCHIVED,
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.ARCHIVED,
    })
  })

  it('creates editable dental growth review drafts with valid operating review defaults', () => {
    const repositories = createRepositories()
    const result = createAdminDentalGrowthReviewDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-draft',
      now: () => '2026-05-20T08:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      id: 'growth-review-draft',
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      periodLabel: 'Week ending 2026-05-20',
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      title: 'Green Dental Dental Growth Review',
    })
    expect(getAdminDentalGrowthReviewDraft({
      periodId: 'growth-review-draft',
      repositories,
      viewer: createAdminViewer(),
    })).toMatchObject({
      content: {
        hero_metrics: expect.arrayContaining([
          expect.objectContaining({ title: 'Bookings This Period' }),
          expect.objectContaining({ title: 'Biggest Funnel Leak' }),
        ]),
      },
      zones: expect.arrayContaining([
        expect.objectContaining({ number: 1 }),
        expect.objectContaining({ number: 9 }),
      ]),
    })
  })

  it('saves dental growth review edits as draft even when the source record was published', () => {
    const repositories = createRepositories()

    importAdminClinicReportingJson({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-a',
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      rawJson: createDentalGrowthReviewImportPayload(),
      repositories,
      viewer: createAdminViewer(),
    })
    updateAdminClinicReportingPublishState({
      layer: DENTAL_GROWTH_REVIEW_LAYER,
      periodId: 'growth-review-a',
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
      repositories,
      viewer: createAdminViewer(),
    })

    const current = getAdminDentalGrowthReviewDraft({
      periodId: 'growth-review-a',
      repositories,
      viewer: createAdminViewer(),
    })
    const result = updateAdminDentalGrowthReviewDraft({
      now: () => '2026-05-20T09:00:00.000Z',
      period: {
        ...current,
        content: {
          ...current.content,
          period_context: {
            ...current.content.period_context,
            auto_summary: 'Bookings improved and the main leak is confirmed-to-attended.',
          },
        },
        title: 'Edited Dental Growth Review',
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.summary).toMatchObject({
      publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      title: 'Edited Dental Growth Review',
    })
    expect(repositories.dentalGrowthReviewPeriods.findById('growth-review-a')).toMatchObject({
      content: {
        period_context: expect.objectContaining({
          auto_summary: 'Bookings improved and the main leak is confirmed-to-attended.',
        }),
      },
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      updated_at: '2026-05-20T09:00:00.000Z',
    })
  })

  it('rejects patient-level fields when saving dental growth review drafts', () => {
    const repositories = createRepositories()

    createAdminDentalGrowthReviewDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => 'growth-review-draft',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(() => updateAdminDentalGrowthReviewDraft({
      period: {
        ...getAdminDentalGrowthReviewDraft({
          periodId: 'growth-review-draft',
          repositories,
          viewer: createAdminViewer(),
        }),
        content: {
          hero_metrics: [
            { id: 'bookings', patient_name: 'Jane Patient', title: 'Bookings This Period' },
            { id: 'attended', title: 'Attended Appointments' },
            { id: 'revenue', title: 'Projected 90-Day Revenue Range' },
            { id: 'investment', title: 'Total Marketing Investment' },
            { id: 'cost', title: 'Cost Per New/Reactivated Patient' },
            { id: 'leak', title: 'Biggest Funnel Leak' },
          ],
        },
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('patient-level field')
  })
})
