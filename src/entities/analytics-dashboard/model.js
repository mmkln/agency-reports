import { normalizeDashboardExplanations } from '@/entities/dashboard-explanation'

const SUPPORTED_WIDGET_TYPES = new Set([
  'metric_grid',
  'funnel',
  'breakdown',
  'trend',
  'table',
  'heatmap',
  'booking_activity',
])

function normalizeDrilldown(drilldown) {
  return drilldown?.type === 'contact_collection'
    && drilldown?.key
    && String(drilldown?.endpoint ?? '').startsWith('/api/')
    ? {
        endpoint: drilldown.endpoint,
        key: drilldown.key,
        label: drilldown.label ?? 'View contacts',
        title: drilldown.title ?? drilldown.label ?? 'Contacts',
        type: drilldown.type,
      }
    : null
}

function normalizeMetric(metric) {
  return {
    ...metric,
    drilldown: normalizeDrilldown(metric?.drilldown),
  }
}

function normalizeBookingActivityData(data) {
  if (!data || typeof data !== 'object') {
    return data ?? null
  }
  const drilldowns = Object.fromEntries(
    Object.entries(data.drilldowns ?? {})
      .map(([key, descriptor]) => [key, normalizeDrilldown(descriptor)])
      .filter(([, descriptor]) => descriptor),
  )

  return {
    ...data,
    drilldowns,
  }
}

function normalizeWidget(widget) {
  if (!widget?.id || !SUPPORTED_WIDGET_TYPES.has(widget.type)) {
    throw new Error('Analytics Dashboard API returned an unsupported widget.')
  }

  return {
    data: widget.type === 'metric_grid' && Array.isArray(widget.data)
      ? widget.data.map(normalizeMetric)
      : widget.type === 'booking_activity'
        ? normalizeBookingActivityData(widget.data)
        : widget.data ?? null,
    id: widget.id,
    title: widget.title ?? '',
    type: widget.type,
  }
}

function normalizePeriodItem(item) {
  if (!item?.key || !item?.type || !item?.start || !item?.end) {
    return null
  }

  return {
    calculatedAt: item.calculated_at ?? null,
    calculationStatus: item.calculation_status ?? item.status ?? 'not_calculated',
    end: item.end,
    key: item.key,
    snapshotId: item.snapshot_id ?? null,
    start: item.start,
    status: item.status ?? 'not_calculated',
    type: item.type,
  }
}

function normalizePeriodCatalog(catalog) {
  const types = Array.isArray(catalog?.types)
    ? catalog.types
        .filter((item) => item?.key && item?.label)
        .map((item) => ({ key: item.key, label: item.label }))
    : []

  return {
    currentDate: catalog?.current_date ?? null,
    defaultPeriodKey: catalog?.default_period_key ?? null,
    historyStart: catalog?.history_start ?? null,
    reports: Array.isArray(catalog?.reports)
      ? catalog.reports.map(normalizePeriodItem).filter(Boolean)
      : [],
    timezone: catalog?.timezone ?? 'UTC',
    types,
  }
}

export function normalizeAnalyticsDashboard(payload) {
  if (!payload?.dashboard?.key || !payload?.period?.start || !payload?.period?.end) {
    throw new Error('Analytics Dashboard API returned an invalid dashboard payload.')
  }

  return {
    activeRefresh: payload.active_refresh ?? null,
    calculationStatus: payload.calculation_status ?? (
      payload.status === 'not_calculated' ? 'not_calculated' : 'current'
    ),
    calculatedAt: payload.calculated_at ?? null,
    dashboard: {
      configVersion: payload.dashboard.config_version ?? 1,
      key: payload.dashboard.key,
      title: payload.dashboard.title ?? payload.dashboard.key,
    },
    explanations: normalizeDashboardExplanations(payload.explanations),
    period: {
      end: payload.period.end,
      key: payload.period.key ?? null,
      start: payload.period.start,
      timezone: payload.period.timezone ?? 'UTC',
      type: payload.period.type ?? 'week',
    },
    periodCatalog: normalizePeriodCatalog(payload.period_catalog),
    sourceWatermarks: payload.source_watermarks ?? {},
    permissions: {
      canEditExplanations: payload.permissions?.can_edit_explanations === true,
      canManageSettings: payload.permissions?.can_manage_settings === true,
      canRefresh: payload.permissions?.can_refresh === true,
    },
    snapshotId: payload.snapshot_id ?? null,
    status: payload.status ?? 'not_calculated',
    widgets: Array.isArray(payload.widgets) ? payload.widgets.map(normalizeWidget) : [],
  }
}

export function isAnalyticsRefreshFinished(refresh) {
  return ['completed', 'completed_with_warnings', 'failed'].includes(refresh?.status)
}
