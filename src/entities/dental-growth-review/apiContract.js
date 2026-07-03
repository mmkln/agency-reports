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
    breakdowns: normalizeFunnelBreakdowns(source.breakdowns),
    calculation_note: normalizeText(source.calculation_note),
    confidence: normalizeText(source.confidence || DENTAL_GROWTH_REVIEW_CONFIDENCE.MEDIUM),
    currentStageCounts: normalizeCurrentStageCounts(source.current_stage_counts ?? source.currentStageCounts),
    date_range_applied: source.date_range_applied === true,
    mode: normalizeText(source.mode),
    pipeline: isPlainObject(source.pipeline) ? source.pipeline : null,
    reason: normalizeText(source.reason),
    source: normalizeText(source.source),
    stages: rawStages.map(normalizeFunnelStage),
    type: normalizeText(source.type),
  }
}

function normalizeCurrentStageCount(source = {}) {
  const value = isPlainObject(source) ? source : {}

  return {
    calculationMode: normalizeText(value.calculation_mode ?? value.calculationMode),
    count: Number(value.count ?? value.stage_count ?? value.stageCount ?? 0),
    entity: normalizeText(value.entity),
    formula: normalizeText(value.formula),
    opportunityCount: Number(value.opportunity_count ?? value.opportunityCount ?? 0),
    pipelineId: normalizeText(value.pipeline_id ?? value.pipelineId),
    pipelineName: normalizeText(value.pipeline_name ?? value.pipelineName),
    stageId: normalizeText(value.stage_id ?? value.stageId),
    stageName: normalizeText(value.stage_name ?? value.stageName),
  }
}

function normalizeCurrentStageCounts(source = {}) {
  const value = isPlainObject(source) ? source : {}

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      normalizeText(key),
      normalizeCurrentStageCount(item),
    ]),
  )
}

function normalizeFunnelBreakdown(source = {}) {
  const value = isPlainObject(source) ? source : {}

  return {
    dimension: normalizeText(value.dimension),
    id: normalizeText(value.id ?? value.key),
    key: normalizeText(value.key),
    label: normalizeText(value.label ?? value.key),
    stages: normalizeArray(value.stages).map(normalizeFunnelStage),
  }
}

function normalizeFunnelBreakdowns(source = {}) {
  const value = isPlainObject(source) ? source : {}

  return {
    by_track: normalizeArray(value.by_track).map(normalizeFunnelBreakdown),
  }
}

function normalizeReactivationActivityPoint(point = {}) {
  const source = isPlainObject(point) ? point : {}
  const date = normalizeText(source.date)

  return {
    bookings: Number(source.bookings ?? 0),
    call: Number(source.call ?? 0),
    cumulativeBookings: Number(source.cumulative_bookings ?? source.cumulativeBookings ?? 0),
    date,
    email: Number(source.email ?? 0),
    label: normalizeText(source.label) || date,
    sms: Number(source.sms ?? 0),
    totalTouches: Number(source.total_touches ?? source.totalTouches ?? 0),
  }
}

function normalizeReactivationActivityCard(card = {}) {
  const source = isPlainObject(card) ? card : {}

  return {
    displayValue: normalizeText(source.display_value ?? source.displayValue),
    key: normalizeText(source.key),
    label: normalizeText(source.label),
    unit: normalizeText(source.unit),
    value: source.value ?? 0,
  }
}

function normalizeReactivationActivityChart(chart = {}) {
  const source = isPlainObject(chart) ? chart : {}

  return {
    available: source.available === true,
    cards: normalizeArray(source.cards).map(normalizeReactivationActivityCard),
    label: normalizeText(source.label),
    reason: normalizeText(source.reason),
    series: normalizeArray(source.series).map(normalizeReactivationActivityPoint),
    summary: isPlainObject(source.summary) ? source.summary : {},
    type: normalizeText(source.type),
  }
}

function normalizeWeeklyActivityWeek(week = {}) {
  const source = isPlainObject(week) ? week : {}

  return {
    end: normalizeText(source.end ?? source.week_end),
    index: Number(source.index ?? source.week_index ?? 0) || 0,
    key: normalizeText(source.key ?? source.week),
    start: normalizeText(source.start ?? source.week_start),
  }
}

function normalizeWeeklyActivityTrack(track = {}) {
  const source = isPlainObject(track) ? track : {}

  return {
    key: normalizeText(source.key),
    label: normalizeText(source.label ?? source.track_label ?? source.name),
  }
}

