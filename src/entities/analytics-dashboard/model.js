const SUPPORTED_WIDGET_TYPES = new Set(['metric_grid', 'funnel', 'breakdown', 'trend', 'table', 'heatmap'])

function normalizeWidget(widget) {
  if (!widget?.id || !SUPPORTED_WIDGET_TYPES.has(widget.type)) {
    throw new Error('Analytics Dashboard API returned an unsupported widget.')
  }

  return {
    data: widget.data ?? null,
    id: widget.id,
    title: widget.title ?? '',
    type: widget.type,
  }
}

export function normalizeAnalyticsDashboard(payload) {
  if (!payload?.dashboard?.key || !payload?.period?.start || !payload?.period?.end) {
    throw new Error('Analytics Dashboard API returned an invalid dashboard payload.')
  }

  return {
    calculatedAt: payload.calculated_at ?? null,
    dashboard: {
      configVersion: payload.dashboard.config_version ?? 1,
      key: payload.dashboard.key,
      title: payload.dashboard.title ?? payload.dashboard.key,
    },
    period: {
      end: payload.period.end,
      start: payload.period.start,
      timezone: payload.period.timezone ?? 'UTC',
      type: payload.period.type ?? 'week',
    },
    sourceWatermarks: payload.source_watermarks ?? {},
    status: payload.status ?? 'not_calculated',
    widgets: Array.isArray(payload.widgets) ? payload.widgets.map(normalizeWidget) : [],
  }
}

export function isAnalyticsRefreshFinished(refresh) {
  return ['completed', 'completed_with_warnings', 'failed'].includes(refresh?.status)
}
