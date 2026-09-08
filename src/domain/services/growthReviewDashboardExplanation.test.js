import { describe, expect, it } from 'vitest'

import { updateGrowthReviewDashboardExplanation } from './growthReviewApiReadService'

describe('updateGrowthReviewDashboardExplanation', () => {
  it('sends editable display name and source with the explanation fields', async () => {
    const requests = []
    const apiClient = {
      async request(path, options) {
        requests.push({ options, path })
        return {
          explanation: {
            additional_note: 'Campaign note',
            calculation_explanation: 'Count matching records.',
            definition: 'Patients with a completed booking.',
            explanation_key: 'summary.booked_appointments',
            is_customized: true,
            kind: 'metric',
            label: 'Completed bookings',
            source: 'GHL contacts and appointment records',
          },
        }
      },
    }

    const result = await updateGrowthReviewDashboardExplanation({
      apiClient,
      campaignId: 'campaign-1',
      explanation: {
        additionalNote: 'Campaign note',
        calculationExplanation: 'Count matching records.',
        definition: 'Patients with a completed booking.',
        label: 'Completed bookings',
        source: 'GHL contacts and appointment records',
      },
      explanationKey: 'summary.booked_appointments',
      workspaceId: 'workspace-1',
    })

    expect(requests).toEqual([
      {
        options: {
          body: {
            additional_note: 'Campaign note',
            calculation_explanation: 'Count matching records.',
            campaign_id: 'campaign-1',
            definition: 'Patients with a completed booking.',
            label: 'Completed bookings',
            source: 'GHL contacts and appointment records',
          },
          method: 'PUT',
        },
        path: '/api/workspaces/workspace-1/growth-review/dashboard-explanations/summary.booked_appointments/',
      },
    ])
    expect(result.label).toBe('Completed bookings')
    expect(result.source).toBe('GHL contacts and appointment records')
  })
})
