export const CLINIC_PROFILE_SPECIALTIES = Object.freeze({
  AESTHETICS: 'aesthetics',
  DENTAL: 'dental',
  DERMATOLOGY: 'dermatology',
  FERTILITY: 'fertility',
  MENTAL_HEALTH: 'mental_health',
  PHYSIOTHERAPY: 'physiotherapy',
  PODIATRY: 'podiatry',
  URGENT_CARE: 'urgent_care',
  OTHER: 'other',
})

export const CLINIC_PROFILE_SPECIALTY_META = Object.freeze({
  [CLINIC_PROFILE_SPECIALTIES.AESTHETICS]: { label: 'Aesthetics' },
  [CLINIC_PROFILE_SPECIALTIES.DENTAL]: { label: 'Dental' },
  [CLINIC_PROFILE_SPECIALTIES.DERMATOLOGY]: { label: 'Dermatology' },
  [CLINIC_PROFILE_SPECIALTIES.FERTILITY]: { label: 'Fertility' },
  [CLINIC_PROFILE_SPECIALTIES.MENTAL_HEALTH]: { label: 'Mental Health' },
  [CLINIC_PROFILE_SPECIALTIES.PHYSIOTHERAPY]: { label: 'Physiotherapy' },
  [CLINIC_PROFILE_SPECIALTIES.PODIATRY]: { label: 'Podiatry' },
  [CLINIC_PROFILE_SPECIALTIES.URGENT_CARE]: { label: 'Urgent Care' },
  [CLINIC_PROFILE_SPECIALTIES.OTHER]: { label: 'Other' },
})

export const CLINIC_SERVICE_LINE_STATUSES = Object.freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  PLANNED: 'planned',
})

export const CLINIC_ACQUISITION_CHANNELS = Object.freeze({
  DIRECT: 'direct',
  GOOGLE_ADS: 'google_ads',
  META_ADS: 'meta_ads',
  ORGANIC: 'organic',
  REFERRAL: 'referral',
  OTHER: 'other',
})

export const CLINIC_ACQUISITION_CHANNEL_META = Object.freeze({
  [CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS]: { label: 'Google Ads' },
  [CLINIC_ACQUISITION_CHANNELS.META_ADS]: { label: 'Meta Ads' },
  [CLINIC_ACQUISITION_CHANNELS.ORGANIC]: { label: 'Organic' },
  [CLINIC_ACQUISITION_CHANNELS.REFERRAL]: { label: 'Referral' },
  [CLINIC_ACQUISITION_CHANNELS.DIRECT]: { label: 'Direct' },
  [CLINIC_ACQUISITION_CHANNELS.OTHER]: { label: 'Other' },
})

export const CLINIC_SERVICE_LINE_STATUS_META = Object.freeze({
  [CLINIC_SERVICE_LINE_STATUSES.PLANNED]: {
    icon: 'circle',
    label: 'Planned',
    tone: 'neutral',
  },
  [CLINIC_SERVICE_LINE_STATUSES.ACTIVE]: {
    icon: 'checkCircle2',
    label: 'Active',
    tone: 'green',
  },
  [CLINIC_SERVICE_LINE_STATUSES.PAUSED]: {
    icon: 'circlePause',
    label: 'Paused',
    tone: 'neutral',
  },
})

const PROHIBITED_PATIENT_KEYS = Object.freeze([
  'date_of_birth',
  'diagnosis',
  'dob',
  'medical_record',
  'medical_record_number',
  'mrn',
  'patient_email',
  'patient_id',
  'patient_name',
  'patient_phone',
])

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue || null
}

function normalizeBoolean(value, fallback = true) {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : fallback
}

