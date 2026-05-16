import {
  createEmptyPerformanceDashboardContent,
  PERFORMANCE_CHANNELS,
  PERFORMANCE_GOAL_STATUSES,
  PERFORMANCE_INSIGHT_SEVERITIES,
  PERFORMANCE_METRIC_STATUSES,
  PERFORMANCE_NEXT_STEP_PRIORITIES,
  PERFORMANCE_SERVICE_TYPES,
  PERFORMANCE_TREND_GRANULARITIES,
} from '../../../entities/performance-dashboard'

export function createUuid() {
  return crypto.randomUUID()
}

export function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function stringValue(value) {
  return value === null || value === undefined ? '' : String(value)
}

function toDateTimeLocal(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

export function formatPeriod(period) {
  if (!period?.periodStart || !period?.periodEnd) {
    return 'Reporting period not set'
  }

  return `${period.periodStart} - ${period.periodEnd}`
}

export function optionLabel(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function createMetric() {
  return {
    definition: '',
    delta_pct: null,
    goal: '',
    goal_pct: null,
    id: createUuid(),
    label: '',
    source: '',
    status: PERFORMANCE_METRIC_STATUSES.NEUTRAL,
    unit: '',
    value: '',
  }
}

export function createGoal() {
  return {
    actual: null,
    id: createUuid(),
    name: '',
    note: '',
    status: PERFORMANCE_GOAL_STATUSES.ON_TRACK,
    target: null,
    target_date: '',
  }
}

export function createChannelBreakdownItem() {
  return {
    booked_calls: null,
    channel: PERFORMANCE_CHANNELS.GOOGLE_ADS,
    conversion_rate: null,
    cpa: null,
    cpl: null,
    id: createUuid(),
    leads: null,
    qualified_leads: null,
    revenue: null,
    roas: null,
    sales: null,
    spend: null,
    summary: '',
  }
}

export function createInsight() {
  return {
    body: '',
    id: createUuid(),
    severity: PERFORMANCE_INSIGHT_SEVERITIES.INFO,
    title: '',
  }
}

export function createNextStep() {
  return {
    description: '',
    due_date: '',
    id: createUuid(),
    owner: '',
    priority: PERFORMANCE_NEXT_STEP_PRIORITIES.MEDIUM,
    title: '',
  }
}

export function createTrendPoint() {
  return {
    date: '',
    id: createUuid(),
    value: null,
  }
}

export function createTrendAnnotation() {
  return {
    date: '',
    id: createUuid(),
    label: '',
  }
}

export function createTrend() {
  return {
    annotations: [],
    comparison_series: [],
    goal_value: null,
    granularity: PERFORMANCE_TREND_GRANULARITIES.MONTHLY,
    id: createUuid(),
    metric: '',
    series: [],
  }
}

export function createServiceMetricEntry() {
  return {
    id: createUuid(),
    key: '',
    value: '',
  }
}

export function createServiceTextItem() {
  return {
    id: createUuid(),
    text: '',
  }
}

export function createServiceSection() {
  return {
    id: createUuid(),
    insights: [],
    metrics: {},
    metrics_entries: [],
    next_actions: [],
    service_type: PERFORMANCE_SERVICE_TYPES.FULL_SERVICE,
    summary: '',
  }
}

export function createAppendixColumn() {
  return {
    id: createUuid(),
    label: '',
  }
}

export function createAppendixCell(value = '') {
  return {
    id: createUuid(),
    value,
  }
}

export function createAppendixRow(columnCount = 0) {
  return {
    cells: Array.from({ length: columnCount }, () => createAppendixCell()),
    id: createUuid(),
  }
}

export function createAppendixTable() {
  return {
    columns: [],
    id: createUuid(),
    rows: [],
    title: '',
  }
}

export const funnelFields = [
  ['spend', 'Spend'],
  ['impressions', 'Impressions'],
  ['clicks', 'Clicks'],
  ['visitors', 'Visitors'],
  ['leads', 'Leads'],
  ['qualified_leads', 'Qualified leads'],
  ['booked_calls', 'Booked calls'],
  ['sales', 'Sales'],
  ['revenue', 'Revenue'],
]

export const channelNumberFields = [
  ['spend', 'Spend'],
  ['leads', 'Leads'],
  ['qualified_leads', 'Qualified leads'],
  ['booked_calls', 'Booked calls'],
  ['sales', 'Sales'],
  ['revenue', 'Revenue'],
  ['cpl', 'CPL'],
  ['cpa', 'CPA'],
  ['roas', 'ROAS'],
  ['conversion_rate', 'Conversion rate'],
]

function trendPointToForm(point = {}) {
  return {
    date: point.date ?? '',
    id: point.id || createUuid(),
    value: point.value ?? null,
  }
}

function trendAnnotationToForm(annotation = {}) {
  return {
    date: annotation.date ?? '',
    id: annotation.id || createUuid(),
    label: annotation.label ?? '',
  }
}

function serviceMetricEntriesToForm(metrics = {}) {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    return []
  }

  return Object.entries(metrics).map(([key, value]) => ({
    id: createUuid(),
    key,
    value: value ?? '',
  }))
}

function textItemsToForm(items = []) {
  return Array.isArray(items)
    ? items.map((text) => ({
      id: createUuid(),
      text: text ?? '',
    }))
    : []
}

function appendixColumnsToForm(columns = []) {
  return Array.isArray(columns)
    ? columns.map((label) => ({
      id: createUuid(),
      label: label ?? '',
    }))
    : []
}

function appendixRowsToForm(rows = [], columnCount = 0) {
  return Array.isArray(rows)
    ? rows.map((row) => ({
      cells: Array.from({ length: columnCount }, (_, index) => (
        createAppendixCell(Array.isArray(row) ? row[index] ?? '' : '')
      )),
      id: createUuid(),
    }))
    : []
}

function compactTrendPoints(points = []) {
  return points
    .map((point) => ({
      date: point.date ?? '',
      value: numberOrNull(point.value),
    }))
    .filter((point) => point.date || point.value !== null)
}

function compactTrendAnnotations(annotations = []) {
  return annotations
    .map((annotation) => ({
      date: annotation.date ?? '',
      label: typeof annotation.label === 'string' ? annotation.label.trim() : '',
    }))
    .filter((annotation) => annotation.date || annotation.label)
}

function serviceMetricValue(value) {
  const numberValue = numberOrNull(value)

  if (numberValue !== null) {
    return numberValue
  }

  return typeof value === 'string' ? value.trim() : ''
}

function serviceMetricEntriesToRecord(entries = []) {
  return Object.fromEntries(
    entries
      .map((entry) => [
        typeof entry.key === 'string' ? entry.key.trim() : '',
        serviceMetricValue(entry.value),
      ])
      .filter(([key, value]) => key && value !== ''),
  )
}

function compactTextItems(items = []) {
  return items
    .map((item) => (typeof item === 'string' ? item : item.text))
    .map((text) => (typeof text === 'string' ? text.trim() : ''))
    .filter(Boolean)
}

function compactAppendixColumns(columns = []) {
  return columns
    .map((column) => (typeof column === 'string' ? column : column.label))
    .map((label) => (typeof label === 'string' ? label.trim() : ''))
    .filter(Boolean)
}

function compactAppendixRows(rows = []) {
  return rows
    .map((row) => (Array.isArray(row) ? row : row.cells ?? []))
    .map((cells) => cells.map((cell) => (
      typeof cell === 'string' ? cell : stringValue(cell.value)
    )))
    .filter((row) => row.some((value) => value.trim()))
}

export function periodToForm(period) {
  const content = createEmptyPerformanceDashboardContent(period.content)

  return {
    accountManager: period.accountManager ?? '',
    agencyContact: period.agencyContact ?? '',
    attributionNote: period.attributionNote ?? '',
    clientId: period.clientId,
    content: {
      ...content,
      channel_breakdown: content.channel_breakdown.map((channel) => ({
        ...channel,
        id: channel.id || createUuid(),
      })),
      goals: content.goals.map((goal) => ({
        ...goal,
        id: goal.id || createUuid(),
      })),
      agency_work: {
        active: textItemsToForm(content.agency_work.active),
        completed: textItemsToForm(content.agency_work.completed),
        next: textItemsToForm(content.agency_work.next),
      },
      insights: content.insights.map((insight) => ({
        ...insight,
        id: insight.id || createUuid(),
      })),
      kpi_cards: content.kpi_cards.map((metric) => ({
        ...metric,
        id: metric.id || createUuid(),
      })),
      next_steps: content.next_steps.map((step) => ({
        ...step,
        id: step.id || createUuid(),
      })),
      appendix_tables: content.appendix_tables.map((table) => ({
        ...table,
        columns: appendixColumnsToForm(table.columns),
        id: table.id || createUuid(),
        rows: appendixRowsToForm(table.rows, table.columns.length),
      })),
      service_sections: content.service_sections.map((section) => ({
        ...section,
        id: section.id || createUuid(),
        insights: textItemsToForm(section.insights),
        metrics_entries: serviceMetricEntriesToForm(section.metrics),
        next_actions: textItemsToForm(section.next_actions),
      })),
      trends: content.trends.map((trend) => ({
        ...trend,
        annotations: trend.annotations.map(trendAnnotationToForm),
        comparison_series: trend.comparison_series.map(trendPointToForm),
        id: trend.id || createUuid(),
        series: trend.series.map(trendPointToForm),
      })),
    },
    dataConfidence: period.dataConfidence,
    dataMode: period.dataMode,
    id: period.id,
    lastUpdatedAt: toDateTimeLocal(period.lastUpdatedAt),
    periodEnd: period.periodEnd,
    periodStart: period.periodStart,
    sourceSummary: period.sourceSummary ?? '',
    status: period.status,
    title: period.title,
  }
}

export function serializeForm(form) {
  return {
    ...form,
    content: {
      ...form.content,
      funnel: Object.fromEntries(
        funnelFields.map(([fieldName]) => [
          fieldName,
          numberOrNull(form.content.funnel[fieldName]),
        ]),
      ),
      channel_breakdown: form.content.channel_breakdown.map((channel, index) => ({
        ...channel,
        ...Object.fromEntries(
          channelNumberFields.map(([fieldName]) => [
            fieldName,
            numberOrNull(channel[fieldName]),
          ]),
        ),
        display_order: index,
      })),
      goals: form.content.goals.map((goal, index) => ({
        ...goal,
        actual: numberOrNull(goal.actual),
        display_order: index,
        target: numberOrNull(goal.target),
      })),
      hero_metric: {
        ...form.content.hero_metric,
        delta_pct: numberOrNull(form.content.hero_metric.delta_pct),
        goal_pct: numberOrNull(form.content.hero_metric.goal_pct),
      },
      agency_work: {
        active: compactTextItems(form.content.agency_work.active),
        completed: compactTextItems(form.content.agency_work.completed),
        next: compactTextItems(form.content.agency_work.next),
      },
      insights: form.content.insights.map((insight, index) => ({
        ...insight,
        display_order: index,
      })),
      kpi_cards: form.content.kpi_cards.map((metric, index) => ({
        ...metric,
        delta_pct: numberOrNull(metric.delta_pct),
        display_order: index,
        goal_pct: numberOrNull(metric.goal_pct),
      })),
      next_steps: form.content.next_steps.map((step, index) => ({
        ...step,
        display_order: index,
      })),
      appendix_tables: form.content.appendix_tables.map((table, index) => {
        return {
          ...table,
          columns: compactAppendixColumns(table.columns),
          display_order: index,
          rows: compactAppendixRows(table.rows),
        }
      }),
      service_sections: form.content.service_sections.map((section, index) => {
        const {
          metrics_entries,
          ...sectionRecord
        } = section

        return {
          ...sectionRecord,
          display_order: index,
          insights: compactTextItems(section.insights),
          metrics: serviceMetricEntriesToRecord(metrics_entries),
          next_actions: compactTextItems(section.next_actions),
        }
      }),
      trends: form.content.trends.map((trend, index) => {
        return {
          ...trend,
          annotations: compactTrendAnnotations(trend.annotations),
          comparison_series: compactTrendPoints(trend.comparison_series),
          display_order: index,
          goal_value: numberOrNull(trend.goal_value),
          series: compactTrendPoints(trend.series),
        }
      }),
    },
    lastUpdatedAt: fromDateTimeLocal(form.lastUpdatedAt),
  }
}
