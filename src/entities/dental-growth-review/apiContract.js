import {
  DENTAL_GROWTH_REVIEW_CONFIDENCE,
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_STATUSES,
  normalizeDentalGrowthReviewPeriod,
} from './model'

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function toIsoDate(value, fallback) {
  const date = new Date(value || fallback)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10)
}

function isPresent(value) {
  return value !== null && value !== undefined && value !== ''
}

function formatSigned(value, suffix = '') {
  if (!isPresent(value) || Number.isNaN(Number(value))) {
    return ''
  }

  const number = Number(value)
  const prefix = number > 0 ? '+' : ''

  return `${prefix}${number}${suffix}`
}

function normalizeMetricSource(value) {
  return Array.isArray(value) ? value.join(', ') : normalizeText(value)
}

function normalizeMetricSeriesPoints(source = {}) {
  return normalizeArray(source.points ?? source.series).filter(isPlainObject)
}

function normalizeMetricTarget(target) {
  if (isPlainObject(target)) {
    return {
      attainment_percent: target.attainment_percent ?? null,
      basis: normalizeText(target.basis),
      comparator: normalizeText(target.comparator),
      display_value: target.display_value ?? '',
      kind: normalizeText(target.kind),
      label: normalizeText(target.label),
      period_value: target.period_value ?? null,
      raw_value: target.raw_value ?? null,
      status: normalizeText(target.status),
    }
  }

  const label = normalizeText(target)

  return label ? { label } : null
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function getPeriodRangeFromPayload(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const period = isPlainObject(source.period) ? source.period : {}
  const end = toIsoDate(
    period.end ?? period.period_end ?? source.period_end ?? source.end,
    new Date().toISOString().slice(0, 10),
  )
  const start = toIsoDate(
    period.start ?? period.period_start ?? source.period_start ?? source.start,
    addDays(new Date(`${end}T00:00:00.000Z`), -6).toISOString().slice(0, 10),
  )

  return {
    end,
    start,
  }
}

function normalizeHeroMetric(metric = {}) {
  const source = isPlainObject(metric) ? metric : {}
  const delta = isPlainObject(source.delta) ? source.delta : {}
  const unit = source.available === false ? '' : normalizeText(source.unit)

  return {
    benchmark: normalizeText(source.benchmark),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    delta_absolute: isPresent(source.delta_absolute)
      ? formatSigned(source.delta_absolute)
      : formatSigned(delta.absolute),
    delta_percent: isPresent(source.delta_percent)
      ? formatSigned(String(source.delta_percent).replace('%', ''), '%')
      : formatSigned(delta.percent, '%'),
    formula: normalizeText(source.formula),
    id: normalizeText(source.id ?? source.metric_key ?? source.metric),
    last_updated_at: normalizeText(source.last_updated_at),
    prior_period_value: source.prior_period_value ?? source.prior_value ?? source.prior_total ?? '',
    source: normalizeMetricSource(source.source),
    status: normalizeText(source.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: normalizeMetricTarget(source.target),
    title: normalizeText(source.title ?? source.label ?? source.name),
    tooltip_definition: normalizeText(source.tooltip_definition ?? source.description),
    unit,
    value: source.value ?? '',
  }
}

function normalizeFunnelStage(stage = {}) {
  const source = isPlainObject(stage) ? stage : {}
  const stageName = normalizeText(source.stage_name ?? source.name ?? source.label ?? source.stage)
  const rawStageCount = source.stage_count ?? source.stageCount ?? source.count ?? source.output_count ?? source.outputCount ?? 0
  const inputCount = Number(source.input_count ?? source.inputCount ?? source.count ?? rawStageCount ?? 0)
  const outputCount = Number(source.output_count ?? source.outputCount ?? rawStageCount ?? 0)
  const hasConversion = source.conversion_rate != null || source.conversionRate != null || source.conversion != null
  const conversionRate = Number(source.conversion_rate ?? source.conversionRate ?? source.conversion)
  const dropOffCount = Number(source.drop_off_count ?? source.dropOffCount ?? Math.max(0, inputCount - outputCount))

  return {
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    calculation_mode: normalizeText(source.calculation_mode),
    conversion_rate: hasConversion && Number.isFinite(conversionRate) ? conversionRate : null,
    count: Number.isFinite(outputCount) ? outputCount : 0,
    description: normalizeText(source.description),
    drop_off_count: Number.isFinite(dropOffCount) ? dropOffCount : 0,
    drop_off_rate: source.drop_off_rate ?? source.dropOffRate ?? '',
    formula: normalizeText(source.formula),
    id: normalizeText(source.id ?? source.stage ?? source.stage_key ?? source.key ?? source.name),
    is_booked_stage: source.is_booked_stage === true,
    input_count: Number.isFinite(inputCount) ? inputCount : 0,
    key: normalizeText(source.key ?? source.stage_key ?? source.stage),
    name: stageName,
    output_count: Number.isFinite(outputCount) ? outputCount : 0,
    pipeline_id: normalizeText(source.pipeline_id),
    pipeline_name: normalizeText(source.pipeline_name),
    position: source.position ?? '',
    source: normalizeText(source.source),
    stage_count: Number.isFinite(outputCount) ? outputCount : 0,
    stage_id: normalizeText(source.stage_id ?? source.id),
    stage_name: stageName,
    status: normalizeText(source.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: source.target ?? source.target_rate ?? '',
    unit: normalizeText(source.unit),
  }
}

function normalizeDataSource(source = {}) {
  const value = isPlainObject(source) ? source : {}

  return {
    affected_metrics: normalizeArray(value.affected_metrics).map(normalizeText).filter(Boolean),
    failure_reason: normalizeText(value.failure_reason),
    freshness_note: normalizeText(value.freshness_note),
    freshness_status: normalizeText(value.freshness_status || value.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    id: normalizeText(value.id ?? value.source_name ?? value.name),
    last_updated_at: normalizeText(value.last_updated_at),
    owner: normalizeText(value.owner),
    source_name: normalizeText(value.source_name ?? value.name),
    source_type: normalizeText(value.source_type ?? value.type),
  }
}

function normalizeUnavailableMetric(metric = {}) {
  const source = isPlainObject(metric) ? metric : {}

  return {
    id: normalizeText(source.id ?? source.metric_key),
    reason: normalizeText(source.reason),
    title: normalizeText(source.title ?? source.name),
  }
}

function getMetricArrays(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const metrics = isPlainObject(source.metrics) ? source.metrics : {}

  return {
    dataSources: normalizeArray(source.data_sources),
    funnel: [],
    heroMetrics: Object.values(metrics),
    unavailableMetrics: normalizeArray(source.unavailable_metrics),
  }
}

export function normalizeGrowthReviewReadModel(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const range = getPeriodRangeFromPayload(source)
  const arrays = getMetricArrays(source)
  const period = isPlainObject(source.period) ? source.period : {}
  const periodType = normalizeText(period.period_type ?? period.type ?? source.period_type)
    || DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY
  const label = normalizeText(period.label ?? source.label)
    || `${range.start} - ${range.end}`

  return {
    data_sources: arrays.dataSources.map(normalizeDataSource),
    period: normalizeDentalGrowthReviewPeriod({
      calculated_at: normalizeText(source.calculated_at),
      calculation_version: normalizeText(source.calculation_version),
      client_id: normalizeText(period.client_id ?? source.client_id ?? source.workspace_id),
      content: {
        funnel: arrays.funnel.map(normalizeFunnelStage),
        funnel_highlights: isPlainObject(source.funnel_highlights) ? source.funnel_highlights : {},
        hero_metrics: arrays.heroMetrics.map(normalizeHeroMetric).slice(0, 6),
        unavailable_metrics: arrays.unavailableMetrics.map(normalizeUnavailableMetric),
      },
      data_sources: arrays.dataSources.map(normalizeDataSource),
      id: normalizeText(period.id ?? source.id) || `growth-review:${range.start}:${range.end}`,
      label,
      period_end: range.end,
      period_start: range.start,
      period_type: periodType,
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
      title: 'Dental Growth Review',
    }),
    raw: source,
    unavailable_metrics: arrays.unavailableMetrics.map(normalizeUnavailableMetric),
  }
}

function normalizeChartMetric(metric = {}) {
  const source = isPlainObject(metric) ? metric : {}
  const delta = isPlainObject(source.delta) ? source.delta : {}
  const unit = source.available === false ? '' : normalizeText(source.unit)
  const id = normalizeText(source.id ?? source.metric_key ?? source.metric)

  return {
    available: source.available !== false,
    benchmark: normalizeText(source.benchmark),
    calculation_note: normalizeText(source.calculation_note),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    date_field: normalizeText(source.date_field),
    definition: normalizeText(source.definition),
    delta_absolute: isPresent(source.delta_absolute)
      ? formatSigned(source.delta_absolute)
      : formatSigned(delta.absolute),
    delta_percent: isPresent(source.delta_percent)
      ? formatSigned(String(source.delta_percent).replace('%', ''), '%')
      : formatSigned(delta.percent, '%'),
    formula: normalizeText(source.formula),
    id,
    last_updated_at: normalizeText(source.last_updated_at ?? source.last_synced_at),
    last_synced_at: normalizeText(source.last_synced_at),
    metric: normalizeText(source.metric ?? source.metric_key ?? source.id),
    notes: normalizeArray(source.notes).map(normalizeText).filter(Boolean),
    prior_period_value: source.prior_period_value ?? source.prior_value ?? source.prior_total ?? '',
    reason: normalizeText(source.reason ?? source.unavailable_reason),
    series: normalizeMetricSeriesPoints(source),
    source: normalizeMetricSource(source.source),
    status: normalizeText(source.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: normalizeMetricTarget(source.target),
    title: normalizeText(source.title ?? source.label ?? source.name),
    tooltip_definition: normalizeText(source.tooltip_definition ?? source.description ?? source.definition),
    total: isPlainObject(source.total) ? source.total : { value: source.total ?? source.value },
    unit,
    value: source.value ?? '',
  }
}

function normalizeFunnelChart(funnel = {}) {
  const source = isPlainObject(funnel) ? funnel : {}
  const rawStages = normalizeArray(source.stages ?? source.funnel ?? source.items)

  return {
    available: source.available === true || rawStages.length > 0,
    booked_stage_id: normalizeText(source.booked_stage_id),
    calculation_note: normalizeText(source.calculation_note),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    date_range_applied: source.date_range_applied === true,
    mode: normalizeText(source.mode),
    pipeline: isPlainObject(source.pipeline) ? source.pipeline : null,
    reason: normalizeText(source.reason),
    source: normalizeText(source.source),
    stages: rawStages.map(normalizeFunnelStage),
    type: normalizeText(source.type),
  }
}

export function normalizeGrowthReviewChartsReadModel(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const metrics = isPlainObject(source.metrics) ? source.metrics : {}
  const normalizedMetrics = Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [key, normalizeChartMetric(value)]),
  )

  return {
    calculated_at: normalizeText(source.calculated_at),
    calculation_version: normalizeText(source.calculation_version),
    metrics: normalizedMetrics,
    funnel: normalizeFunnelChart(source.funnel),
    last_synced_at: normalizeText(source.last_synced_at),
    period: isPlainObject(source.period) ? source.period : {},
  }
}