function normalizeEnum(value, enumObject, fallback) {
  return Object.values(enumObject).includes(value) ? value : fallback
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function assertClinicAggregateRecord(record, context = 'Clinic data') {
  function visit(value, path) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }

    if (!isPlainObject(value)) {
      return
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      const normalizedKey = key.toLowerCase()

      if (PROHIBITED_PATIENT_KEYS.includes(normalizedKey)) {
        throw new Error(`${context} must stay aggregate-only. Remove patient-level field "${key}".`)
      }

      visit(nestedValue, path ? `${path}.${key}` : key)
    })
  }

  visit(record, '')
}

export function normalizeClinicProfile(profile = {}) {
  assertClinicAggregateRecord(profile, 'Clinic profile')

  return {
    capacity_notes: normalizeText(profile.capacity_notes),
    client_id: normalizeText(profile.client_id),
    created_at: profile.created_at ?? null,
    id: normalizeText(profile.id),
    insurance_model: normalizeText(profile.insurance_model),
    primary_goal: normalizeText(profile.primary_goal),
    specialty: normalizeEnum(
      profile.specialty,
      CLINIC_PROFILE_SPECIALTIES,
      CLINIC_PROFILE_SPECIALTIES.OTHER,
    ),
    updated_at: profile.updated_at ?? profile.created_at ?? null,
  }
}

export function normalizeClinicLocation(location = {}) {
  assertClinicAggregateRecord(location, 'Clinic location')

  return {
    address: normalizeText(location.address),
    city: normalizeText(location.city),
    client_id: normalizeText(location.client_id),
    created_at: location.created_at ?? null,
    display_order: normalizeNumber(location.display_order),
    id: normalizeText(location.id),
    is_active: normalizeBoolean(location.is_active),
    name: normalizeText(location.name),
    updated_at: location.updated_at ?? location.created_at ?? null,
  }
}

export function normalizeClinicServiceLine(serviceLine = {}) {
  assertClinicAggregateRecord(serviceLine, 'Clinic service line')

  return {
    average_value: normalizeNumber(serviceLine.average_value),
    capacity_note: normalizeText(serviceLine.capacity_note),
    client_id: normalizeText(serviceLine.client_id),
    created_at: serviceLine.created_at ?? null,
    display_order: normalizeNumber(serviceLine.display_order),
    id: normalizeText(serviceLine.id),
    location_ids: Array.isArray(serviceLine.location_ids)
      ? serviceLine.location_ids.map(normalizeText).filter(Boolean)
      : [],
    name: normalizeText(serviceLine.name),
    primary_channel: normalizeNullableText(serviceLine.primary_channel),
    status: normalizeEnum(
      serviceLine.status,
      CLINIC_SERVICE_LINE_STATUSES,
      CLINIC_SERVICE_LINE_STATUSES.PLANNED,
    ),
    target_monthly_bookings: normalizeNumber(serviceLine.target_monthly_bookings),
    updated_at: serviceLine.updated_at ?? serviceLine.created_at ?? null,
  }
}

export function normalizePatientAcquisitionSnapshot(snapshot = {}) {
  assertClinicAggregateRecord(snapshot, 'Patient acquisition snapshot')

  return {
    attended_appointments: normalizeNumber(snapshot.attended_appointments),
    booked_appointments: normalizeNumber(snapshot.booked_appointments),
    calls: normalizeNumber(snapshot.calls),
    channel: normalizeEnum(
      snapshot.channel,
      CLINIC_ACQUISITION_CHANNELS,
      CLINIC_ACQUISITION_CHANNELS.OTHER,
    ),
    chats: normalizeNumber(snapshot.chats),
    client_id: normalizeText(snapshot.client_id),
    clicks: normalizeNumber(snapshot.clicks),
    created_at: snapshot.created_at ?? null,
    data_source: normalizeNullableText(snapshot.data_source),
    forms: normalizeNumber(snapshot.forms),
    id: normalizeText(snapshot.id),
    impressions: normalizeNumber(snapshot.impressions),
    insight: normalizeText(snapshot.insight),
    landing_page_visits: normalizeNumber(snapshot.landing_page_visits),
    last_updated_at: snapshot.last_updated_at ?? snapshot.updated_at ?? snapshot.created_at ?? null,
    location_id: normalizeNullableText(snapshot.location_id),
    period_end: normalizeText(snapshot.period_end),
    period_label: normalizeText(snapshot.period_label),
    period_start: normalizeText(snapshot.period_start),
    qualified_inquiries: normalizeNumber(snapshot.qualified_inquiries),
    service_line_id: normalizeNullableText(snapshot.service_line_id),
    spend: normalizeNumber(snapshot.spend),
    summary: normalizeText(snapshot.summary),
    updated_at: snapshot.updated_at ?? snapshot.created_at ?? null,
  }
}

