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
  getAdminDentalGrowthReviewDraft,
  getAdminClinicReportingPage,
  importDentalGrowthReviewSourceAndGenerateDraft,
  importAdminClinicReportingJson,
  previewAdminClinicReportingImport,
  previewAdminDentalGrowthReviewSourceImport,
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
    dentalGrowthReviewSourceBatches: createEntityRepository([]),
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

function createDentalGrowthReviewSourcePayload(overrides = {}) {
  return {
    payload: {
      appointments: [
        {
          appointment_date: '2026-05-13',
          booked_at: '2026-05-11T09:30:00.000Z',
          contact_source: 'Meta Ads',
          created_at: '2026-05-11T09:30:00.000Z',
          patient_type: 'new',
          status: 'attended',
          track: 'Track A',
        },
        {
          appointment_date: '2026-05-14',
          booked_at: '2026-05-12T10:00:00.000Z',
          contact_source: 'reactivation',
          created_at: '2026-05-12T10:00:00.000Z',
          patient_type: 'reactivated',
          status: 'confirmed',
          track: 'Track C',
        },
        {
          appointment_date: '2026-05-16',
          booked_at: '2026-05-13T13:00:00.000Z',
          contact_source: 'Google Ads',
          created_at: '2026-05-13T13:00:00.000Z',
          patient_type: 'recall',
          status: 'attended',
          track: 'Track A',
        },
      ],
      assumptions: {
        chair_utilization_rate: 86,
        estimated_90_day_revenue_per_attended: 1200,
        hygiene_reappointment_rate: 72,
        revenue_p25_multiplier: 0.75,
        revenue_p75_multiplier: 1.25,
      },
      call_logs: [
        { disposition: 'booked', outcome: 'booked', status: 'completed', weekly_target: 4 },
        { disposition: 'left voicemail', outcome: 'no_answer', status: 'completed', weekly_target: 4 },
        { disposition: 'not interested', outcome: 'declined', status: 'completed', weekly_target: 4 },
      ],
      capacity_slots: [
        { date: '2026-05-16', slots_booked: 3, slots_offered: 4, track: 'Track A' },
        { date: '2026-05-16', slots_booked: 1, slots_offered: 2, track: 'Track C' },
      ],
      conversations: [
        {
          agent_first_reply_at: '2026-05-11T09:04:00.000Z',
          closed_at: '2026-05-11T09:30:00.000Z',
          patient_inbound_at: '2026-05-11T09:00:00.000Z',
        },
        {
          agent_first_reply_at: '2026-05-12T10:20:00.000Z',
          patient_inbound_at: '2026-05-12T10:00:00.000Z',
          resolved_at: '2026-05-12T11:00:00.000Z',
        },
        {
          patient_inbound_at: '2026-05-13T13:00:00.000Z',
        },
      ],
      email_events: [
        { opened_at: '2026-05-11T09:05:00.000Z', status: 'delivered', touch: 1, track: 'Track A' },
        { status: 'delivered', touch: 1, track: 'Track A' },
        { opened_at: '2026-05-12T10:05:00.000Z', status: 'delivered', touch: 2, track: 'Track C' },
      ],
      leads: [
        {
          contacted_at: '2026-05-11T09:05:00.000Z',
          created_at: '2026-05-11T09:00:00.000Z',
          source: 'Meta Ads',
        },
        {
          contacted_at: '2026-05-12T10:15:00.000Z',
          created_at: '2026-05-12T10:00:00.000Z',
          source: 'reactivation',
        },
        {
          created_at: '2026-05-13T13:00:00.000Z',
          source: 'Google Ads',
        },
      ],
      referrals: [
        { count: 1, created_at: '2026-05-15' },
        { count: 1, created_at: '2026-05-16' },
      ],
      reviews: [
        { created_at: '2026-05-12', rating: 5, responded_at: '2026-05-13' },
        { created_at: '2026-05-14', rating: 4 },
      ],
      sms_events: [
        { status: 'delivered' },
        { status: 'delivered' },
        { keyword: 'STOP', status: 'delivered' },
        { status: 'failed' },
      ],
      source_freshness: [
        {
          affected_metrics: ['Bookings', 'Replies'],
          freshness_status: 'green',
          last_updated_at: '2026-05-18T08:00:00.000Z',
          source_name: 'GHL',
        },
        {
          affected_metrics: ['Total Marketing Investment'],
          freshness_status: 'red',
          last_updated_at: '2026-05-09T08:00:00.000Z',
          source_name: 'Meta Ads export',
        },
      ],
      spend: [
        { amount: 600, source: 'Meta Ads', track: 'Track A' },
        { amount: 300, source: 'Google Ads' },
        { amount: 100, source: 'reactivation', track: 'Track C' },
      ],
      track_touches: [
        { replies: 3, sent: 10, touch: 1, track: 'Track A' },
        { replies: 2, sent: 8, touch: 2, track: 'Track A' },
        { replies: 4, sent: 12, touch: 1, track: 'Track C' },
      ],
    },
    period_end: '2026-05-17',
    period_start: '2026-05-11',
    period_type: 'weekly',
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
    })).toMatchObject({
      records: [
        expect.objectContaining({
          layer: DENTAL_GROWTH_REVIEW_LAYER,
          layerMeta: expect.objectContaining({ label: 'Dental Growth Review' }),
        }),
      ],
      sourceBatches: [],
    })
  })

  it('lists dental growth source imports with generated draft lineage', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'generated-period-a']

    importDentalGrowthReviewSourceAndGenerateDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      now: () => '2026-05-20T08:00:00.000Z',
      rawJson: createDentalGrowthReviewSourcePayload(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(getAdminClinicReportingPage({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    }).sourceBatches).toEqual([
      expect.objectContaining({
        generatedPeriodId: 'generated-period-a',
        generatedPublishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
        id: 'source-a',
        importedAt: '2026-05-20T08:00:00.000Z',
        periodEnd: '2026-05-17',
        periodStart: '2026-05-11',
        sourceType: 'json_import',
        validationState: 'valid',
        worstFreshnessStatus: 'red',
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

  it('previews dental growth source imports without saving records', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'generated-period-a']

    const result = previewAdminDentalGrowthReviewSourceImport({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      now: () => '2026-05-20T08:00:00.000Z',
      rawJson: createDentalGrowthReviewSourcePayload(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      contractVersion: 'dental-growth-review-source/v1',
      generatedPeriod: {
        calculation_source_batch_id: 'source-a',
        content: {
          hero_metrics: expect.arrayContaining([
            expect.objectContaining({ id: 'bookings', title: 'Bookings This Period', value: 3 }),
            expect.objectContaining({ id: 'biggest-leak', title: 'Biggest Funnel Leak' }),
          ]),
        },
        id: 'generated-period-a',
        publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      },
      isValid: true,
      sourceReadiness: expect.arrayContaining([
        expect.objectContaining({ id: 'hero_metrics', status: 'ready' }),
        expect.objectContaining({ id: 'speed_to_lead_channel', status: 'ready' }),
        expect.objectContaining({ id: 'source_freshness', status: 'ready' }),
      ]),
      sourceBatch: {
        id: 'source-a',
        period_end: '2026-05-17',
        period_start: '2026-05-11',
      },
      warnings: [],
    })
    expect(repositories.dentalGrowthReviewPeriods.list()).toHaveLength(0)
    expect(repositories.dentalGrowthReviewSourceBatches.list()).toHaveLength(0)
  })

  it('imports dental growth source data and generates draft only', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'generated-period-a']

    const result = importDentalGrowthReviewSourceAndGenerateDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      now: () => '2026-05-20T08:00:00.000Z',
      rawJson: createDentalGrowthReviewSourcePayload(),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      contractVersion: 'dental-growth-review-source/v1',
      generatedPeriod: {
        id: 'generated-period-a',
        layer: DENTAL_GROWTH_REVIEW_LAYER,
        periodLabel: 'Week ending 2026-05-17',
        publishState: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      },
      isValid: true,
      sourceBatch: {
        generated_period_id: 'generated-period-a',
        id: 'source-a',
      },
    })
    expect(repositories.dentalGrowthReviewSourceBatches.findById('source-a')).toMatchObject({
      generated_period_id: 'generated-period-a',
      validation_state: 'valid',
    })
    expect(repositories.dentalGrowthReviewPeriods.findById('generated-period-a')).toMatchObject({
      calculation_source_batch_id: 'source-a',
      content: {
        front_desk_health: expect.arrayContaining([
          expect.objectContaining({ id: 'calls-made-vs-target', value: '3 / 4' }),
          expect.objectContaining({ id: 'disposition-completion-rate', value: '100%' }),
        ]),
        hero_metrics: expect.arrayContaining([
          expect.objectContaining({ id: 'bookings', value: 3 }),
          expect.objectContaining({ id: 'investment', value: '$1,000' }),
        ]),
        heatmaps: {
          email_open_by_track: expect.arrayContaining([
            expect.objectContaining({ touch_1: 50, track: 'Track A' }),
            expect.objectContaining({ touch_2: 100, track: 'Track C' }),
          ]),
          reply_rate_by_track_touch: expect.arrayContaining([
            expect.objectContaining({ touch_1: 30, touch_2: 25, track: 'Track A' }),
            expect.objectContaining({ touch_1: 33, track: 'Track C' }),
          ]),
        },
        metrics: expect.arrayContaining([
          expect.objectContaining({ id: 'sms-deliverability-rate', value: '75%' }),
          expect.objectContaining({ id: 'sms-opt-out-rate', value: '25%' }),
          expect.objectContaining({ id: 'email-deliverability-rate', value: '100%' }),
        ]),
        operations_chips: expect.arrayContaining([
          expect.objectContaining({ id: 'show-rate-chip', value: '67%' }),
          expect.objectContaining({ id: 'chair-utilization-chip', value: '86%' }),
          expect.objectContaining({ id: 'hygiene-reappointment-chip', value: '72%' }),
        ]),
        reactivation_tracks: expect.arrayContaining([
          expect.objectContaining({
            bookings: 2,
            cost_per_booking: 300,
            reply_rate: 28,
            saturday_slot_fill_rate: 75,
            track: 'Track A',
          }),
          expect.objectContaining({
            bookings: 1,
            cost_per_booking: 100,
            reply_rate: 33,
            saturday_slot_fill_rate: 50,
            track: 'Track C',
          }),
        ]),
        reputation_referral: expect.arrayContaining([
          expect.objectContaining({ id: 'star-rating', value: 4.5 }),
          expect.objectContaining({ id: 'new-reviews', value: 2 }),
          expect.objectContaining({ id: 'review-response-rate', value: '50%' }),
          expect.objectContaining({ id: 'patient-referrals-received', value: 2 }),
        ]),
        speed_to_lead: expect.arrayContaining([
          expect.objectContaining({ id: 'median-first-reply', value: '12 min' }),
          expect.objectContaining({ id: 'reply-within-5-min', value: '50%' }),
          expect.objectContaining({ id: 'leads-never-contacted', value: '33%' }),
          expect.objectContaining({ id: 'reply-outliers-over-15', value: 1 }),
        ]),
      },
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    })
  })

  it('rejects patient-level fields from dental growth source imports', () => {
    const repositories = createRepositories()
    const result = previewAdminDentalGrowthReviewSourceImport({
      clientId: IDS.CLIENT,
      idGenerator: () => 'source-a',
      rawJson: createDentalGrowthReviewSourcePayload({
        payload: {
          appointments: [
            { created_at: '2026-05-11T09:30:00.000Z', patient_name: 'Jane Patient', status: 'attended' },
          ],
        },
      }),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      contractVersion: 'dental-growth-review-source/v1',
      generatedPeriod: null,
      isValid: false,
      sourceBatch: null,
    })
    expect(result.errors[0].message).toContain('patient-level field')
    expect(repositories.dentalGrowthReviewPeriods.list()).toHaveLength(0)
    expect(repositories.dentalGrowthReviewSourceBatches.list()).toHaveLength(0)
  })

  it('rejects invalid source freshness metadata', () => {
    const repositories = createRepositories()
    const result = previewAdminDentalGrowthReviewSourceImport({
      clientId: IDS.CLIENT,
      idGenerator: () => 'source-a',
      rawJson: createDentalGrowthReviewSourcePayload({
        payload: {
          source_freshness: [
            {
              affected_metrics: ['Bookings'],
              freshness_status: 'stale',
              last_updated_at: '2026-05-18T08:00:00.000Z',
              source_name: 'GHL',
            },
          ],
        },
      }),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      generatedPeriod: null,
      isValid: false,
      sourceBatch: null,
      sourceReadiness: [],
    })
    expect(result.errors[0].message).toContain('freshness_status')
  })

  it('warns when source payload cannot fully calculate diagnostic sections', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'generated-period-a']
    const result = previewAdminDentalGrowthReviewSourceImport({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      rawJson: createDentalGrowthReviewSourcePayload({
        payload: {
          appointments: [
            {
              appointment_date: '2026-05-13',
              created_at: '2026-05-11T09:30:00.000Z',
              patient_type: 'new',
              status: 'attended',
            },
          ],
          source_freshness: [
            {
              affected_metrics: ['Bookings'],
              freshness_status: 'green',
              last_updated_at: '2026-05-18T08:00:00.000Z',
              source_name: 'GHL',
            },
          ],
        },
      }),
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result).toMatchObject({
      isValid: true,
      sourceReadiness: expect.arrayContaining([
        expect.objectContaining({ id: 'hero_metrics', status: 'partial' }),
        expect.objectContaining({ id: 'deliverability_team_health', status: 'missing' }),
        expect.objectContaining({ id: 'source_freshness', status: 'ready' }),
      ]),
    })
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Hero metrics is partial'),
      expect.stringContaining('Deliverability and team health is missing'),
    ]))
  })

  it('saves only editable dental growth narrative fields as draft', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'growth-review-a']

    importDentalGrowthReviewSourceAndGenerateDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      now: () => '2026-05-20T08:00:00.000Z',
      rawJson: createDentalGrowthReviewSourcePayload(),
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
          hero_metrics: current.content.hero_metrics.map((metric) => (
            metric.id === 'bookings'
              ? { ...metric, value: 999 }
              : metric
          )),
          channel_attribution: [
            { channel: 'meta', cost_per_booking: 1 },
          ],
          period_context: {
            ...current.content.period_context,
            auto_summary: 'Bookings improved and the main leak is confirmed-to-attended.',
          },
          reputation_referral: [
            { id: 'star-rating', title: 'Star Rating', value: 1 },
          ],
          speed_to_lead: [
            { id: 'median-first-reply', title: 'Median Time to First Reply', value: '999 min' },
          ],
          watching: [
            {
              id: 'watching-a',
              owner: 'Roman',
              status: 'watching',
              title: 'Monitor Meta source quality',
              why_watch: 'Unknown source share rose in the generated attribution.',
            },
          ],
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
        hero_metrics: expect.arrayContaining([
          expect.objectContaining({ id: 'bookings', value: 3 }),
        ]),
        period_context: expect.objectContaining({
          auto_summary: 'Bookings improved and the main leak is confirmed-to-attended.',
        }),
        reputation_referral: expect.arrayContaining([
          expect.objectContaining({ id: 'star-rating', value: 4.5 }),
        ]),
        speed_to_lead: expect.arrayContaining([
          expect.objectContaining({ id: 'median-first-reply', value: '12 min' }),
        ]),
        watching: [
          expect.objectContaining({
            owner: 'Roman',
            title: 'Monitor Meta source quality',
          }),
        ],
      },
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      updated_at: '2026-05-20T09:00:00.000Z',
    })
  })

  it('rejects patient-level fields when saving dental growth review drafts', () => {
    const repositories = createRepositories()
    const ids = ['source-a', 'growth-review-draft']

    importDentalGrowthReviewSourceAndGenerateDraft({
      clientId: IDS.CLIENT,
      idGenerator: () => ids.shift(),
      rawJson: createDentalGrowthReviewSourcePayload(),
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
          narrative_items: [
            { id: 'narrative-a', patient_name: 'Jane Patient', title: 'Unsafe narrative', type: 'win' },
          ],
        },
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('patient-level field')
  })
})
