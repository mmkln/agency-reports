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

  return {
    benchmark: normalizeText(source.benchmark),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    delta_absolute: source.delta_absolute ?? source.period_delta?.absolute ?? '',
    delta_percent: source.delta_percent ?? source.period_delta?.percent ?? '',
    formula: normalizeText(source.formula),
    id: normalizeText(source.id ?? source.metric_key),
    last_updated_at: normalizeText(source.last_updated_at),
    prior_period_value: source.prior_period_value ?? source.prior_value ?? '',
    source: Array.isArray(source.source) ? source.source.join(', ') : normalizeText(source.source),
    status: normalizeText(source.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: source.target ?? '',
    title: normalizeText(source.title ?? source.name),
    tooltip_definition: normalizeText(source.tooltip_definition ?? source.description),
    unit: normalizeText(source.unit),
    value: source.value ?? '',
  }
}

function normalizeFunnelStage(stage = {}) {
  const source = isPlainObject(stage) ? stage : {}
  const inputCount = Number(source.input_count ?? source.inputCount ?? source.count ?? 0)
  const outputCount = Number(source.output_count ?? source.outputCount ?? source.stage_count ?? source.count ?? 0)
  const conversionRate = Number(source.conversion_rate ?? source.conversionRate ?? source.conversion ?? 0)
  const dropOffCount = Number(source.drop_off_count ?? source.dropOffCount ?? Math.max(0, inputCount - outputCount))

  return {
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    conversion_rate: Number.isFinite(conversionRate) ? conversionRate : 0,
    drop_off_count: Number.isFinite(dropOffCount) ? dropOffCount : 0,
    drop_off_rate: source.drop_off_rate ?? source.dropOffRate ?? '',
    id: normalizeText(source.id ?? source.stage ?? source.stage_key ?? source.name),
    input_count: Number.isFinite(inputCount) ? inputCount : 0,
    name: normalizeText(source.name ?? source.stage_name ?? source.label ?? source.stage),
    output_count: Number.isFinite(outputCount) ? outputCount : 0,
    stage_count: Number.isFinite(outputCount) ? outputCount : 0,
    status: normalizeText(source.status || DENTAL_GROWTH_REVIEW_STATUSES.GREY),
    target: source.target ?? source.target_rate ?? '',
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
  const content = isPlainObject(source.content) ? source.content : {}

  return {
    dataSources: normalizeArray(source.data_sources ?? content.data_sources),
    funnel: normalizeArray(source.funnel ?? content.funnel),
    heroMetrics: normalizeArray(source.hero_metrics ?? content.hero_metrics),
    unavailableMetrics: normalizeArray(source.unavailable_metrics ?? content.unavailable_metrics),
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

  return {
    calculation_note: normalizeText(source.calculation_note),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    date_field: normalizeText(source.date_field),
    definition: normalizeText(source.definition),
    formula: normalizeText(source.formula),
    last_synced_at: normalizeText(source.last_synced_at),
    metric: normalizeText(source.metric),
    notes: normalizeArray(source.notes).map(normalizeText).filter(Boolean),
    series: normalizeArray(source.series).filter(isPlainObject),
    source: normalizeText(source.source),
    total: isPlainObject(source.total) ? source.total : {},
  }
}

function normalizeHeroMetricSeries(series = {}) {
  const source = isPlainObject(series) ? series : {}
  const normalized = {}

  Object.entries(source).forEach(([metricId, value]) => {
    const metricSeries = isPlainObject(value) ? value : {}

    normalized[metricId] = {
      available: metricSeries.available === true,
      calculation_note: normalizeText(metricSeries.calculation_note),
      chart_type: normalizeText(metricSeries.chart_type),
      confidence: normalizeText(metricSeries.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
      date_field: normalizeText(metricSeries.date_field),
      metric: normalizeText(metricSeries.metric || metricId),
      points: normalizeArray(metricSeries.points).filter(isPlainObject),
      reason: normalizeText(metricSeries.reason),
      source: normalizeText(metricSeries.source),
      total: metricSeries.total ?? null,
      unit: normalizeText(metricSeries.unit),
    }
  })

  return normalized
}

function normalizeFunnelChart(funnel = {}) {
  const source = isPlainObject(funnel) ? funnel : {}
  const rawStages = normalizeArray(source.stages ?? source.funnel ?? source.items)

  return {
    available: source.available === true || rawStages.length > 0,
    calculation_note: normalizeText(source.calculation_note),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    reason: normalizeText(source.reason),
    source: normalizeText(source.source),
    stages: rawStages.map(normalizeFunnelStage),
  }
}

export function normalizeGrowthReviewChartsReadModel(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const metrics = isPlainObject(source.metrics) ? source.metrics : {}

  return {
    calculated_at: normalizeText(source.calculated_at),
    calculation_version: normalizeText(source.calculation_version),
    metrics: {
      attended_appointments_by_day: normalizeChartMetric(metrics.attended_appointments_by_day),
      booked_appointments_by_day: normalizeChartMetric(metrics.booked_appointments_by_day),
      show_rate_by_day: normalizeChartMetric(metrics.show_rate_by_day),
    },
    funnel: normalizeFunnelChart(source.funnel),
    hero_metric_series: normalizeHeroMetricSeries(source.hero_metric_series),
    last_synced_at: normalizeText(source.last_synced_at),
    period: isPlainObject(source.period) ? source.period : {},
  }
}
