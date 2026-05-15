export const PERFORMANCE_DASHBOARD_STATUSES = Object.freeze({
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  READY: 'ready',
})

export const PERFORMANCE_DASHBOARD_STATUS_META = Object.freeze({
  [PERFORMANCE_DASHBOARD_STATUSES.DRAFT]: {
    icon: 'fileText',
    label: 'Draft',
    tone: 'neutral',
  },
  [PERFORMANCE_DASHBOARD_STATUSES.READY]: {
    icon: 'checkCircle2',
    label: 'Ready',
    tone: 'blue',
  },
  [PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED]: {
    icon: 'checkCircle2',
    label: 'Published',
    tone: 'green',
  },
  [PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})

export const PERFORMANCE_DATA_MODES = Object.freeze({
  EMBEDDED_DASHBOARD: 'embedded_dashboard',
  INTEGRATION: 'integration',
  JSON_IMPORT: 'json_import',
  MANUAL: 'manual',
})

export const PERFORMANCE_DATA_MODE_META = Object.freeze({
  [PERFORMANCE_DATA_MODES.MANUAL]: {
    icon: 'pencil',
    label: 'Manual',
    tone: 'neutral',
  },
  [PERFORMANCE_DATA_MODES.JSON_IMPORT]: {
    icon: 'fileJson',
    label: 'JSON Import',
    tone: 'blue',
  },
  [PERFORMANCE_DATA_MODES.EMBEDDED_DASHBOARD]: {
    icon: 'layoutDashboard',
    label: 'Embedded Dashboard',
    tone: 'purple',
  },
  [PERFORMANCE_DATA_MODES.INTEGRATION]: {
    icon: 'plug',
    label: 'Integration',
    tone: 'green',
  },
})

export const PERFORMANCE_DATA_CONFIDENCE = Object.freeze({
  ESTIMATED: 'estimated',
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
})

export const PERFORMANCE_DATA_CONFIDENCE_META = Object.freeze({
  [PERFORMANCE_DATA_CONFIDENCE.HIGH]: {
    icon: 'checkCircle2',
    label: 'High confidence',
    tone: 'green',
  },
  [PERFORMANCE_DATA_CONFIDENCE.MEDIUM]: {
    icon: 'circleAlert',
    label: 'Medium confidence',
    tone: 'amber',
  },
  [PERFORMANCE_DATA_CONFIDENCE.LOW]: {
    icon: 'triangleAlert',
    label: 'Low confidence',
    tone: 'amber',
  },
  [PERFORMANCE_DATA_CONFIDENCE.ESTIMATED]: {
    icon: 'calculator',
    label: 'Estimated',
    tone: 'neutral',
  },
})

export const PERFORMANCE_METRIC_STATUSES = Object.freeze({
  AHEAD: 'ahead',
  BEHIND: 'behind',
  NEUTRAL: 'neutral',
  ON_TRACK: 'on_track',
})

export const PERFORMANCE_GOAL_STATUSES = Object.freeze({
  AHEAD: 'ahead',
  BEHIND: 'behind',
  ON_TRACK: 'on_track',
})

export const PERFORMANCE_CHANNELS = Object.freeze({
  DIRECT: 'direct',
  EMAIL_SMS: 'email_sms',
  GOOGLE_ADS: 'google_ads',
  META_ADS: 'meta_ads',
  OTHER: 'other',
  REFERRAL: 'referral',
  SEO: 'seo',
  SOCIAL: 'social',
})

export const PERFORMANCE_CHANNEL_META = Object.freeze({
  [PERFORMANCE_CHANNELS.GOOGLE_ADS]: {
    label: 'Google Ads',
  },
  [PERFORMANCE_CHANNELS.META_ADS]: {
    label: 'Meta Ads',
  },
  [PERFORMANCE_CHANNELS.SEO]: {
    label: 'SEO',
  },
  [PERFORMANCE_CHANNELS.SOCIAL]: {
    label: 'Social',
  },
  [PERFORMANCE_CHANNELS.EMAIL_SMS]: {
    label: 'Email/SMS',
  },
  [PERFORMANCE_CHANNELS.DIRECT]: {
    label: 'Direct',
  },
  [PERFORMANCE_CHANNELS.REFERRAL]: {
    label: 'Referral',
  },
  [PERFORMANCE_CHANNELS.OTHER]: {
    label: 'Other',
  },
})

export const PERFORMANCE_SERVICE_TYPES = Object.freeze({
  CRO: 'cro',
  EMAIL_SMS: 'email_sms',
  FULL_SERVICE: 'full_service',
  LEAD_GENERATION: 'lead_generation',
  PAID_ADS: 'paid_ads',
  SEO: 'seo',
  SOCIAL: 'social',
})

export const PERFORMANCE_SERVICE_TYPE_META = Object.freeze({
  [PERFORMANCE_SERVICE_TYPES.PAID_ADS]: {
    label: 'Paid Ads',
  },
  [PERFORMANCE_SERVICE_TYPES.SEO]: {
    label: 'SEO',
  },
  [PERFORMANCE_SERVICE_TYPES.SOCIAL]: {
    label: 'Social',
  },
  [PERFORMANCE_SERVICE_TYPES.EMAIL_SMS]: {
    label: 'Email/SMS',
  },
  [PERFORMANCE_SERVICE_TYPES.LEAD_GENERATION]: {
    label: 'Lead Generation',
  },
  [PERFORMANCE_SERVICE_TYPES.CRO]: {
    label: 'CRO',
  },
  [PERFORMANCE_SERVICE_TYPES.FULL_SERVICE]: {
    label: 'Full Service',
  },
})

export const PERFORMANCE_INSIGHT_SEVERITIES = Object.freeze({
  INFO: 'info',
  POSITIVE: 'positive',
  WARNING: 'warning',
})

export const PERFORMANCE_NEXT_STEP_PRIORITIES = Object.freeze({
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
})

export const PERFORMANCE_TREND_GRANULARITIES = Object.freeze({
  DAILY: 'daily',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
})

export const PERFORMANCE_VALIDATION_SEVERITIES = Object.freeze({
  ERROR: 'error',
  WARNING: 'warning',
})

export const PERFORMANCE_PUBLISH_REQUIRED_PATHS = Object.freeze([
  'client_id',
  'period_start',
  'period_end',
  'title',
  'data_mode',
  'data_confidence',
  'last_updated_at',
  'content.executive_summary.narrative',
  'content.hero_metric.label',
  'content.hero_metric.value',
])

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeNullableString(value) {
  const normalized = normalizeString(value)
  return normalized || null
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeEnum(value, enumObject, fallback) {
  return Object.values(enumObject).includes(value) ? value : fallback
}

function normalizeNumberOrString(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return ''
}

function compactRecord(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  )
}

function makeIssue(path, message, severity = PERFORMANCE_VALIDATION_SEVERITIES.ERROR) {
  return {
    message,
    path,
    severity,
  }
}

function getPathValue(record, path) {
  return path.split('.').reduce((value, segment) => {
    if (!isPlainObject(value)) {
      return undefined
    }

    return value[segment]
  }, record)
}

function createEmptyContent() {
  return {
    appendix_tables: [],
    channel_breakdown: [],
    executive_summary: {
      main_issue: '',
      main_win: '',
      narrative: '',
      next_focus: '',
    },
    funnel: {
      booked_calls: null,
      clicks: null,
      impressions: null,
      leads: null,
      qualified_leads: null,
      revenue: null,
      sales: null,
      spend: null,
      visitors: null,
    },
    goals: [],
    hero_metric: {
      benchmark: '',
      definition: '',
      delta_abs: '',
      delta_pct: null,
      goal: '',
      goal_pct: null,
      label: '',
      source: '',
      status: PERFORMANCE_METRIC_STATUSES.NEUTRAL,
      unit: '',
      value: '',
    },
    insights: [],
    kpi_cards: [],
    next_steps: [],
    service_sections: [],
    trends: [],
  }
}

function normalizeExecutiveSummary(value) {
  const source = isPlainObject(value) ? value : {}

  return {
    main_issue: normalizeString(source.main_issue),
    main_win: normalizeString(source.main_win),
    narrative: normalizeString(source.narrative),
    next_focus: normalizeString(source.next_focus),
  }
}

function normalizeMetric(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    benchmark: normalizeString(source.benchmark),
    definition: normalizeString(source.definition),
    delta_abs: normalizeNumberOrString(source.delta_abs),
    delta_pct: typeof source.delta_pct === 'number' ? source.delta_pct : null,
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    goal: normalizeNumberOrString(source.goal),
    goal_pct: typeof source.goal_pct === 'number' ? source.goal_pct : null,
    id: normalizeString(source.id),
    label: normalizeString(source.label),
    name: normalizeString(source.name),
    prior_value: normalizeNumberOrString(source.prior_value),
    source: normalizeString(source.source),
    sparkline: normalizeArray(source.sparkline).filter((point) => typeof point === 'number'),
    status: normalizeEnum(
      source.status,
      PERFORMANCE_METRIC_STATUSES,
      PERFORMANCE_METRIC_STATUSES.NEUTRAL,
    ),
    unit: normalizeString(source.unit),
    value: normalizeNumberOrString(source.value),
  })
}

