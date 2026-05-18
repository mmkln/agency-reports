import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_CAMPAIGN_STATUSES,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATES,
  assertClinicAggregateRecord,
} from '../../entities/clinic'

export const CLINIC_IMPORT_CONTRACT_VERSION = 'clinic-import-v1'
export { CLINIC_CAMPAIGN_STATUSES }

const VALID_CHANNELS = new Set(Object.values(CLINIC_ACQUISITION_CHANNELS))
const VALID_COMPLIANCE_STATUSES = new Set(Object.values(CLINIC_COMPLIANCE_STATUSES))
const VALID_CAMPAIGN_STATUSES = new Set(Object.values(CLINIC_CAMPAIGN_STATUSES))

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value = '') {
  return normalizeText(value) || null
}

function requireText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeNumber(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return 0
  }

  const numberValue = Number(normalizedValue)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} must be a non-negative number.`)
  }

  return numberValue
}

function normalizePercent(value, fieldName) {
  const percent = normalizeNumber(value, fieldName)

  if (percent > 100) {
    throw new Error(`${fieldName} must be between 0 and 100.`)
  }

  return percent
}

function normalizeGoogleRating(value) {
  const rating = normalizeNumber(value, 'Google rating')

  if (rating > 5) {
    throw new Error('Google rating must be between 0 and 5.')
  }

  return rating
}

function normalizeEnum(value, validValues, fallback, fieldName) {
  const normalizedValue = normalizeText(value) || fallback

  if (!validValues.has(normalizedValue)) {
    throw new Error(`${fieldName} is invalid.`)
  }

  return normalizedValue
}

function getFirstValue(input, names) {
  return names.reduce((foundValue, name) => (
    foundValue !== undefined ? foundValue : input?.[name]
  ), undefined)
}

function getArray(input, names) {
  const value = getFirstValue(input, names)

  if (value == null) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error(`${names[0]} must be an array.`)
  }

  return value
}

function normalizePeriod(input = {}, fallbackPeriod = null, context = 'Reporting period') {
  const source = isPlainObject(input) ? input : {}

  return {
    period_end: requireText(source.period_end ?? source.end_date ?? fallbackPeriod?.period_end, `${context} end`),
    period_label: requireText(source.period_label ?? source.label ?? fallbackPeriod?.period_label, `${context} label`),
    period_start: requireText(source.period_start ?? source.start_date ?? fallbackPeriod?.period_start, `${context} start`),
  }
}

function normalizeOptionalPeriod(input = {}) {
  const period = getFirstValue(input, ['reporting_period', 'reportingPeriod', 'period'])

  if (!period) {
    return null
  }

  return normalizePeriod(period)
}

function normalizeNotBookedReasons(items) {
  if (items == null) {
    return []
  }

  if (!Array.isArray(items)) {
    throw new Error('Not booked reasons must be an array.')
  }

  return items
    .map((item) => ({
      count: normalizeNumber(item?.count, 'Not booked reason count'),
      reason: normalizeText(item?.reason),
    }))
    .filter((item) => item.reason && item.count > 0)
}

function normalizePeakCallTimes(items) {
  if (items == null) {
    return []
  }

  if (!Array.isArray(items)) {
    throw new Error('Peak call times must be an array.')
  }

  return items
    .map((item) => ({
      booked_from_calls: normalizeNumber(item?.booked_from_calls ?? item?.bookedFromCalls, 'Peak booked calls'),
      call_count: normalizeNumber(item?.call_count ?? item?.calls ?? item?.count, 'Peak call count'),
      label: normalizeText(item?.label ?? item?.time_window ?? item?.timeWindow),
      missed_calls: normalizeNumber(item?.missed_calls ?? item?.missedCalls, 'Peak missed calls'),
    }))
    .filter((item) => item.label && item.call_count > 0)
}

function normalizeCommonFields(record, fallbackPeriod, context) {
  return {
    ...normalizePeriod(record, fallbackPeriod, context),
    data_source: normalizeNullableText(record.data_source),
    id: normalizeText(record.id),
    location_id: normalizeNullableText(record.location_id),
    publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    service_line_id: normalizeNullableText(record.service_line_id),
    summary: normalizeText(record.summary),
  }
}

function normalizePatientAcquisitionMetric(record, fallbackPeriod) {
  return {
    ...normalizeCommonFields(record, fallbackPeriod, 'Patient acquisition period'),
    attended_appointments: normalizeNumber(record.attended_appointments, 'Attended appointments'),
    booked_appointments: normalizeNumber(record.booked_appointments, 'Booked appointments'),
    campaign_name: normalizeText(record.campaign_name),
    calls: normalizeNumber(record.calls, 'Calls'),
    channel: normalizeEnum(
      record.channel,
      VALID_CHANNELS,
      CLINIC_ACQUISITION_CHANNELS.OTHER,
      'Patient acquisition channel',
    ),
    chats: normalizeNumber(record.chats, 'Chats'),
    clicks: normalizeNumber(record.clicks, 'Clicks'),
    forms: normalizeNumber(record.forms, 'Forms'),
    impressions: normalizeNumber(record.impressions, 'Impressions'),
    insight: normalizeText(record.insight),
    landing_page_visits: normalizeNumber(record.landing_page_visits, 'Landing page visits'),
    qualified_inquiries: normalizeNumber(record.qualified_inquiries, 'Qualified inquiries'),
    spend: normalizeNumber(record.spend, 'Spend'),
  }
}

function normalizeCallBookingMetric(record, fallbackPeriod) {
  return {
    ...normalizeCommonFields(record, fallbackPeriod, 'Calls/bookings period'),
    answered_calls: normalizeNumber(record.answered_calls, 'Answered calls'),
    average_response_seconds: normalizeNumber(record.average_response_seconds, 'Average response seconds'),
    booked_from_calls: normalizeNumber(record.booked_from_calls, 'Booked from calls'),
    campaign_name: normalizeText(record.campaign_name),
    first_time_calls: normalizeNumber(record.first_time_calls, 'First-time caller calls'),
    follow_up_needed_count: normalizeNumber(record.follow_up_needed_count, 'Follow-up needed count'),
    form_leads: normalizeNumber(record.form_leads, 'Form leads'),
    insight: normalizeText(record.insight),
    missed_calls: normalizeNumber(record.missed_calls, 'Missed calls'),
    no_response_leads: normalizeNumber(record.no_response_leads, 'No-response leads'),
    not_booked_reasons: normalizeNotBookedReasons(record.not_booked_reasons),
    peak_call_times: normalizePeakCallTimes(record.peak_call_times),
    total_calls: normalizeNumber(record.total_calls, 'Total calls'),
  }
}

function normalizeServiceLinePerformanceMetric(record, fallbackPeriod) {
  return {
    ...normalizeCommonFields(record, fallbackPeriod, 'Service line performance period'),
    ad_approval_status: normalizeText(record.ad_approval_status),
    booked_appointments: normalizeNumber(record.booked_appointments, 'Booked appointments'),
    campaign_name: normalizeText(record.campaign_name),
    campaign_status: normalizeEnum(
      record.campaign_status,
      VALID_CAMPAIGN_STATUSES,
      CLINIC_CAMPAIGN_STATUSES.PLANNED,
      'Campaign status',
    ),
    capacity_note: normalizeText(record.capacity_note),
    compliance_status: normalizeEnum(
      record.compliance_status,
      VALID_COMPLIANCE_STATUSES,
      CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      'Service line compliance status',
    ),
    cost_per_booked_appointment: normalizeNumber(
      record.cost_per_booked_appointment,
      'Cost per booked appointment',
    ),
    cost_per_inquiry: normalizeNumber(record.cost_per_inquiry, 'Cost per inquiry'),
    inquiries: normalizeNumber(record.inquiries, 'Inquiries'),
    landing_page_status: normalizeText(record.landing_page_status),
    spend: normalizeNumber(record.spend, 'Spend'),
  }
}

function normalizeReputationSnapshot(record, fallbackPeriod) {
  return {
    ...normalizeCommonFields(record, fallbackPeriod, 'Reputation period'),
    gbp_updates: normalizeNumber(record.gbp_updates, 'Google Business Profile updates'),
    google_rating: normalizeGoogleRating(record.google_rating),
    insight: normalizeText(record.insight),
    local_visibility_note: normalizeText(record.local_visibility_note),
    negative_reviews: normalizeNumber(record.negative_reviews, 'Negative reviews'),
    provider_profile_completeness: normalizePercent(
      record.provider_profile_completeness,
      'Provider profile completeness',
    ),
    review_count: normalizeNumber(record.review_count, 'Review count'),
    review_request_sent: normalizeNumber(record.review_request_sent, 'Review requests sent'),
    review_response_drafts: normalizeNumber(record.review_response_drafts, 'Review response drafts'),
    reviews_gained: normalizeNumber(record.reviews_gained, 'Reviews gained'),
    unanswered_reviews: normalizeNumber(record.unanswered_reviews, 'Unanswered reviews'),
  }
}

function normalizeComplianceReviewItem(record) {
  return {
    blocked_items: normalizeNumber(record.blocked_items, 'Blocked items'),
    data_source: normalizeNullableText(record.data_source),
    id: normalizeText(record.id),
    limited_ads: normalizeNumber(record.limited_ads, 'Limited ads'),
    location_id: normalizeNullableText(record.location_id),
    next_action: normalizeText(record.next_action),
    open_issues: normalizeNumber(record.open_issues, 'Open issues'),
    pending_approvals: normalizeNumber(record.pending_approvals, 'Pending approvals'),
    platform: normalizeText(record.platform),
    publish_state: CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    risk_note: normalizeText(record.risk_note),
    service_line_id: normalizeNullableText(record.service_line_id),
    status: normalizeEnum(
      record.status,
      VALID_COMPLIANCE_STATUSES,
      CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      'Compliance status',
    ),
    summary: normalizeText(record.summary),
    title: requireText(record.title, 'Compliance review title'),
  }
}

export function normalizeClinicImportPayload(payload = {}, { now = () => new Date().toISOString() } = {}) {
  if (!isPlainObject(payload)) {
    throw new Error('Clinic import payload must be an object.')
  }

  assertClinicAggregateRecord(payload, 'Clinic import payload')

  const fallbackPeriod = normalizeOptionalPeriod(payload)
  const serviceLinePerformance = getArray(payload, ['service_line_performance', 'serviceLinePerformance'])
    .map((record) => normalizeServiceLinePerformanceMetric(record, fallbackPeriod))

  return {
    clientId: requireText(payload.client_id ?? payload.clientId, 'Client ID'),
    complianceInput: {
      complianceReviews: getArray(payload, ['compliance_reviews', 'complianceReviews'])
        .map(normalizeComplianceReviewItem),
    },
    contractVersion: normalizeText(payload.contract_version ?? payload.contractVersion)
      || CLINIC_IMPORT_CONTRACT_VERSION,
    importedAt: normalizeText(payload.imported_at ?? payload.importedAt) || now(),
    metricsInput: {
      callBookingMetrics: getArray(payload, [
        'calls_bookings_metrics',
        'call_booking_metrics',
        'callBookingMetrics',
      ]).map((record) => normalizeCallBookingMetric(record, fallbackPeriod)),
      patientAcquisitionSnapshots: getArray(payload, [
        'patient_acquisition_metrics',
        'patient_acquisition_snapshots',
        'patientAcquisitionMetrics',
      ]).map((record) => normalizePatientAcquisitionMetric(record, fallbackPeriod)),
      serviceLinePerformance,
    },
    reputationInput: {
      reputationSnapshots: getArray(payload, ['reputation_snapshots', 'reputationSnapshots'])
        .map((record) => normalizeReputationSnapshot(record, fallbackPeriod)),
    },
    serviceLinePerformance,
    sourceSummary: normalizeText(payload.source_summary ?? payload.sourceSummary),
  }
}
