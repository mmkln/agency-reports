import {
  CLINIC_REPORTING_CAPABILITIES,
  hasCapability,
} from '../profile'

export const DENTAL_GROWTH_REVIEW_PERIOD_TYPES = Object.freeze({
  BIWEEKLY: 'biweekly',
  CUSTOM: 'custom',
  WEEKLY: 'weekly',
})

export const DENTAL_GROWTH_REVIEW_LAYER = 'dental_growth_review'

export const DENTAL_GROWTH_REVIEW_LAYER_META = Object.freeze({
  label: 'Dental Growth Review',
  requiredCapability: CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
})

export const DENTAL_GROWTH_REVIEW_STATUSES = Object.freeze({
  GREEN: 'green',
  GREY: 'grey',
  RED: 'red',
  YELLOW: 'yellow',
})

export const DENTAL_GROWTH_REVIEW_CONFIDENCE = Object.freeze({
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
  UNAVAILABLE: 'unavailable',
})

export const DENTAL_GROWTH_REVIEW_PUBLISH_STATES = Object.freeze({
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
})

export const DENTAL_GROWTH_REVIEW_VIEW_PRESETS = Object.freeze({
  EXECUTIVE: 'executive',
  OPERATOR: 'operator',
})

export const DENTAL_GROWTH_REVIEW_ZONE_IDS = Object.freeze({
  PERIOD_CONTEXT: 'period_context',
  HERO_METRICS: 'hero_metrics',
  WINS_LOSSES_NEXT: 'wins_losses_next',
  FUNNEL_CONVERSION: 'funnel_conversion',
  SPEED_TO_LEAD_CHANNEL: 'speed_to_lead_channel',
  REACTIVATION_TRACKS: 'reactivation_tracks',
  DELIVERABILITY_TEAM_HEALTH: 'deliverability_team_health',
  REPUTATION_REFERRAL: 'reputation_referral',
  DECISIONS_EXPERIMENTS: 'decisions_experiments',
})

export const DENTAL_GROWTH_REVIEW_ZONES = Object.freeze([
  {
    defaultCollapsedForExecutive: false,
    defaultCollapsedForOperator: false,
    description: 'Period, summary, alert, cadence, and freshness context before metrics.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.PERIOD_CONTEXT,
    name: 'Header & Period Context',
    number: 1,
  },
  {
    defaultCollapsedForExecutive: false,
    defaultCollapsedForOperator: false,
    description: 'Exactly six outcome-first hero metrics for the operating review.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.HERO_METRICS,
    name: 'Executive Hero Metrics',
    number: 2,
  },
  {
    defaultCollapsedForExecutive: false,
    defaultCollapsedForOperator: false,
    description: 'The 3 wins, 3 losses, and 3 next actions that turn numbers into management context.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.WINS_LOSSES_NEXT,
    name: '3 Wins / 3 Losses / 3 Next',
    number: 3,
  },
  {
    defaultCollapsedForExecutive: true,
    defaultCollapsedForOperator: false,
    description: 'Diagnostic funnel leakage and conversion velocity.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.FUNNEL_CONVERSION,
    name: 'Funnel Conversion',
    number: 4,
  },
  {
    defaultCollapsedForExecutive: true,
    defaultCollapsedForOperator: false,
    description: 'Speed-to-lead, source attribution, and channel handling.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.SPEED_TO_LEAD_CHANNEL,
    name: 'Speed-to-Lead & Channel Attribution',
    number: 5,
  },
  {
    defaultCollapsedForExecutive: true,
    defaultCollapsedForOperator: false,
    description: 'Track R/A/B/C performance, touch response, tests, cost, and capacity fill.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.REACTIVATION_TRACKS,
    name: 'Reactivation Track Performance',
    number: 6,
  },
  {
    defaultCollapsedForExecutive: true,
    defaultCollapsedForOperator: false,
    description: 'Deliverability, front desk components, calls, dispositions, and operations chips.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.DELIVERABILITY_TEAM_HEALTH,
    name: 'Deliverability & Team Health',
    number: 7,
  },
  {
    defaultCollapsedForExecutive: true,
    defaultCollapsedForOperator: false,
    description: 'Google rating, reviews, responses, referrals, and trend context.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.REPUTATION_REFERRAL,
    name: 'Reputation & Referral Health',
    number: 8,
  },
  {
    defaultCollapsedForExecutive: false,
    defaultCollapsedForOperator: false,
    description: 'Decisions needed, watching items, shipped commitments, and experiments.',
    id: DENTAL_GROWTH_REVIEW_ZONE_IDS.DECISIONS_EXPERIMENTS,
    name: 'Decisions & Experiments',
    number: 9,
  },
])

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
  'phone_number',
  'raw_conversation',
  'treatment_detail',
])

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
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

