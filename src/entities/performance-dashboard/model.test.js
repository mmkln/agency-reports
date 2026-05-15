import { describe, expect, it } from 'vitest'

import {
  canClientViewPerformanceDashboardPeriod,
  createPerformanceDashboardPeriod,
  parsePerformanceDashboardJson,
  PERFORMANCE_CHANNELS,
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
  PERFORMANCE_METRIC_STATUSES,
  validatePerformanceDashboardPeriod,
} from './model'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  PERIOD_A: '22222222-2222-4222-8222-222222222222',
  USER_ADMIN: '33333333-3333-4333-8333-333333333333',
})

function createValidPeriod(overrides = {}) {
  return createPerformanceDashboardPeriod({
    idGenerator: () => IDS.PERIOD_A,
    input: {
      account_manager: 'Sarah Johnson',
      attribution_note: 'Manual reporting, last-click attribution.',
      client_id: IDS.CLIENT_A,
      content: {
        channel_breakdown: [
          {
            channel: PERFORMANCE_CHANNELS.GOOGLE_ADS,
            leads: 84,
            revenue: 42000,
            summary: 'Search produced the most qualified leads.',
          },
        ],
        executive_summary: {
          main_issue: 'Meta lead quality needs review.',
          main_win: 'Qualified leads increased.',
          narrative: 'Marketing generated more qualified leads at a lower blended CPL.',
          next_focus: 'Improve lead quality on Meta.',
        },
        hero_metric: {
          delta_pct: 18,
          goal_pct: 112,
          label: 'Qualified leads',
          source: 'Manual',
          status: PERFORMANCE_METRIC_STATUSES.AHEAD,
          value: 124,
        },
        insights: [
          {
            body: 'Lead quality improved after excluding low-intent search terms.',
            title: 'Search quality improved',
          },
        ],
        kpi_cards: [
          {
            delta_pct: 12,
            definition: 'Leads approved by sales as relevant opportunities.',
            goal: 110,
            name: 'Qualified Leads',
            source: 'CRM export',
            status: PERFORMANCE_METRIC_STATUSES.AHEAD,
            value: 124,
          },
        ],
        next_steps: [
          {
            owner: 'Agency',
            priority: 'high',
            title: 'Tighten Meta qualification rules',
          },
        ],
      },
      created_by: IDS.USER_ADMIN,
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.HIGH,
      data_mode: PERFORMANCE_DATA_MODES.MANUAL,
      last_updated_at: '2026-05-15T09:00:00.000Z',
      period_end: '2026-04-30',
      period_start: '2026-04-01',
      title: 'April Performance Dashboard',
      ...overrides,
    },
    now: () => '2026-05-15T09:00:00.000Z',
  })
}

describe('performance dashboard model', () => {
  it('creates draft dashboard periods with uuid ids and normalized defaults', () => {
    const period = createPerformanceDashboardPeriod({
      idGenerator: () => IDS.PERIOD_A,
      input: {
        client_id: IDS.CLIENT_A,
        title: ' May Dashboard ',
      },
      now: () => '2026-05-15T09:00:00.000Z',
    })

    expect(period).toMatchObject({
      client_id: IDS.CLIENT_A,
      created_at: '2026-05-15T09:00:00.000Z',
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
      data_mode: PERFORMANCE_DATA_MODES.MANUAL,
      id: IDS.PERIOD_A,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title: 'May Dashboard',
      updated_at: '2026-05-15T09:00:00.000Z',
    })
    expect(period.content.kpi_cards).toEqual([])
    expect(period.content.executive_summary.narrative).toBe('')
  })

  it('requires string uuid ids for newly created dashboard periods', () => {
    expect(() => createPerformanceDashboardPeriod({
      idGenerator: () => '123',
      input: {
        client_id: IDS.CLIENT_A,
      },
    })).toThrow('string uuid')
  })

  it('allows clients to view only published or archived dashboard periods', () => {
    expect(canClientViewPerformanceDashboardPeriod({
      status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
    })).toBe(true)
    expect(canClientViewPerformanceDashboardPeriod({
      status: PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
    })).toBe(true)
    expect(canClientViewPerformanceDashboardPeriod({
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    })).toBe(false)
    expect(canClientViewPerformanceDashboardPeriod({
      status: PERFORMANCE_DASHBOARD_STATUSES.READY,
    })).toBe(false)
  })

  it('validates publish-required narrative, metrics, insights, and next actions', () => {
    const invalidPeriod = createPerformanceDashboardPeriod({
      idGenerator: () => IDS.PERIOD_A,
      input: {
        client_id: IDS.CLIENT_A,
      },
    })

    const result = validatePerformanceDashboardPeriod(invalidPeriod, { mode: 'publish' })

    expect(result.isValid).toBe(false)
    expect(result.errors.map((error) => error.path)).toEqual(expect.arrayContaining([
      'content.executive_summary.narrative',
      'content.hero_metric.label',
      'content.hero_metric.value',
      'content.insights',
      'content.kpi_cards',
      'content.next_steps',
      'last_updated_at',
      'period_end',
      'period_start',
      'title',
    ]))
  })

  it('validates a complete publish-ready dashboard period', () => {
    const result = validatePerformanceDashboardPeriod(createValidPeriod(), { mode: 'publish' })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('keeps low confidence and missing attribution as warnings rather than draft blockers', () => {
    const result = validatePerformanceDashboardPeriod(createValidPeriod({
      attribution_note: '',
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.LOW,
    }), { mode: 'publish' })

    expect(result.isValid).toBe(true)
    expect(result.warnings.map((warning) => warning.path)).toEqual(expect.arrayContaining([
      'attribution_note',
      'data_confidence',
    ]))
  })

  it('parses valid JSON imports into draft json_import dashboard periods', () => {
    const result = parsePerformanceDashboardJson(JSON.stringify(createValidPeriod({
      status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
    })))

    expect(result.isValid).toBe(true)
    expect(result.period).toMatchObject({
      data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    })
  })

  it('returns validation errors for invalid JSON imports', () => {
    const result = parsePerformanceDashboardJson('{bad json')

    expect(result.isValid).toBe(false)
    expect(result.period).toBeNull()
    expect(result.errors[0].path).toBe('$')
  })
})
