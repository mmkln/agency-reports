import { describe, expect, it } from 'vitest'

import {
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_ZONES,
  validateDentalGrowthReviewPeriod,
} from './model'

function createPeriod(overrides = {}) {
  return {
    client_id: 'client-1',
    content: {
      decisions: [
        { id: 'decision-1', title: 'Approve capacity' },
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
    id: 'period-1',
    label: 'Week ending May 17, 2026',
    period_end: '2026-05-17',
    period_start: '2026-05-11',
    period_type: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name,
      zone_number: zone.number,
    })),
    ...overrides,
  }
}

describe('dental growth review model', () => {
  it('accepts a valid 9-zone operating review with exactly 6 hero metrics', () => {
    const period = validateDentalGrowthReviewPeriod(createPeriod())

    expect(period.zones).toHaveLength(9)
    expect(period.content.hero_metrics).toHaveLength(6)
  })

  it('rejects LTV:CAC as a weekly hero metric', () => {
    const period = createPeriod({
      content: {
        hero_metrics: [
          { id: 'bookings', title: 'Bookings This Period' },
          { id: 'attended', title: 'Attended Appointments' },
          { id: 'revenue', title: 'Projected 90-Day Revenue Range' },
          { id: 'investment', title: 'Total Marketing Investment' },
          { id: 'cost', title: 'Cost Per New/Reactivated Patient' },
          { id: 'ltv-cac', title: 'LTV:CAC Ratio' },
        ],
      },
    })

    expect(() => validateDentalGrowthReviewPeriod(period)).toThrow(/LTV:CAC/)
  })

  it('rejects patient-level fields', () => {
    const period = createPeriod({
      content: {
        hero_metrics: createPeriod().content.hero_metrics,
        patient_name: 'Jane Example',
      },
    })

    expect(() => validateDentalGrowthReviewPeriod(period)).toThrow(/patient-level/)
  })
})
