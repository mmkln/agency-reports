import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ReactivationCampaignSummary } from './ReactivationCampaignSummary'

describe('ReactivationCampaignSummary', () => {
  it('preserves the campaign metric hierarchy and formatting', () => {
    const html = renderToStaticMarkup(
      <ReactivationCampaignSummary
        chart={{
          available: true,
          cards: [
            { key: 'actual_bookings', value: 5 },
            { key: 'booked_expected_value', value: 12000 },
            { caption: '7% of cohort', key: 'negative_replies', value: 7 },
            { key: 'sms_sent', value: 1063 },
            { key: 'emails_sent', value: 769 },
            { key: 'manager_calls', value: 0 },
            { key: 'patients', value: 100 },
          ],
          series: [
            { cumulativeBookings: 2, date: '2026-08-01' },
            { cumulativeBookings: 5, date: '2026-08-10' },
          ],
        }}
        funnelChart={{
          stages: [
            { id: 'imported_candidate', stage_count: 100 },
            { id: 'replied_positive', stage_count: 20 },
            { id: 'booked', stage_count: 5 },
          ],
        }}
      />,
    )

    expect(html).toContain('Booked appointments')
    expect(html).toContain('5.0% of cohort · +3 this week')
    expect(html).toContain('Booked expected value')
    expect(html).toContain('$12,000')
    expect(html).toContain('Patient replies')
    expect(html).toContain('20% reply rate')
    expect(html).toContain('Reply → Booking')
    expect(html).toContain('5 of 20 replies booked')
    expect(html).toContain('Negative replies')
    expect(html).toContain('7% of cohort')
    expect(html).toContain('1,063')
    expect(html).toContain('SMS sent')
    expect(html).toContain('769')
    expect(html).toContain('Emails sent')
    expect(html).not.toContain('Calls completed')
    expect(html).not.toContain('Target patients')
  })
})