function normalizeGoal(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    actual: typeof source.actual === 'number' ? source.actual : null,
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    id: normalizeString(source.id),
    metric: normalizeString(source.metric),
    name: normalizeString(source.name),
    note: normalizeString(source.note),
    status: normalizeEnum(
      source.status,
      PERFORMANCE_GOAL_STATUSES,
      PERFORMANCE_GOAL_STATUSES.ON_TRACK,
    ),
    target: typeof source.target === 'number' ? source.target : null,
    target_date: normalizeString(source.target_date),
  })
}

function normalizeTrend(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    annotations: normalizeArray(source.annotations).map((annotation) => ({
      date: normalizeString(annotation?.date),
      label: normalizeString(annotation?.label),
    })),
    comparison_series: normalizeArray(source.comparison_series).map((point) => ({
      date: normalizeString(point?.date),
      value: typeof point?.value === 'number' ? point.value : null,
    })),
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    goal_value: typeof source.goal_value === 'number' ? source.goal_value : null,
    granularity: normalizeEnum(
      source.granularity,
      PERFORMANCE_TREND_GRANULARITIES,
      PERFORMANCE_TREND_GRANULARITIES.MONTHLY,
    ),
    id: normalizeString(source.id),
    metric: normalizeString(source.metric),
    series: normalizeArray(source.series).map((point) => ({
      date: normalizeString(point?.date),
      value: typeof point?.value === 'number' ? point.value : null,
    })),
  })
}

