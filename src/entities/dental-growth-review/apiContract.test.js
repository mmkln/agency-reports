import { describe, expect, it } from 'vitest'

import {
  normalizeGrowthReviewDashboardExplanations,
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

describe('normalizeGrowthReviewDashboardExplanations', () => {
  it('normalizes campaign-specific explanation metadata', () => {
    const explanations = normalizeGrowthReviewDashboardExplanations({
      'summary.booked_appointments': {
        additional_note: 'Campaign-specific context',
        calculation_explanation: 'Count actual touches by execution date.',
        explanation_key: 'summary.booked_appointments',
        definition: 'Actual campaign activity.',
        is_customized: true,
        kind: 'metric',
        label: 'Reactivation Activity',
        source: 'GHL Reactivation Touch',
        updated_at: '2026-09-01T10:00:00Z',
      },
    })

    expect(explanations['summary.booked_appointments']).toEqual({
      additionalNote: 'Campaign-specific context',
      calculationExplanation: 'Count actual touches by execution date.',
      definition: 'Actual campaign activity.',
      explanationKey: 'summary.booked_appointments',
      isCustomized: true,
      kind: 'metric',
      label: 'Reactivation Activity',
      source: 'GHL Reactivation Touch',
      updatedAt: '2026-09-01T10:00:00Z',
      updatedBy: '',
    })
  })
})
