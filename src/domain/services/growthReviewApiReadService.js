import {
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_ZONES,
  getDentalGrowthReviewPresetForViewer,
  normalizeGrowthReviewReadModel,
} from '../../entities/dental-growth-review'

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function getDateRangeForPreset(preset, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (preset === 'previous_week') {
    const end = addDays(today, -7)
    return {
      end: formatIsoDate(end),
      start: formatIsoDate(addDays(end, -6)),
    }
  }

  if (preset === 'current_biweekly') {
    return {
      end: formatIsoDate(today),
      start: formatIsoDate(addDays(today, -13)),
    }
  }

  if (preset === 'previous_biweekly') {
    const end = addDays(today, -14)
    return {
      end: formatIsoDate(end),
      start: formatIsoDate(addDays(end, -13)),
    }
  }

  return {
    end: formatIsoDate(today),
    start: formatIsoDate(addDays(today, -6)),
  }
}

export function resolveGrowthReviewDateRange({
  end,
  now,
  periodId,
  start,
} = {}) {
  if (start && end) {
    return {
      end,
      selectedKey: 'custom',
      start,
    }
  }

  const selectedKey = [
    'current_week',
    'previous_week',
    'current_biweekly',
    'previous_biweekly',
  ].includes(periodId)
    ? periodId
    : 'current_week'
  const range = getDateRangeForPreset(selectedKey, now)

  return {
    ...range,
    selectedKey,
  }
}

function formatPeriodRangeLabel(start, end) {
  return `${start} - ${end}`
}

function createPeriodOption({ key, periodType, range }) {
  return {
    id: key,
    label: formatPeriodRangeLabel(range.start, range.end),
    periodEnd: range.end,
    periodStart: range.start,
    periodType,
  }
}

function createReviewPeriodOptions(now) {
  const currentWeek = getDateRangeForPreset('current_week', now)
  const previousWeek = getDateRangeForPreset('previous_week', now)
  const currentBiweekly = getDateRangeForPreset('current_biweekly', now)
  const previousBiweekly = getDateRangeForPreset('previous_biweekly', now)

  return {
    periodOptions: [
      createPeriodOption({
        key: 'current_week',
        label: 'Current week',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
        range: currentWeek,
      }),
      createPeriodOption({
        key: 'previous_week',
        label: 'Previous week',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
        range: previousWeek,
      }),
      createPeriodOption({
        key: 'current_biweekly',
        label: 'Current bi-weekly period',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
        range: currentBiweekly,
      }),
      createPeriodOption({
        key: 'previous_biweekly',
        label: 'Previous bi-weekly period',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
        range: previousBiweekly,
      }),
    ],
    reviewPeriodOptions: [
      {
        key: 'current_week',
        label: 'Current week',
        periodId: 'current_week',
        periodLabel: formatPeriodRangeLabel(currentWeek.start, currentWeek.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
      },
      {
        key: 'previous_week',
        label: 'Previous week',
        periodId: 'previous_week',
        periodLabel: formatPeriodRangeLabel(previousWeek.start, previousWeek.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
      },
      {
        key: 'current_biweekly',
        label: 'Current bi-weekly period',
        periodId: 'current_biweekly',
        periodLabel: formatPeriodRangeLabel(currentBiweekly.start, currentBiweekly.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
      },
      {
        key: 'previous_biweekly',
        label: 'Previous bi-weekly period',
        periodId: 'previous_biweekly',
        periodLabel: formatPeriodRangeLabel(previousBiweekly.start, previousBiweekly.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
      },
      {
        key: 'custom',
        label: 'Custom date range',
        periodId: null,
        periodLabel: 'Use start and end query parameters',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.CUSTOM,
      },
    ],
  }
}

function mapZoneState(preset) {
  return DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
    ...zone,
    defaultCollapsed: preset === 'operator'
      ? zone.defaultCollapsedForOperator
      : zone.defaultCollapsedForExecutive,
  }))
}

export async function getGrowthReviewDashboardPageFromApi({
  apiClient,
  now = new Date(),
  routeParams = {},
  viewer,
  workspaceId,
}) {
  if (!workspaceId) {
    return {
      reason: 'workspace_not_found',
      status: 'error',
    }
  }

  const dateRange = resolveGrowthReviewDateRange({
    end: routeParams.end,
    now,
    periodId: routeParams.periodId,
    start: routeParams.start,
  })
  const payload = await apiClient.get(`/api/workspaces/${workspaceId}/growth-review/`, {
    query: {
      end: dateRange.end,
      start: dateRange.start,
    },
  })
  const readModel = normalizeGrowthReviewReadModel({
    ...payload,
    workspace_id: payload?.workspace_id ?? workspaceId,
  })
  const periodOptions = createReviewPeriodOptions(now)
  const preset = getDentalGrowthReviewPresetForViewer(viewer)

  return {
    calculationMeta: null,
    client: {
      id: workspaceId,
      name: payload?.workspace?.name ?? payload?.client?.name ?? 'Workspace',
      portalSlug: payload?.workspace?.slug ?? payload?.client?.portalSlug ?? '',
      type: payload?.workspace?.type ?? payload?.client?.type ?? 'clinic',
    },
    period: readModel.period,
    periodOptions: periodOptions.periodOptions,
    preset,
    previousPeriod: null,
    reason: null,
    reviewPeriodOptions: periodOptions.reviewPeriodOptions,
    selectedReviewPeriodOptionKey: dateRange.selectedKey,
    source: 'published',
    status: 'ready',
    zones: mapZoneState(preset),
  }
}