function normalizeFunnel(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return {
    booked_calls: typeof source.booked_calls === 'number' ? source.booked_calls : null,
    clicks: typeof source.clicks === 'number' ? source.clicks : null,
    impressions: typeof source.impressions === 'number' ? source.impressions : null,
    leads: typeof source.leads === 'number' ? source.leads : null,
    qualified_leads: typeof source.qualified_leads === 'number' ? source.qualified_leads : null,
    revenue: typeof source.revenue === 'number' ? source.revenue : null,
    sales: typeof source.sales === 'number' ? source.sales : null,
    spend: typeof source.spend === 'number' ? source.spend : null,
    visitors: typeof source.visitors === 'number' ? source.visitors : null,
  }
}

function normalizeChannelBreakdownItem(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    booked_calls: typeof source.booked_calls === 'number' ? source.booked_calls : null,
    channel: normalizeEnum(source.channel, PERFORMANCE_CHANNELS, PERFORMANCE_CHANNELS.OTHER),
    conversion_rate: typeof source.conversion_rate === 'number' ? source.conversion_rate : null,
    cpa: typeof source.cpa === 'number' ? source.cpa : null,
    cpl: typeof source.cpl === 'number' ? source.cpl : null,
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    id: normalizeString(source.id),
    leads: typeof source.leads === 'number' ? source.leads : null,
    qualified_leads: typeof source.qualified_leads === 'number' ? source.qualified_leads : null,
    revenue: typeof source.revenue === 'number' ? source.revenue : null,
    roas: typeof source.roas === 'number' ? source.roas : null,
    sales: typeof source.sales === 'number' ? source.sales : null,
    spend: typeof source.spend === 'number' ? source.spend : null,
    summary: normalizeString(source.summary),
  })
}

