import { describe, expect, it } from 'vitest'

import {
  normalizeGrowthReviewChartExplanations,
  normalizeGrowthReviewDashboardLayout,
} from './apiContract'

describe('normalizeGrowthReviewDashboardLayout', () => {
  it('preserves campaign-scoped widget visibility', () => {
    const layout = normalizeGrowthReviewDashboardLayout({
      campaign_id: 'campaign-1',
      items: [
        {
          is_visible: false,
          label: 'Breakdown by Track',
          widget_key: 'booked_appointments_by_reply_channel',
        },
      ],
    })

    expect(layout.campaignId).toBe('campaign-1')
    expect(layout.items).toEqual([
      {
        isVisible: false,
        label: 'Breakdown by Track',
        position: 10,
        widgetKey: 'booked_appointments_by_reply_channel',
      },
    ])
  })
})

describe('normalizeGrowthReviewChartExplanations', () => {
  it('normalizes campaign-specific explanation metadata', () => {
    const explanations = normalizeGrowthReviewChartExplanations({
      reactivation_activity: {
        additional_note: 'Campaign-specific context',
        calculation_explanation: 'Count actual touches by execution date.',
        chart_key: 'reactivation_activity',
        definition: 'Actual campaign activity.',
        is_customized: true,
        label: 'Reactivation Activity',
        source: 'GHL Reactivation Touch',
        updated_at: '2026-09-01T10:00:00Z',
      },
    })

    expect(explanations.reactivation_activity).toEqual({
      additionalNote: 'Campaign-specific context',
      calculationExplanation: 'Count actual touches by execution date.',
      chartKey: 'reactivation_activity',
      definition: 'Actual campaign activity.',
      isCustomized: true,
      label: 'Reactivation Activity',
      source: 'GHL Reactivation Touch',
      updatedAt: '2026-09-01T10:00:00Z',
      updatedBy: '',
    })
  })
})