function normalizeMetric(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    benchmark: normalizeText(source.benchmark),
    confidence: normalizeEnum(
      source.confidence,
      DENTAL_GROWTH_REVIEW_CONFIDENCE,
      DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM,
    ),
    delta_absolute: source.delta_absolute ?? '',
    delta_percent: source.delta_percent ?? '',
    formula: normalizeText(source.formula),
    id: normalizeText(source.id ?? source.metric_key),
    last_updated_at: normalizeText(source.last_updated_at),
    prior_period_value: source.prior_period_value ?? '',
    source: normalizeText(source.source),
    status: normalizeEnum(source.status, DENTAL_GROWTH_REVIEW_STATUSES, DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: source.target ?? '',
    title: normalizeText(source.title ?? source.name),
    tooltip_definition: normalizeText(source.tooltip_definition ?? source.description),
    unit: normalizeText(source.unit),
    value: source.value ?? '',
  }
}

function isLegacyBiggestLeakHeroMetric(metric) {
  const id = normalizeText(metric.id).toLowerCase()
  const title = normalizeText(metric.title).toLowerCase()

  return id.includes('biggest-funnel-leak')
    || id.includes('biggest-leak')
    || title === 'biggest funnel leak'
}

function createLegacyLtvCacHeroMetric() {
  return normalizeMetric({
    confidence: DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM,
    delta_absolute: '+0.4',
    formula: 'average lifetime value / blended CAC',
    id: 'ltv-cac',
    prior_period_value: '4.1:1',
    source: 'Dentrix historicals + Cost Per Attended / New Patient',
    status: DENTAL_GROWTH_REVIEW_STATUSES.GREEN,
    target: '3:1 minimum, 5:1+ premium',
    title: 'LTV:CAC Ratio',
    tooltip_definition: 'Average patient lifetime value divided by blended acquisition cost. Use as directional unless Dentrix historicals are current.',
    value: '4.5:1',
  })
}

function normalizeHeroMetrics(value) {
  return normalizeArray(value)
    .map(normalizeMetric)
    .slice(0, 6)
    .map((metric) => (isLegacyBiggestLeakHeroMetric(metric) ? createLegacyLtvCacHeroMetric() : metric))
}

function normalizeNarrativeItem(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    body: normalizeText(source.body),
    created_by: normalizeText(source.created_by ?? 'auto'),
    id: normalizeText(source.id),
    impact_level: normalizeText(source.impact_level ?? 'medium'),
    metric_delta: source.metric_delta ?? '',
    next_implication: normalizeText(source.next_implication),
    owner: normalizeText(source.owner),
    supporting_metric_id: normalizeText(source.supporting_metric_id),
    title: normalizeText(source.title),
    type: normalizeText(source.type),
    why_it_matters: normalizeText(source.why_it_matters),
  }
}

function normalizeDecision(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    context: normalizeText(source.context),
    decision_due_by: normalizeText(source.decision_due_by),
    estimated_impact: normalizeText(source.estimated_impact),
    id: normalizeText(source.id),
    options: normalizeArray(source.options).map(normalizeText).filter(Boolean),
    owner: normalizeText(source.owner),
    recommended_decision: normalizeText(source.recommended_decision),
    risk: normalizeText(source.risk),
    status: normalizeText(source.status ?? 'pending'),
    title: normalizeText(source.title),
  }
}

function normalizeExperiment(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    current_result: normalizeText(source.current_result),
    decision_status: normalizeText(source.decision_status ?? source.status),
    end_date: normalizeText(source.end_date),
    hypothesis: normalizeText(source.hypothesis),
    id: normalizeText(source.id),
    name: normalizeText(source.name ?? source.experiment_name),
    next_action: normalizeText(source.next_action),
    observed_lift: normalizeText(source.observed_lift),
    owner: normalizeText(source.owner),
    primary_metric: normalizeText(source.primary_metric ?? source.primary_metric_key),
    sample_size_a: source.sample_size_a ?? '',
    sample_size_b: source.sample_size_b ?? '',
    start_date: normalizeText(source.start_date),
    variant_a: normalizeText(source.variant_a),
    variant_b: normalizeText(source.variant_b),
  }
}

function normalizeDataSource(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    affected_metrics: normalizeArray(source.affected_metrics).map(normalizeText).filter(Boolean),
    failure_reason: normalizeText(source.failure_reason),
    freshness_note: normalizeText(source.freshness_note),
    freshness_status: normalizeEnum(
      source.freshness_status,
      DENTAL_GROWTH_REVIEW_STATUSES,
      DENTAL_GROWTH_REVIEW_STATUSES.GREY,
    ),
    id: normalizeText(source.id),
    last_updated_at: normalizeText(source.last_updated_at),
    owner: normalizeText(source.owner),
    source_name: normalizeText(source.source_name ?? source.name),
    source_type: normalizeText(source.source_type),
  }
}