function normalizeServiceSection(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    id: normalizeString(source.id),
    insights: normalizeArray(source.insights).map((item) => normalizeString(item)).filter(Boolean),
    metrics: isPlainObject(source.metrics) ? source.metrics : {},
    next_actions: normalizeArray(source.next_actions)
      .map((item) => normalizeString(item))
      .filter(Boolean),
    service_type: normalizeEnum(
      source.service_type,
      PERFORMANCE_SERVICE_TYPES,
      PERFORMANCE_SERVICE_TYPES.FULL_SERVICE,
    ),
    summary: normalizeString(source.summary),
  })
}

function normalizeInsight(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    body: normalizeString(source.body),
    chart_ref: normalizeString(source.chart_ref),
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    id: normalizeString(source.id),
    severity: normalizeEnum(
      source.severity,
      PERFORMANCE_INSIGHT_SEVERITIES,
      PERFORMANCE_INSIGHT_SEVERITIES.INFO,
    ),
    title: normalizeString(source.title),
  })
}

function normalizeNextStep(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    description: normalizeString(source.description),
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    due_date: normalizeString(source.due_date),
    id: normalizeString(source.id),
    owner: normalizeString(source.owner),
    priority: normalizeEnum(
      source.priority,
      PERFORMANCE_NEXT_STEP_PRIORITIES,
      PERFORMANCE_NEXT_STEP_PRIORITIES.MEDIUM,
    ),
    title: normalizeString(source.title),
  })
}

function normalizeAppendixTable(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return compactRecord({
    columns: normalizeArray(source.columns),
    display_order: typeof source.display_order === 'number' ? source.display_order : undefined,
    id: normalizeString(source.id),
    rows: normalizeArray(source.rows),
    title: normalizeString(source.title),
  })
}

export function createEmptyPerformanceDashboardContent(overrides = {}) {
  const source = isPlainObject(overrides) ? overrides : {}

  return {
    ...createEmptyContent(),
    ...source,
    appendix_tables: normalizeArray(source.appendix_tables).map(normalizeAppendixTable),
    channel_breakdown: normalizeArray(source.channel_breakdown).map(normalizeChannelBreakdownItem),
    executive_summary: normalizeExecutiveSummary(source.executive_summary),
    funnel: normalizeFunnel(source.funnel),
    goals: normalizeArray(source.goals).map(normalizeGoal),
    hero_metric: normalizeMetric(source.hero_metric),
    insights: normalizeArray(source.insights).map(normalizeInsight),
    kpi_cards: normalizeArray(source.kpi_cards).map(normalizeMetric),
    next_steps: normalizeArray(source.next_steps).map(normalizeNextStep),
    service_sections: normalizeArray(source.service_sections).map(normalizeServiceSection),
    trends: normalizeArray(source.trends).map(normalizeTrend),
  }
}

export function normalizePerformanceDashboardPeriod(record = {}) {
  const source = isPlainObject(record) ? record : {}

  return {
    account_manager: normalizeString(source.account_manager),
    agency_contact: normalizeString(source.agency_contact),
    attribution_note: normalizeString(source.attribution_note),
    client_id: normalizeString(source.client_id),
    content: createEmptyPerformanceDashboardContent(source.content),
    created_at: normalizeString(source.created_at),
    created_by: normalizeNullableString(source.created_by),
    data_confidence: normalizeEnum(
      source.data_confidence,
      PERFORMANCE_DATA_CONFIDENCE,
      PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
    ),
    data_mode: normalizeEnum(source.data_mode, PERFORMANCE_DATA_MODES, PERFORMANCE_DATA_MODES.MANUAL),
    id: normalizeString(source.id),
    last_updated_at: normalizeString(source.last_updated_at),
    period_end: normalizeString(source.period_end),
    period_start: normalizeString(source.period_start),
    published_at: normalizeNullableString(source.published_at),
    source_summary: normalizeString(source.source_summary),
    status: normalizeEnum(
      source.status,
      PERFORMANCE_DASHBOARD_STATUSES,
      PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    ),
    title: normalizeString(source.title),
    updated_at: normalizeString(source.updated_at),
    updated_by: normalizeNullableString(source.updated_by),
  }
}

