import { describe, expect, it } from 'vitest'

import { normalizeGrowthReviewDashboardLayout } from './apiContract'

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