function normalizeZone(value = {}) {
  const source = isPlainObject(value) ? value : {}
  const zoneNumber = normalizeNumber(source.zone_number ?? source.number)
  const zoneMeta = DENTAL_GROWTH_REVIEW_ZONES.find((zone) => zone.number === zoneNumber)

  return {
    content: isPlainObject(source.content) ? source.content : {},
    description: normalizeText(source.description ?? zoneMeta?.description),
    id: normalizeText(source.id ?? zoneMeta?.id),
    name: normalizeText(source.name ?? zoneMeta?.name),
    number: zoneMeta?.number ?? zoneNumber,
    sort_order: normalizeNumber(source.sort_order, zoneMeta?.number ?? zoneNumber),
  }
}

function normalizeContent(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    channel_attribution: normalizeArray(source.channel_attribution).map((item) => (isPlainObject(item) ? item : {})),
    closed_loops: normalizeArray(source.closed_loops).map((item) => (isPlainObject(item) ? item : {})),
    decisions: normalizeArray(source.decisions).map(normalizeDecision).slice(0, 3),
    experiments: normalizeArray(source.experiments).map(normalizeExperiment),
    front_desk_health: normalizeArray(source.front_desk_health).map(normalizeMetric),
    funnel: normalizeArray(source.funnel).map((item) => (isPlainObject(item) ? item : {})),
    funnel_highlights: isPlainObject(source.funnel_highlights) ? source.funnel_highlights : {},
    heatmaps: isPlainObject(source.heatmaps) ? source.heatmaps : {},
    hero_metrics: normalizeHeroMetrics(source.hero_metrics),
    metrics: normalizeArray(source.metrics).map(normalizeMetric),
    narrative_items: normalizeArray(source.narrative_items).map(normalizeNarrativeItem),
    operations_chips: normalizeArray(source.operations_chips).map(normalizeMetric),
    period_context: isPlainObject(source.period_context) ? source.period_context : {},
    reactivation_tracks: normalizeArray(source.reactivation_tracks).map((item) => (isPlainObject(item) ? item : {})),
    reputation_referral: normalizeArray(source.reputation_referral).map(normalizeMetric),
    speed_to_lead: normalizeArray(source.speed_to_lead).map(normalizeMetric),
    watching: normalizeArray(source.watching).map((item) => (isPlainObject(item) ? item : {})),
  }
}

export function assertNoDentalGrowthReviewPatientFields(record, context = 'Dental growth review') {
  function visit(value, path) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }

    if (!isPlainObject(value)) {
      return
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (PROHIBITED_PATIENT_KEYS.includes(key.toLowerCase())) {
        throw new Error(`${context} must stay aggregate-only. Remove patient-level field "${key}".`)
      }

      visit(nestedValue, path ? `${path}.${key}` : key)
    })
  }

  visit(record, '')
}

export function normalizeDentalGrowthReviewPeriod(record = {}) {
  const source = isPlainObject(record) ? record : {}

  return {
    calculated_at: normalizeText(source.calculated_at),
    calculation_version: normalizeText(source.calculation_version),
    client_id: normalizeText(source.client_id),
    content: normalizeContent(source.content),
    created_at: normalizeText(source.created_at),
    data_sources: normalizeArray(source.data_sources).map(normalizeDataSource),
    id: normalizeText(source.id),
    label: normalizeText(source.label),
    period_end: normalizeText(source.period_end),
    period_start: normalizeText(source.period_start),
    period_type: normalizeEnum(
      source.period_type,
      DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
      DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
    ),
    publish_state: normalizeEnum(
      source.publish_state,
      DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
      DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    ),
    title: normalizeText(source.title),
    updated_at: normalizeText(source.updated_at),
    zones: normalizeArray(source.zones).map(normalizeZone).sort((left, right) => left.sort_order - right.sort_order),
  }
}

export function validateDentalGrowthReviewPeriod(record) {
  const rawHeroMetrics = normalizeArray(record?.content?.hero_metrics)
  const rawDecisions = normalizeArray(record?.content?.decisions)
  assertNoDentalGrowthReviewPatientFields(record)
  const period = normalizeDentalGrowthReviewPeriod(record)

  assertNoDentalGrowthReviewPatientFields(period)

  if (period.zones.length !== 9) {
    throw new Error('Dental growth review must define exactly 9 zones.')
  }

  if (rawHeroMetrics.length !== 6) {
    throw new Error('Dental growth review must define exactly 6 hero metrics.')
  }

  if (rawDecisions.length > 3) {
    throw new Error('Decisions Needed must contain no more than 3 items.')
  }

  return period
}

export function getDentalGrowthReviewPresetForViewer(viewer) {
  return viewer?.agencyMemberships?.length
    ? DENTAL_GROWTH_REVIEW_VIEW_PRESETS.OPERATOR
    : DENTAL_GROWTH_REVIEW_VIEW_PRESETS.EXECUTIVE
}

export function canViewerAccessDentalGrowthReview(viewer) {
  return hasCapability(viewer, CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW)
}

