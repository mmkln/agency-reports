import { describe, expect, it } from 'vitest'

import {
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_TYPES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUSES,
  assertClinicAggregateRecord,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
  normalizeCallBookingMetric,
  normalizeComplianceReview,
  normalizeMedicalApproval,
  normalizePatientAcquisitionSnapshot,
  normalizeReputationSnapshot,
} from './model'

describe('clinic entity model', () => {
  it('normalizes clinic foundation records for aggregate client-facing read models', () => {
    expect(normalizeClinicProfile({
      client_id: 'client-a',
      id: 'profile-a',
      primary_goal: '  Increase booked appointments.  ',
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
    })).toMatchObject({
      client_id: 'client-a',
      id: 'profile-a',
      primary_goal: 'Increase booked appointments.',
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
    })

    expect(normalizeClinicLocation({
      client_id: 'client-a',
      display_order: '20',
      id: 'location-a',
      is_active: false,
      name: '  Downtown Clinic  ',
    })).toMatchObject({
      display_order: 20,
      is_active: false,
      name: 'Downtown Clinic',
    })

    expect(normalizeClinicServiceLine({
      average_value: '4200',
      client_id: 'client-a',
      id: 'service-line-a',
      location_ids: [' location-a ', '', null],
      name: 'Dental Implants',
      status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      target_monthly_bookings: '24',
    })).toMatchObject({
      average_value: 4200,
      location_ids: ['location-a'],
      status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      target_monthly_bookings: 24,
    })
  })

  it('normalizes aggregate patient acquisition snapshots', () => {
    expect(normalizePatientAcquisitionSnapshot({
      booked_appointments: '14',
      calls: '18',
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
      chats: '3',
      clicks: '240',
      forms: '9',
      impressions: '12800',
      landing_page_visits: '211',
      qualified_inquiries: '21',
      spend: '1860',
    })).toMatchObject({
      booked_appointments: 14,
      calls: 18,
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
      chats: 3,
      clicks: 240,
      forms: 9,
      impressions: 12800,
      landing_page_visits: 211,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      qualified_inquiries: 21,
      spend: 1860,
    })
  })

  it('normalizes aggregate call and booking metrics', () => {
    expect(normalizeCallBookingMetric({
      answered_calls: '37',
      average_response_seconds: '92',
      booked_from_calls: '24',
      first_time_calls: '31',
      follow_up_needed_count: '5',
      form_leads: '14',
      missed_calls: '6',
      no_response_leads: '3',
      not_booked_reasons: [
        { count: '4', reason: 'No available slot' },
        { count: 0, reason: 'Ignored zero' },
      ],
      total_calls: '43',
    })).toMatchObject({
      answered_calls: 37,
      average_response_seconds: 92,
      booked_from_calls: 24,
      first_time_calls: 31,
      follow_up_needed_count: 5,
      form_leads: 14,
      missed_calls: 6,
      no_response_leads: 3,
      not_booked_reasons: [{ count: 4, reason: 'No available slot' }],
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      total_calls: 43,
    })
  })

  it('normalizes aggregate reputation snapshots', () => {
    expect(normalizeReputationSnapshot({
      gbp_updates: '4',
      google_rating: '4.7',
      negative_reviews: '2',
      provider_profile_completeness: '0.86',
      review_count: '286',
      review_request_sent: '142',
      review_response_drafts: '3',
      reviews_gained: '18',
      unanswered_reviews: '3',
    })).toMatchObject({
      gbp_updates: 4,
      google_rating: 4.7,
      negative_reviews: 2,
      provider_profile_completeness: 0.86,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      review_count: 286,
      review_request_sent: 142,
      review_response_drafts: 3,
      reviews_gained: 18,
      unanswered_reviews: 3,
    })
  })

  it('normalizes compliance reviews and medical approvals', () => {
    expect(normalizeComplianceReview({
      blocked_items: '1',
      limited_ads: '2',
      open_issues: '3',
      pending_approvals: '4',
      status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
    })).toMatchObject({
      blocked_items: 1,
      limited_ads: 2,
      open_issues: 3,
      pending_approvals: 4,
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      status: CLINIC_COMPLIANCE_STATUSES.RISK_FLAGGED,
    })

    expect(normalizeMedicalApproval({
      approval_type: CLINIC_APPROVAL_TYPES.LANDING_PAGE,
      history: [
        {
          actor_label: 'Dr. Kim',
          comment: 'Approved wording.',
          decision: 'approved',
          decided_at: '2026-05-08T09:00:00.000Z',
          version: 'v2',
        },
      ],
      publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
      status: CLINIC_APPROVAL_STATUSES.APPROVED,
      version: ' v2 ',
    })).toMatchObject({
      approval_type: CLINIC_APPROVAL_TYPES.LANDING_PAGE,
      history: [
        expect.objectContaining({
          actor_label: 'Dr. Kim',
          decision: 'approved',
          version: 'v2',
        }),
      ],
      status: CLINIC_APPROVAL_STATUSES.APPROVED,
      version: 'v2',
    })
  })

  it('falls back to safe defaults for unknown clinic enum values', () => {
    expect(normalizeClinicProfile({
      specialty: 'hospital',
    }).specialty).toBe(CLINIC_PROFILE_SPECIALTIES.OTHER)

    expect(normalizeClinicServiceLine({
      status: 'launched',
    }).status).toBe(CLINIC_SERVICE_LINE_STATUSES.PLANNED)

    expect(normalizePatientAcquisitionSnapshot({
      channel: 'print',
    }).channel).toBe(CLINIC_ACQUISITION_CHANNELS.OTHER)

    expect(normalizeComplianceReview({
      status: 'legal_hold',
    }).status).toBe(CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED)

    expect(normalizeMedicalApproval({
      approval_type: 'unknown',
      status: 'waiting',
    })).toMatchObject({
      approval_type: CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
      status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    })
  })

  it('rejects patient-level keys anywhere in clinic aggregate records', () => {
    expect(() => assertClinicAggregateRecord({
      metrics: [
        {
          patient_phone: '+1 555 0100',
        },
      ],
    }, 'Clinic test record')).toThrow('Clinic test record must stay aggregate-only')
  })
})
