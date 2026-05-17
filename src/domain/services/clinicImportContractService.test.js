import { describe, expect, it } from 'vitest'

import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
} from '../../entities/clinic'
import {
  CLINIC_CAMPAIGN_STATUSES,
  CLINIC_IMPORT_CONTRACT_VERSION,
  normalizeClinicImportPayload,
} from './clinicImportContractService'

const IDS = Object.freeze({
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  LOCATION_A: '55555555-5555-4555-8555-555555555555',
  SERVICE_A: '66666666-6666-4666-8666-666666666666',
})

describe('clinicImportContractService', () => {
  it('normalizes aggregate clinic import payloads into admin workflow input shapes', () => {
    const result = normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      contract_version: CLINIC_IMPORT_CONTRACT_VERSION,
      reporting_period: {
        end_date: '2026-05-31',
        label: 'May 2026',
        start_date: '2026-05-01',
      },
      source_summary: 'Google Ads, CallRail, GBP, and compliance spreadsheet.',
      patient_acquisition_metrics: [
        {
          booked_appointments: '14',
          calls: '22',
          channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
          clicks: '310',
          forms: '8',
          location_id: IDS.LOCATION_A,
          qualified_inquiries: '19',
          service_line_id: IDS.SERVICE_A,
          spend: '2400',
          summary: 'Implants drove the strongest booking volume.',
        },
      ],
      calls_bookings_metrics: [
        {
          answered_calls: '36',
          average_response_seconds: '82',
          booked_from_calls: '19',
          first_time_calls: '31',
          missed_calls: '5',
          not_booked_reasons: [
            {
              count: '3',
              reason: 'No suitable appointment slot',
            },
          ],
          total_calls: '41',
        },
      ],
      service_line_performance: [
        {
          booked_appointments: '14',
          campaign_name: 'Implants search',
          campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
          compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
          inquiries: '19',
          service_line_id: IDS.SERVICE_A,
          spend: '2400',
        },
      ],
      reputation_snapshots: [
        {
          google_rating: '4.8',
          provider_profile_completeness: '92',
          review_count: '318',
          reviews_gained: '16',
        },
      ],
      compliance_reviews: [
        {
          limited_ads: '2',
          open_issues: '3',
          platform: 'Google Ads',
          status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
          title: 'Implants campaign policy review',
        },
      ],
    }, {
      now: () => '2026-06-01T09:00:00.000Z',
    })

    expect(result).toMatchObject({
      clientId: IDS.CLIENT_A,
      contractVersion: CLINIC_IMPORT_CONTRACT_VERSION,
      importedAt: '2026-06-01T09:00:00.000Z',
      sourceSummary: 'Google Ads, CallRail, GBP, and compliance spreadsheet.',
    })
    expect(result.metricsInput.patientAcquisitionSnapshots[0]).toMatchObject({
      booked_appointments: 14,
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
      location_id: IDS.LOCATION_A,
      period_end: '2026-05-31',
      period_label: 'May 2026',
      period_start: '2026-05-01',
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      service_line_id: IDS.SERVICE_A,
    })
    expect(result.metricsInput.callBookingMetrics[0]).toMatchObject({
      answered_calls: 36,
      booked_from_calls: 19,
      not_booked_reasons: [
        {
          count: 3,
          reason: 'No suitable appointment slot',
        },
      ],
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    })
    expect(result.serviceLinePerformance[0]).toMatchObject({
      campaign_status: CLINIC_CAMPAIGN_STATUSES.LIVE,
      compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
      inquiries: 19,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    })
    expect(result.reputationInput.reputationSnapshots[0]).toMatchObject({
      google_rating: 4.8,
      provider_profile_completeness: 92,
      review_count: 318,
    })
    expect(result.complianceInput.complianceReviews[0]).toMatchObject({
      limited_ads: 2,
      open_issues: 3,
      status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
    })
  })

  it('allows row-level reporting periods when no top-level period is present', () => {
    const result = normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      patient_acquisition_metrics: [
        {
          booked_appointments: 4,
          period_end: '2026-04-30',
          period_label: 'April 2026',
          period_start: '2026-04-01',
        },
      ],
    })

    expect(result.metricsInput.patientAcquisitionSnapshots[0]).toMatchObject({
      period_end: '2026-04-30',
      period_label: 'April 2026',
      period_start: '2026-04-01',
    })
  })

  it('rejects patient-level fields anywhere in clinic imports', () => {
    expect(() => normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      patient_acquisition_metrics: [
        {
          patient_phone: '+1 555 0100',
          period_end: '2026-05-31',
          period_label: 'May 2026',
          period_start: '2026-05-01',
        },
      ],
    })).toThrow('Clinic import payload must stay aggregate-only')
  })

  it('rejects invalid metrics before connector data reaches admin save workflows', () => {
    expect(() => normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      reporting_period: {
        end_date: '2026-05-31',
        label: 'May 2026',
        start_date: '2026-05-01',
      },
      patient_acquisition_metrics: [
        {
          channel: 'health_remarketing',
        },
      ],
    })).toThrow('Patient acquisition channel is invalid.')

    expect(() => normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      reporting_period: {
        end_date: '2026-05-31',
        label: 'May 2026',
        start_date: '2026-05-01',
      },
      reputation_snapshots: [
        {
          google_rating: '7',
        },
      ],
    })).toThrow('Google rating must be between 0 and 5.')

    expect(() => normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      compliance_reviews: [
        {
          open_issues: '-1',
          title: 'Tracking review',
        },
      ],
    })).toThrow('Open issues must be a non-negative number.')
  })

  it('requires a reporting period for metrics that depend on period context', () => {
    expect(() => normalizeClinicImportPayload({
      client_id: IDS.CLIENT_A,
      patient_acquisition_metrics: [
        {
          booked_appointments: 4,
        },
      ],
    })).toThrow('Patient acquisition period end is required.')
  })
})
