import { describe, expect, it } from 'vitest'

import { buildReactivationCampaignSummaryModel } from './reactivationCampaignSummaryModel'

describe('buildReactivationCampaignSummaryModel', () => {
  it('preserves specialized Review variants and card order', () => {
    const cards = buildReactivationCampaignSummaryModel({
      chart: {
        available: true,
        cards: [
          { key: 'actual_bookings', value: 5 },
          { key: 'booked_expected_value', value: 12000 },
          { caption: '7% of cohort', key: 'negative_replies', value: 7 },
          { key: 'sms_sent', value: 1063 },
          { key: 'manager_calls', value: 0 },
          { key: 'patients', value: 100 },
        ],
        series: [
          { cumulativeBookings: 2, date: '2026-08-01' },
          { cumulativeBookings: 5, date: '2026-08-10' },
        ],
      },
      funnelChart: {
        stages: [
          { id: 'imported_candidate', stage_count: 100 },
          { id: 'replied_positive', stage_count: 20 },
          { id: 'booked', stage_count: 5 },
        ],
      },
    })

    expect(cards.map((card) => card.id)).toEqual([
      'actual_bookings',
      'booked_expected_value',
      'patient-replies',
      'reply-to-booking',
      'negative_replies',
      'sms_sent',
    ])
    expect(cards[0]).toMatchObject({
      helper: '5.0% of cohort · +3 this week',
      tone: 'positive',
      value: '5',
      variant: 'featured',
    })
    expect(cards[1]).toMatchObject({
      emphasis: 'strong',
      value: '$12,000',
      variant: 'standard',
    })
    expect(cards[2]).toMatchObject({
      helperTone: 'muted',
      label: 'Patient replies',
      variant: 'standard',
    })
    expect(cards[4]).toMatchObject({
      helper: '7% of cohort',
      label: 'Negative replies',
      variant: 'activity',
    })
    expect(cards[5]).toMatchObject({
      helper: 'SMS sent',
      label: '',
      value: '1,063',
      variant: 'activity',
    })
  })
})