function normalizeWeeklyActivityRow(row = {}) {
  const source = isPlainObject(row) ? row : {}

  return {
    call: Number(source.call ?? 0) || 0,
    email: Number(source.email ?? 0) || 0,
    sms: Number(source.sms ?? 0) || 0,
    total: Number(source.total ?? 0) || 0,
    track: normalizeText(source.track),
    trackLabel: normalizeText(source.track_label ?? source.trackLabel),
    week: normalizeText(source.week),
    weekEnd: normalizeText(source.week_end ?? source.weekEnd),
    weekIndex: Number(source.week_index ?? source.weekIndex ?? 0) || 0,
    weekStart: normalizeText(source.week_start ?? source.weekStart),
  }
}

function normalizeWeeklyActivitySection(section = {}) {
  const source = isPlainObject(section) ? section : {}

  return {
    available: source.available === true,
    calculationMethod: normalizeText(source.calculation_method ?? source.calculationMethod),
    campaign: isPlainObject(source.campaign) ? source.campaign : {},
    channels: normalizeArray(source.channels).map(normalizeText).filter(Boolean),
    reason: normalizeText(source.reason),
    rows: normalizeArray(source.rows).map(normalizeWeeklyActivityRow),
    source: isPlainObject(source.source) ? source.source : {},
    sourceCounts: isPlainObject(source.source_counts)
      ? source.source_counts
      : isPlainObject(source.sourceCounts)
        ? source.sourceCounts
        : {},
    tracks: normalizeArray(source.tracks).map(normalizeWeeklyActivityTrack),
    type: normalizeText(source.type),
    weeks: normalizeArray(source.weeks).map(normalizeWeeklyActivityWeek),
  }
}

function normalizeAcceptedTreatmentValueCard(card = {}) {
  const source = isPlainObject(card) ? card : {}

  return {
    key: normalizeText(source.key),
    label: normalizeText(source.label),
    value: source.value ?? '0.00',
  }
}

function normalizeAcceptedTreatmentValueRow(row = {}) {
  const source = isPlainObject(row) ? row : {}
  const rawValues = isPlainObject(source.raw_values)
    ? source.raw_values
    : isPlainObject(source.rawValues)
      ? source.rawValues
      : {}

  return {
    contactId: normalizeText(source.contact_id ?? source.contactId),
    contactName: normalizeText(source.contact_name ?? source.contactName),
    expectedValue: source.expected_value ?? source.expectedValue ?? '0.00',
    firstTimeValue: source.first_time_value ?? source.firstTimeValue ?? '0.00',
    id: normalizeText(source.id),
    lifetimeValue: source.lifetime_value ?? source.lifetimeValue ?? '0.00',
    openValue: source.open_value ?? source.openValue ?? '0.00',
    opportunityId: normalizeText(source.opportunity_id ?? source.opportunityId),
    opportunityName: normalizeText(source.opportunity_name ?? source.opportunityName),
    paidValue: source.paid_value ?? source.paidValue ?? '0.00',
    pendingProcedureTotalFee: source.pending_procedure_total_fee
      ?? source.pendingProcedureTotalFee
      ?? '0.00',
    rawValues,
    track: normalizeText(source.track),
    trackLabel: normalizeText(source.track_label ?? source.trackLabel),
    totalExpectedValue: source.total_expected_value ?? source.totalExpectedValue ?? '0.00',
    valueFromIstart: source.value_from_istart ?? source.valueFromIstart ?? '0.00',
  }
}

function normalizeAcceptedTreatmentValueBreakdown(chart = {}) {
  const source = isPlainObject(chart) ? chart : {}
  const summary = isPlainObject(source.summary) ? source.summary : {}

  return {
    available: source.available === true,
    currency: normalizeText(source.currency || 'USD'),
    reason: normalizeText(source.reason),
    summary: {
      cards: normalizeArray(summary.cards).map(normalizeAcceptedTreatmentValueCard),
      rawTotals: isPlainObject(summary.raw_totals)
        ? summary.raw_totals
        : isPlainObject(summary.rawTotals)
          ? summary.rawTotals
          : {},
      rows: normalizeArray(summary.rows).map(normalizeAcceptedTreatmentValueRow),
      totals: isPlainObject(summary.totals) ? summary.totals : {},
    },
    title: normalizeText(source.title) || 'Accepted Treatment Value Breakdown',
    type: normalizeText(source.type),
  }
}

function normalizeBookedAppointmentsByReplyChannelRow(row = {}) {
  const source = isPlainObject(row) ? row : {}

  return {
    email: Number(source.email ?? 0) || 0,
    percentOfTotal: Number(source.percent_of_total ?? source.percentOfTotal ?? 0) || 0,
    sms: Number(source.sms ?? 0) || 0,
    total: Number(source.total ?? 0) || 0,
    track: normalizeText(source.track),
    trackLabel: normalizeText(source.track_label ?? source.trackLabel),
  }
}

