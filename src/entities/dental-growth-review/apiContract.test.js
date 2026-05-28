import { describe, expect, it } from 'vitest'

import { normalizeGrowthReviewReadModel } from './apiContract'

describe('normalizeGrowthReviewReadModel', () => {
  it('normalizes backend dashboard payloads into the existing page period shape', () => {
    const readModel = normalizeGrowthReviewReadModel({
      data_sources: [
        {
          affected_metrics: ['Bookings'],
          freshness_status: 'green',
          last_updated_at: '2026-05-17T10:00:00.000Z',
          source_name: 'GHL',
        },
      ],
      funnel: [
        {
          conversion_rate: 77.5,
          input_count: 40,
          name: 'Lead -> Contacted',
          output_count: 31,
          status: 'yellow',
        },
      ],
      hero_metrics: [
        {
          id: 'bookings',
          prior_value: 9,
          source: ['GHL'],
          status: 'green',
          title: 'Bookings',
          value: 12,
        },
      ],
      period: {
        end: '2026-05-17',
        start: '2026-05-11',
        type: 'weekly',
      },
      unavailable_metrics: [
        {
          id: 'attended_appointments',
          reason: 'GHL is not the source of truth for attendance.',
        },
      ],
      workspace_id: 'workspace-1',
    })

    expect(readModel.period).toMatchObject({
      client_id: 'workspace-1',
      period_end: '2026-05-17',
      period_start: '2026-05-11',
      period_type: 'weekly',
    })
    expect(readModel.period.content.hero_metrics[0]).toMatchObject({
      id: 'bookings',
      source: 'GHL',
      status: 'green',
      title: 'Bookings',
      value: 12,
    })
    expect(readModel.period.content.funnel[0]).toMatchObject({
      conversion_rate: 77.5,
      drop_off_count: 9,
      input_count: 40,
      output_count: 31,
    })
    expect(readModel.unavailable_metrics[0].reason).toContain('attendance')
  })
})
