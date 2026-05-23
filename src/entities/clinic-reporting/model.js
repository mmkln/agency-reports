import {
  CLINIC_REPORTING_CAPABILITIES,
  hasCapability,
} from '../profile'

export const CLINIC_REPORTING_LAYERS = Object.freeze({
  DAILY_OPERATIONS: 'daily_operations',
  EXECUTIVE_PERFORMANCE: 'executive_performance',
  MONTHLY_STRATEGY: 'monthly_strategy',
  WEEKLY_OPERATOR: 'weekly_operator',
})

export const CLINIC_REPORTING_PUBLISH_STATES = Object.freeze({
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
})

export const CLINIC_REPORTING_DATA_MODES = Object.freeze({
  IMPORTED: 'imported',
  INTEGRATION: 'integration',
  MANUAL: 'manual',
})

export const CLINIC_REPORTING_CONFIDENCE = Object.freeze({
  ESTIMATED: 'estimated',
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
})

export const CLINIC_REPORTING_FRESHNESS_STATUSES = Object.freeze({
  CURRENT: 'current',
  MISSING: 'missing',
  STALE: 'stale',
})

export const CLINIC_REPORTING_SOURCE_TYPES = Object.freeze({
  ADS: 'ads',
  CRM: 'crm',
  FINANCE: 'finance',
  MANUAL: 'manual',
  PRACTICE_MANAGEMENT: 'practice_management',
  REVIEWS: 'reviews',
  SCHEDULING: 'scheduling',
})

export const CLINIC_REPORTING_LAYER_META = Object.freeze({
  [CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS]: {
    label: 'Daily Operations',
    requiredCapability: CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW,
  },
  [CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR]: {
    label: 'Weekly Operator',
    requiredCapability: CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW,
  },
  [CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE]: {
    label: 'Executive Performance',
    requiredCapability: CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
  },
  [CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY]: {
    label: 'Monthly Strategy',
    requiredCapability: CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW,
  },
})

export const CLINIC_REPORTING_PUBLISH_STATE_META = Object.freeze({
  [CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
  [CLINIC_REPORTING_PUBLISH_STATES.DRAFT]: {
    icon: 'fileText',
    label: 'Draft',
    tone: 'neutral',
  },
  [CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED]: {
    icon: 'checkCircle2',
    label: 'Published',
    tone: 'green',
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value)
  return normalized || null
}

function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeEnum(value, enumObject, fallback) {
  return Object.values(enumObject).includes(value) ? value : fallback
}

function compactObject(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined))
}

export function assertNoPatientLevelFields(record, context = 'Clinic reporting data') {
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

function normalizeMetric(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactObject({
    benchmark: normalizeText(source.benchmark),
    delta: source.delta ?? '',
    id: normalizeText(source.id),
    label: normalizeText(source.label ?? source.name),
    source: normalizeText(source.source),
    status: normalizeText(source.status),
    unit: normalizeText(source.unit),
    value: source.value ?? '',
  })
}

function normalizeSourceTrustItem(value = {}) {
  const source = isPlainObject(value) ? value : {}
  const lastUpdatedAt = normalizeText(source.last_updated_at)

  return {
    confidence: normalizeEnum(
      source.confidence,
      CLINIC_REPORTING_CONFIDENCE,
      CLINIC_REPORTING_CONFIDENCE.MEDIUM,
    ),
    data_mode: normalizeEnum(
      source.data_mode,
      CLINIC_REPORTING_DATA_MODES,
      CLINIC_REPORTING_DATA_MODES.MANUAL,
    ),
    freshness_status: normalizeEnum(
      source.freshness_status,
      CLINIC_REPORTING_FRESHNESS_STATUSES,
      lastUpdatedAt
        ? CLINIC_REPORTING_FRESHNESS_STATUSES.CURRENT
        : CLINIC_REPORTING_FRESHNESS_STATUSES.MISSING,
    ),
    last_updated_at: lastUpdatedAt,
    name: normalizeText(source.name),
    source_type: normalizeEnum(
      source.source_type,
      CLINIC_REPORTING_SOURCE_TYPES,
      CLINIC_REPORTING_SOURCE_TYPES.MANUAL,
    ),
  }
}

function normalizeQueueItem(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactObject({
    age_minutes: normalizeNumber(source.age_minutes),
    channel: normalizeText(source.channel),
    due_at: normalizeText(source.due_at),
    id: normalizeText(source.id),
    priority: normalizeText(source.priority),
    status: normalizeText(source.status),
    title: normalizeText(source.title),
  })
}

function normalizeAlert(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactObject({
    count: normalizeNumber(source.count),
    id: normalizeText(source.id),
    label: normalizeText(source.label),
    severity: normalizeText(source.severity),
    threshold: normalizeText(source.threshold),
  })
}

function normalizeDailyOperationsContent(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    alerts: normalizeArray(source.alerts).map(normalizeAlert),
    appointment_snapshot: isPlainObject(source.appointment_snapshot) ? source.appointment_snapshot : {},
    booking_scorecard: normalizeArray(source.booking_scorecard).map(normalizeMetric),
    call_queue: normalizeArray(source.call_queue).map(normalizeQueueItem),
    callback_queue: normalizeArray(source.callback_queue).map(normalizeQueueItem),
    data_hygiene: normalizeArray(source.data_hygiene).map(normalizeMetric),
    receptionist_scorecard: normalizeArray(source.receptionist_scorecard).map(normalizeMetric),
    reactivation_tracks: normalizeArray(source.reactivation_tracks).map(normalizeMetric),
    reply_queue: normalizeArray(source.reply_queue).map(normalizeQueueItem),
    workflow_alerts: normalizeArray(source.workflow_alerts).map(normalizeAlert),
  }
}

