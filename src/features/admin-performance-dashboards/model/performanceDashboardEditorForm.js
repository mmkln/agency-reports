import {
  createEmptyPerformanceDashboardContent,
  PERFORMANCE_CHANNELS,
  PERFORMANCE_GOAL_STATUSES,
  PERFORMANCE_INSIGHT_SEVERITIES,
  PERFORMANCE_METRIC_STATUSES,
  PERFORMANCE_NEXT_STEP_PRIORITIES,
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
    },
    lastUpdatedAt: fromDateTimeLocal(form.lastUpdatedAt),
  }
}
