import { describe, expect, it } from 'vitest'

import { normalizeDashboardExplanations } from './model'

describe('dashboard explanation contract', () => {
  it('normalizes editable explanation metadata and a read-only date field', () => {
    expect(normalizeDashboardExplanations({
      'bookings.by_channel.showed': {
        additional_note: 'Only completed visits.',
        calculation_explanation: 'Count normalized attended appointments.',
        date_field: 'Appointment start date',
        definition: 'Booked leads who attended.',
        explanation_key: 'bookings.by_channel.showed',
        is_customized: true,
        kind: 'metric',
        label: 'Showed',
        source: 'GHL appointments',
      },
    })).toEqual({
      'bookings.by_channel.showed': {
        additionalNote: 'Only completed visits.',
        calculationExplanation: 'Count normalized attended appointments.',
        dateField: 'Appointment start date',
        definition: 'Booked leads who attended.',
        explanationKey: 'bookings.by_channel.showed',
        isCustomized: true,
        kind: 'metric',
        label: 'Showed',
        source: 'GHL appointments',
        updatedAt: '',
        updatedBy: '',
      },
    })
  })
})