function normalizeNarrativeBlock(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    decisions_needed: normalizeArray(source.decisions_needed).map(normalizeText).filter(Boolean),
    losses: normalizeArray(source.losses).map(normalizeText).filter(Boolean),
    narrative: normalizeText(source.narrative),
    next: normalizeArray(source.next).map(normalizeText).filter(Boolean),
    watching: normalizeArray(source.watching).map(normalizeText).filter(Boolean),
    wins: normalizeArray(source.wins).map(normalizeText).filter(Boolean),
  }
}

function normalizeGenericLayerContent(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    channel_performance: normalizeArray(source.channel_performance).map((item) => (isPlainObject(item) ? item : {})),
    deliverability: normalizeArray(source.deliverability).map(normalizeMetric),
    experiments: normalizeArray(source.experiments).map((item) => (isPlainObject(item) ? item : {})),
    financials: normalizeArray(source.financials).map(normalizeMetric),
    funnel: normalizeArray(source.funnel).map(normalizeMetric),
    hero_metrics: normalizeArray(source.hero_metrics).map(normalizeMetric),
    narrative: normalizeNarrativeBlock(source.narrative),
    pipeline_health: normalizeArray(source.pipeline_health).map(normalizeMetric),
    practice_quality: normalizeArray(source.practice_quality).map(normalizeMetric),
    reactivation_tracks: normalizeArray(source.reactivation_tracks).map(normalizeMetric),
    retention: normalizeArray(source.retention).map(normalizeMetric),
    trends: normalizeArray(source.trends).map((item) => (isPlainObject(item) ? item : {})),
    unit_economics: normalizeArray(source.unit_economics).map(normalizeMetric),
  }
}

export function normalizeClinicReportingContent(content, layer) {
  if (layer === CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS) {
    return normalizeDailyOperationsContent(content)
  }

  return normalizeGenericLayerContent(content)
}

export function normalizeClinicReportingPeriod(record = {}, fallbackLayer = CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE) {
  const source = isPlainObject(record) ? record : {}
  const layer = normalizeEnum(source.layer, CLINIC_REPORTING_LAYERS, fallbackLayer)

  return {
    archived_at: normalizeNullableText(source.archived_at),
    client_id: normalizeText(source.client_id),
    content: normalizeClinicReportingContent(source.content, layer),
    created_at: normalizeText(source.created_at),
    created_by: normalizeNullableText(source.created_by),
    id: normalizeText(source.id),
    imported_at: normalizeNullableText(source.imported_at),
    layer,
    period_end: normalizeText(source.period_end),
    period_label: normalizeText(source.period_label),
    period_start: normalizeText(source.period_start),
    publish_state: normalizeEnum(
      source.publish_state,
      CLINIC_REPORTING_PUBLISH_STATES,
      CLINIC_REPORTING_PUBLISH_STATES.DRAFT,
    ),
    published_at: normalizeNullableText(source.published_at),
    published_by: normalizeNullableText(source.published_by),
    source_trust: normalizeArray(source.source_trust).map(normalizeSourceTrustItem),
    title: normalizeText(source.title),
    updated_at: normalizeText(source.updated_at),
    updated_by: normalizeNullableText(source.updated_by),
  }
}

export function canViewerAccessClinicReportingLayer(viewer, layer) {
  const requiredCapability = CLINIC_REPORTING_LAYER_META[layer]?.requiredCapability
  return hasCapability(viewer, requiredCapability)
}

export function canViewerAccessOperationalRows(viewer) {
  return hasCapability(viewer, CLINIC_REPORTING_CAPABILITIES.OPERATIONAL_ROWS_VIEW)
}

export function canViewerImportClinicReporting(viewer) {
  return hasCapability(viewer, CLINIC_REPORTING_CAPABILITIES.REPORTING_IMPORT)
}

export function canViewerPublishClinicReporting(viewer) {
  return hasCapability(viewer, CLINIC_REPORTING_CAPABILITIES.REPORTING_PUBLISH)
}

export function isClientFacingClinicReportingLayer(layer) {
  return [
    CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE,
    CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY,
  ].includes(layer)
}
