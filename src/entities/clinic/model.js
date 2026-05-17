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
