import { describe, expect, it } from 'vitest'

import {
  applyClinicMetricsImportToDraft,
  previewClinicMetricsImport,
} from './clinicMetricsImportDraft'

const CLIENT_ID = 'client-green-dental'

function createPayload(overrides = {}) {
  return {
    client_id: CLIENT_ID,
    metrics: {
      patient_acquisition: [
        {
          campaign_name: 'Emergency search',
          channel: 'google_ads',
          calls: 12,
          forms: 4,
          booked_appointments: 9,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          summary: 'Emergency campaign created high-intent demand.',
        },
      ],
      calls_bookings: [
        {
          campaign_name: 'Emergency search',
          total_calls: 18,
          answered_calls: 14,
          missed_calls: 4,
          booked_from_calls: 8,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          summary: 'Missed calls are limiting booked appointments.',
        },
      ],
      service_lines: [
        {
          booked_appointments: 8,
          campaign_name: 'Emergency search',
          compliance_status: 'approved',
          inquiries: 16,
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
          service_line_id: 'service-emergency',
          spend: 1200,
          summary: 'Emergency dentistry is the strongest service line.',
        },
      ],
    },
    ...overrides,
  }
}

describe('clinicMetricsImportDraft', () => {
  it('previews aggregate clinic metric imports for the current client', () => {
    const plan = previewClinicMetricsImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    expect(plan.summary).toEqual({
      callBookingCount: 1,
      campaignNames: ['Emergency search'],
      patientAcquisitionCount: 1,
      periods: ['May 2026'],
      serviceLinePerformanceCount: 1,
    })
    expect(plan.normalizedPayload.metricsInput.patientAcquisitionSnapshots[0]).toEqual(expect.objectContaining({
      booked_appointments: 9,
      publish_state: 'draft',
    }))
  })

  it('blocks imports for another client workspace', () => {
    expect(() => previewClinicMetricsImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload({ client_id: 'client-other' })),
    })).toThrow('different client workspace')
  })

  it('keeps PHI rejection in the import preview path', () => {
    expect(() => previewClinicMetricsImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload({
        metrics: {
          calls_bookings: [
            {
              patient: {
                patient_name: 'Jane Example',
              },
              period_end: '2026-05-31',
              period_label: 'May 2026',
              period_start: '2026-05-01',
            },
          ],
        },
      })),
    })).toThrow('aggregate-only')
  })

  it('applies previewed records to the unsaved draft', () => {
    const plan = previewClinicMetricsImport({
      clientId: CLIENT_ID,
      rawJson: JSON.stringify(createPayload()),
    })

    const draft = applyClinicMetricsImportToDraft({
      draft: {
        callBookingMetrics: [{ id: 'existing-call', period_label: 'April 2026' }],
        patientAcquisitionSnapshots: [{ id: 'existing-acquisition', period_label: 'April 2026' }],
        serviceLinePerformance: [{ id: 'existing-service', period_label: 'April 2026' }],
      },
      importPlan: plan,
    })

    expect(draft.patientAcquisitionSnapshots).toHaveLength(2)
    expect(draft.patientAcquisitionSnapshots[0].summary).toBe('Emergency campaign created high-intent demand.')
    expect(draft.callBookingMetrics[0].summary).toBe('Missed calls are limiting booked appointments.')
    expect(draft.serviceLinePerformance[0].summary).toBe('Emergency dentistry is the strongest service line.')
  })
})