function normalizeBookedAppointmentsByReplyChannel(chart = {}) {
  const source = isPlainObject(chart) ? chart : {}
  const totals = isPlainObject(source.totals) ? source.totals : {}

  return {
    available: source.available === true,
    channels: normalizeArray(source.channels).map((channel) => ({
      key: normalizeText(channel?.key),
      label: normalizeText(channel?.label),
    })),
    reason: normalizeText(source.reason),
    rows: normalizeArray(source.rows).map(normalizeBookedAppointmentsByReplyChannelRow),
    title: normalizeText(source.title) || 'Booked Appointments by Reply Channel',
    totals: {
      email: Number(totals.email ?? 0) || 0,
      percentOfTotal: Number(totals.percent_of_total ?? totals.percentOfTotal ?? 0) || 0,
      sms: Number(totals.sms ?? 0) || 0,
      total: Number(totals.total ?? 0) || 0,
      unattributed: Number(totals.unattributed ?? 0) || 0,
    },
    type: normalizeText(source.type),
  }
}

export const DEFAULT_GROWTH_REVIEW_LAYOUT_ITEMS = [
  { label: 'Accepted Treatment Value Breakdown', widgetKey: 'accepted_treatment_value_breakdown' },
  { label: 'Reactivation Activity', widgetKey: 'reactivation_activity' },
  { label: 'Breakdown by Track', widgetKey: 'booked_appointments_by_reply_channel' },
  { label: 'Weekly Activity', widgetKey: 'weekly_track_activity' },
  { label: 'Bookings by Track', widgetKey: 'bookings_by_track' },
  { label: 'Reactivation Lifecycle', widgetKey: 'reactivation_lifecycle' },
]

function normalizeLayoutItem(item = {}, index = 0) {
  const source = isPlainObject(item) ? item : {}
  const widgetKey = normalizeText(source.widget_key ?? source.widgetKey ?? source.key)

  return {
    label: normalizeText(source.label),
    position: Number(source.position ?? (index + 1) * 10),
    widgetKey,
  }
}

export function normalizeGrowthReviewDashboardLayout(layout = {}) {
  const source = isPlainObject(layout) ? layout : {}
  const rawItems = normalizeArray(source.items)
  const items = rawItems.length
    ? rawItems.map(normalizeLayoutItem).filter((item) => item.widgetKey)
    : DEFAULT_GROWTH_REVIEW_LAYOUT_ITEMS.map((item, index) => ({
      ...item,
      position: (index + 1) * 10,
    }))

  return {
    dashboardType: normalizeText(source.dashboard_type ?? source.dashboardType) || 'growth_review_reactivation',
    isDefault: source.is_default === true || source.isDefault === true,
    items,
    layoutVersion: Number(source.layout_version ?? source.layoutVersion ?? 1) || 1,
    updatedAt: normalizeText(source.updated_at ?? source.updatedAt),
    updatedBy: normalizeText(source.updated_by ?? source.updatedBy),
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
  }
}

export function normalizeGrowthReviewWeeklyReportingReadModel(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const weeklyReporting = isPlainObject(source.weekly_reporting)
    ? source.weekly_reporting
    : isPlainObject(source.weeklyReporting)
      ? source.weeklyReporting
      : {}

  return {
    section1Activity: normalizeWeeklyActivitySection(
      weeklyReporting.section_1_activity ?? weeklyReporting.section1Activity,
    ),
  }
}

export function normalizeGrowthReviewChartsReadModel(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const charts = isPlainObject(source.charts) ? source.charts : source
  const metrics = isPlainObject(charts.metrics)
    ? charts.metrics
    : isPlainObject(source.metrics)
      ? source.metrics
      : {}
  const normalizedMetrics = Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [key, normalizeChartMetric(value)]),
  )
  const funnel = isPlainObject(charts.funnel)
    ? charts.funnel
    : isPlainObject(charts.reactivation_lifecycle)
      ? charts.reactivation_lifecycle
      : source.funnel

  return {
    calculated_at: normalizeText(source.calculated_at),
    calculation_version: normalizeText(source.calculation_version),
    acceptedTreatmentValueBreakdown: normalizeAcceptedTreatmentValueBreakdown(
      charts.accepted_treatment_value_breakdown ?? charts.acceptedTreatmentValueBreakdown,
    ),
    bookedAppointmentsByReplyChannel: normalizeBookedAppointmentsByReplyChannel(
      charts.booked_appointments_by_reply_channel ?? charts.bookedAppointmentsByReplyChannel,
    ),
    layout: normalizeGrowthReviewDashboardLayout(source.layout),
    metrics: normalizedMetrics,
    funnel: normalizeFunnelChart(funnel),
    reactivationActivity: normalizeReactivationActivityChart(
      charts.reactivation_activity ?? charts.reactivationActivity,
    ),
    last_synced_at: normalizeText(source.last_synced_at),
    period: isPlainObject(source.period) ? source.period : {},
  }
}
