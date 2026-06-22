import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_COMPLIANCE_STATUSES,
  normalizeBookingPipelineSnapshot,
  normalizeCallBookingMetric,
  normalizeComplianceReview,
  normalizeLocationPerformance,
  normalizeMedicalApproval,
  normalizePatientAcquisitionSnapshot,
  normalizeReputationSnapshot,
  normalizeServiceLinePerformance,
} from '../../entities/clinic'

export const CLINIC_PUBLISH_READINESS_STATES = Object.freeze({
  NEEDS_REVIEW: 'needs_review',
  READY: 'ready',
})

export const CLINIC_PUBLISH_READINESS_META = Object.freeze({
  [CLINIC_PUBLISH_READINESS_STATES.NEEDS_REVIEW]: {
    label: 'Needs review',
    tone: 'amber',
  },
  [CLINIC_PUBLISH_READINESS_STATES.READY]: {
    label: 'Ready to publish',
    tone: 'green',
  },
})

function hasText(value) {
  return String(value ?? '').trim().length > 0
}

function hasPositiveNumber(value) {
  return Number(value) > 0
}

function getPeriodIssues(record) {
  const issues = []

  if (!hasText(record.period_label)) {
    issues.push('Add a reporting period label.')
  }

  if (!hasText(record.period_start)) {
    issues.push('Add a reporting period start date.')
  }

  if (!hasText(record.period_end)) {
    issues.push('Add a reporting period end date.')
  }

  return issues
}

function createReadiness(blockingReasons, warnings = []) {
  const isReady = blockingReasons.length === 0
  const state = isReady
    ? CLINIC_PUBLISH_READINESS_STATES.READY
    : CLINIC_PUBLISH_READINESS_STATES.NEEDS_REVIEW
  const meta = CLINIC_PUBLISH_READINESS_META[state]

  return {
    blockingReasons,
    isReady,
    label: meta.label,
    state,
    tone: meta.tone,
    warnings,
  }
}

function getNarrativeWarnings(record) {
  const warnings = []

  if (!hasText(record.summary)) {
    warnings.push('Add a portal-ready summary before publishing when possible.')
  }

  if (!hasText(record.data_source)) {
    warnings.push('Add a data source before publishing when possible.')
  }

  return warnings
}

export function getPatientAcquisitionPublishReadiness(snapshot) {
  const record = normalizePatientAcquisitionSnapshot(snapshot)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (![
    record.calls,
    record.forms,
    record.chats,
    record.qualified_inquiries,
    record.booked_appointments,
    record.attended_appointments,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add at least one inquiry, call, form, chat, booked appointment, or attended appointment value.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getBookingPipelinePublishReadiness(snapshot) {
  const record = normalizeBookingPipelineSnapshot(snapshot)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (![
    record.calls,
    record.forms,
    record.chats,
    record.qualified_inquiries,
    record.booked_appointments,
    record.attended_appointments,
    record.missed_calls,
    record.no_response_leads,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add at least one demand, booking, missed-call, or no-response pipeline value.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getCallBookingPublishReadiness(metric) {
  const record = normalizeCallBookingMetric(metric)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (![
    record.total_calls,
    record.answered_calls,
    record.missed_calls,
    record.booked_from_calls,
    record.form_leads,
    record.no_response_leads,
    record.follow_up_needed_count,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add at least one call, booking, form lead, missed call, no-response lead, or follow-up value.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getLocationPerformancePublishReadiness(performance) {
  const record = normalizeLocationPerformance(performance)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (!hasText(record.location_id)) {
    blockingReasons.push('Select a location.')
  }

  if (![
    record.spend,
    record.inquiries,
    record.booked_appointments,
    record.answered_calls,
    record.missed_calls,
    record.reviews_gained,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add spend, inquiries, bookings, calls, missed calls, or review movement for this location.')
  }

  if (record.compliance_status === CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED) {
    blockingReasons.push('Set a reviewed compliance status before publishing.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getServiceLinePerformancePublishReadiness(performance) {
  const record = normalizeServiceLinePerformance(performance)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (!hasText(record.service_line_id)) {
    blockingReasons.push('Select a service line.')
  }

  if (![
    record.spend,
    record.inquiries,
    record.booked_appointments,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add spend, inquiries, or booked appointments for this service line.')
  }

  if (record.compliance_status === CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED) {
    blockingReasons.push('Set a reviewed compliance status before publishing.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getReputationSnapshotPublishReadiness(snapshot) {
  const record = normalizeReputationSnapshot(snapshot)
  const blockingReasons = [
    ...getPeriodIssues(record),
  ]

  if (![
    record.google_rating,
    record.review_count,
    record.reviews_gained,
    record.unanswered_reviews,
    record.negative_reviews,
    record.review_response_drafts,
    record.gbp_updates,
  ].some(hasPositiveNumber)) {
    blockingReasons.push('Add at least one rating, review, response, or GBP update value.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getComplianceReviewPublishReadiness(review) {
  const record = normalizeComplianceReview(review)
  const blockingReasons = []

  if (!hasText(record.title)) {
    blockingReasons.push('Add a compliance review title.')
  }

  if (record.status === CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED) {
    blockingReasons.push('Review the compliance status before publishing.')
  }

  if (!hasText(record.platform) && !hasText(record.summary) && !hasText(record.risk_note) && record.policy_issues.length === 0) {
    blockingReasons.push('Add a platform, summary, risk note, or policy issue.')
  }

  return createReadiness(blockingReasons, getNarrativeWarnings(record))
}

export function getMedicalApprovalPublishReadiness(approval) {
  const record = normalizeMedicalApproval(approval)
  const blockingReasons = []
  const warnings = []

  if (!hasText(record.title)) {
    blockingReasons.push('Add an approval title.')
  }

  if (!hasText(record.instructions)) {
    blockingReasons.push('Add approval instructions.')
  }

  if (
    [
      CLINIC_APPROVAL_STATUSES.APPROVED,
      CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
      CLINIC_APPROVAL_STATUSES.REJECTED,
    ].includes(record.status)
    && !hasText(record.decision_comment)
  ) {
    warnings.push('Add a decision comment before publishing when possible.')
  }

  return createReadiness(blockingReasons, warnings)
}

export function assertClinicPublishReady(readiness) {
  if (!readiness?.isReady) {
    throw new Error(readiness?.blockingReasons?.[0] || 'Clinic record is not ready to publish.')
  }
}
