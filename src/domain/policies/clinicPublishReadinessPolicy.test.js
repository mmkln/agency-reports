import { describe, expect, it } from 'vitest'

import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_COMPLIANCE_STATUSES,
} from '../../entities/clinic'
import {
  getCallBookingPublishReadiness,
  getComplianceReviewPublishReadiness,
  getMedicalApprovalPublishReadiness,
  getPatientAcquisitionPublishReadiness,
  getReputationSnapshotPublishReadiness,
  getServiceLinePerformancePublishReadiness,
} from './clinicPublishReadinessPolicy'

const PERIOD = Object.freeze({
  period_end: '2026-05-31',
  period_label: 'May 2026',
  period_start: '2026-05-01',
})

describe('clinicPublishReadinessPolicy', () => {
  it('requires patient acquisition period and patient demand values', () => {
    expect(getPatientAcquisitionPublishReadiness({}).isReady).toBe(false)

    const readiness = getPatientAcquisitionPublishReadiness({
      ...PERIOD,
      booked_appointments: 8,
      summary: 'Booked appointments increased.',
    })

    expect(readiness).toMatchObject({
      isReady: true,
      state: 'ready',
    })
  })

  it('requires call booking period and booking or leakage values', () => {
    expect(getCallBookingPublishReadiness(PERIOD).isReady).toBe(false)

    expect(getCallBookingPublishReadiness({
      ...PERIOD,
      missed_calls: 4,
    }).isReady).toBe(true)
  })

  it('requires service line, performance values, and reviewed compliance status', () => {
    const notReady = getServiceLinePerformancePublishReadiness({
      ...PERIOD,
      booked_appointments: 12,
      service_line_id: 'service-emergency',
    })

    expect(notReady.blockingReasons).toContain('Set a reviewed compliance status before publishing.')

    expect(getServiceLinePerformancePublishReadiness({
      ...PERIOD,
      booked_appointments: 12,
      compliance_status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
      service_line_id: 'service-emergency',
    }).isReady).toBe(true)
  })

  it('requires reputation period and aggregate reputation values', () => {
    expect(getReputationSnapshotPublishReadiness(PERIOD).isReady).toBe(false)

    expect(getReputationSnapshotPublishReadiness({
      ...PERIOD,
      review_count: 320,
    }).isReady).toBe(true)
  })

  it('requires compliance review title, reviewed status, and useful context', () => {
    const notReady = getComplianceReviewPublishReadiness({
      platform: 'Google Ads',
      status: CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      title: 'Policy review',
    })

    expect(notReady.blockingReasons).toContain('Review the compliance status before publishing.')

    expect(getComplianceReviewPublishReadiness({
      platform: 'Google Ads',
      status: CLINIC_COMPLIANCE_STATUSES.APPROVED,
      title: 'Policy review',
    }).isReady).toBe(true)
  })

  it('requires medical approval title and instructions', () => {
    expect(getMedicalApprovalPublishReadiness({
      status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
      title: 'Ad claim approval',
    }).isReady).toBe(false)

    expect(getMedicalApprovalPublishReadiness({
      instructions: 'Review the claim wording.',
      status: CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
      title: 'Ad claim approval',
    }).isReady).toBe(true)
  })
})
