function normalizeNewBookingsMetric(metric) {
  if (!metric || typeof metric.value !== 'number') {
    throw new Error('Executive Dashboard API returned an invalid New bookings metric.')
  }

  return {
    calculationNote: metric.calculation_note ?? '',
    confidence: metric.confidence ?? '',
    dateField: metric.date_field ?? '',
    key: metric.key ?? 'new_bookings',
    label: metric.label ?? 'New bookings',
    lastSyncedAt: metric.last_synced_at ?? null,
    source: metric.source ?? '',
    unit: metric.unit ?? 'count',
    value: metric.value,
  }
}

function normalizePeriod(period) {
  if (!period?.start || !period?.end || !period?.label) {
    throw new Error('Executive Dashboard API returned an invalid reporting period.')
  }

  return {
    end: period.end,
    label: period.label,
    start: period.start,
    timezone: period.timezone ?? 'UTC',
    type: period.type ?? 'current_month',
  }
}

export async function getExecutiveDashboardMetricsFromApi({
  apiClient,
  workspaceId,
}) {
  if (!workspaceId) {
    throw new Error('Workspace id is required to load the Executive Dashboard.')
  }

  const payload = await apiClient.get(`/api/workspaces/${workspaceId}/executive-dashboard/`)

  return {
    newBookings: normalizeNewBookingsMetric(payload?.metrics?.new_bookings),
    period: normalizePeriod(payload?.period),
    workspace: {
      id: payload?.workspace?.id ?? workspaceId,
      name: payload?.workspace?.name ?? '',
      slug: payload?.workspace?.slug ?? '',
    },
  }
}