function normalizeReasonBreakdown(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => ({
      count: normalizeNumber(item?.count),
      reason: normalizeText(item?.reason),
    }))
    .filter((item) => item.reason && item.count > 0)
}

export function normalizeCallBookingMetric(metric = {}) {
  assertClinicAggregateRecord(metric, 'Call booking metric')

  return {
    answered_calls: normalizeNumber(metric.answered_calls),
    average_response_seconds: normalizeNumber(metric.average_response_seconds),
    booked_from_calls: normalizeNumber(metric.booked_from_calls),
    client_id: normalizeText(metric.client_id),
    created_at: metric.created_at ?? null,
    data_source: normalizeNullableText(metric.data_source),
    first_time_calls: normalizeNumber(metric.first_time_calls),
    follow_up_needed_count: normalizeNumber(metric.follow_up_needed_count),
    form_leads: normalizeNumber(metric.form_leads),
    id: normalizeText(metric.id),
    insight: normalizeText(metric.insight),
    last_updated_at: metric.last_updated_at ?? metric.updated_at ?? metric.created_at ?? null,
    location_id: normalizeNullableText(metric.location_id),
    missed_calls: normalizeNumber(metric.missed_calls),
    no_response_leads: normalizeNumber(metric.no_response_leads),
    not_booked_reasons: normalizeReasonBreakdown(metric.not_booked_reasons),
    period_end: normalizeText(metric.period_end),
    period_label: normalizeText(metric.period_label),
    period_start: normalizeText(metric.period_start),
    service_line_id: normalizeNullableText(metric.service_line_id),
    summary: normalizeText(metric.summary),
    total_calls: normalizeNumber(metric.total_calls),
    updated_at: metric.updated_at ?? metric.created_at ?? null,
  }
}

export function normalizeReputationSnapshot(snapshot = {}) {
  assertClinicAggregateRecord(snapshot, 'Reputation snapshot')

  return {
    client_id: normalizeText(snapshot.client_id),
    created_at: snapshot.created_at ?? null,
    data_source: normalizeNullableText(snapshot.data_source),
    gbp_updates: normalizeNumber(snapshot.gbp_updates),
    google_rating: normalizeNumber(snapshot.google_rating),
    id: normalizeText(snapshot.id),
    insight: normalizeText(snapshot.insight),
    last_updated_at: snapshot.last_updated_at ?? snapshot.updated_at ?? snapshot.created_at ?? null,
    local_visibility_note: normalizeText(snapshot.local_visibility_note),
    location_id: normalizeNullableText(snapshot.location_id),
    negative_reviews: normalizeNumber(snapshot.negative_reviews),
    period_end: normalizeText(snapshot.period_end),
    period_label: normalizeText(snapshot.period_label),
    period_start: normalizeText(snapshot.period_start),
    provider_profile_completeness: normalizeNumber(snapshot.provider_profile_completeness),
    review_count: normalizeNumber(snapshot.review_count),
    review_request_sent: normalizeNumber(snapshot.review_request_sent),
    review_response_drafts: normalizeNumber(snapshot.review_response_drafts),
    reviews_gained: normalizeNumber(snapshot.reviews_gained),
    summary: normalizeText(snapshot.summary),
    unanswered_reviews: normalizeNumber(snapshot.unanswered_reviews),
    updated_at: snapshot.updated_at ?? snapshot.created_at ?? null,
  }
}