export function createPerformanceDashboardPeriod({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
} = {}) {
  if (typeof idGenerator !== 'function') {
    throw new Error('idGenerator is required to create a performance dashboard period')
  }

  const timestamp = now()
  const normalized = normalizePerformanceDashboardPeriod({
    ...input,
    created_at: input.created_at ?? timestamp,
    id: input.id ?? idGenerator(),
    status: input.status ?? PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    updated_at: input.updated_at ?? timestamp,
  })

  if (!UUID_PATTERN.test(normalized.id)) {
    throw new Error('performance dashboard period id must be a string uuid')
  }

  return normalized
}

export function canClientViewPerformanceDashboardPeriod(period) {
  const status = period?.status

  return status === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED
    || status === PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED
}

export function validatePerformanceDashboardPeriod(period, options = {}) {
  const mode = options.mode ?? 'draft'
  const normalized = normalizePerformanceDashboardPeriod(period)
  const errors = []
  const warnings = []

  if (!UUID_PATTERN.test(normalized.id)) {
    errors.push(makeIssue('id', 'Performance dashboard period id must be a string uuid.'))
  }

  if (normalized.client_id && !UUID_PATTERN.test(normalized.client_id)) {
    errors.push(makeIssue('client_id', 'Client id must be a string uuid.'))
  }

  if (mode === 'publish') {
    PERFORMANCE_PUBLISH_REQUIRED_PATHS.forEach((path) => {
      if (!isNonEmptyString(String(getPathValue(normalized, path) ?? ''))) {
        errors.push(makeIssue(path, `${path} is required before publishing.`))
      }
    })

    if (normalized.content.kpi_cards.length === 0) {
      errors.push(makeIssue('content.kpi_cards', 'At least one KPI card is required before publishing.'))
    }

    if (normalized.content.insights.length === 0) {
      errors.push(makeIssue('content.insights', 'At least one insight is required before publishing.'))
    }

    if (normalized.content.next_steps.length === 0) {
      errors.push(makeIssue('content.next_steps', 'At least one next action is required before publishing.'))
    }
  }

  if (normalized.data_confidence === PERFORMANCE_DATA_CONFIDENCE.LOW) {
    warnings.push(makeIssue(
      'data_confidence',
      'Low-confidence data should be clearly labeled for clients.',
      PERFORMANCE_VALIDATION_SEVERITIES.WARNING,
    ))
  }

  if (normalized.content.channel_breakdown.length === 0) {
    warnings.push(makeIssue(
      'content.channel_breakdown',
      'Channel breakdown is recommended for a useful performance dashboard.',
      PERFORMANCE_VALIDATION_SEVERITIES.WARNING,
    ))
  }

  if (!normalized.attribution_note) {
    warnings.push(makeIssue(
      'attribution_note',
      'Attribution note is recommended before publishing client-facing performance data.',
      PERFORMANCE_VALIDATION_SEVERITIES.WARNING,
    ))
  }

  return {
    errors,
    isValid: errors.length === 0,
    period: normalized,
    warnings,
  }
}

export function parsePerformanceDashboardJson(rawJson) {
  try {
    const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson

    if (!isPlainObject(parsed)) {
      return {
        errors: [makeIssue('$', 'Performance dashboard JSON must be an object.')],
        isValid: false,
        period: null,
        warnings: [],
      }
    }

    const period = normalizePerformanceDashboardPeriod({
      ...parsed,
      data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    })
    const validation = validatePerformanceDashboardPeriod(period, { mode: 'publish' })

    return {
      ...validation,
      period,
    }
  } catch (error) {
    return {
      errors: [makeIssue('$', error instanceof Error ? error.message : 'Invalid JSON.')],
      isValid: false,
      period: null,
      warnings: [],
    }
  }
}
