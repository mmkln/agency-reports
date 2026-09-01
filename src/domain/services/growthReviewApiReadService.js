import {
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_ZONES,
  getDentalGrowthReviewPresetForViewer,
  normalizeGrowthReviewDashboardLayout,
  normalizeGrowthReviewDashboardExplanations,
  normalizeGrowthReviewChartsReadModel,
  normalizeGrowthReviewReadModel,
  normalizeGrowthReviewWeeklyReportingReadModel,
} from '../../entities/dental-growth-review'

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function getStartOfIsoWeek(date) {
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day

  return addDays(date, diff)
}

function getStartOfPreviousMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
}

function getEndOfPreviousMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0))
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function getDateRangeForPreset(preset, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const weekStart = getStartOfIsoWeek(today)

  if (preset === 'previous_week') {
    return {
      end: formatIsoDate(addDays(weekStart, -1)),
      start: formatIsoDate(addDays(weekStart, -7)),
    }
  }

  if (preset === 'current_biweekly') {
    return {
      end: formatIsoDate(addDays(weekStart, -1)),
      start: formatIsoDate(addDays(weekStart, -14)),
    }
  }

  if (preset === 'previous_month') {
    return {
      end: formatIsoDate(getEndOfPreviousMonth(today)),
      start: formatIsoDate(getStartOfPreviousMonth(today)),
    }
  }

  return {
    end: formatIsoDate(today),
    start: formatIsoDate(weekStart),
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
    'previous_month',
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

function formatMonthDay(value) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatMonthDayRange(start, end) {
  const startDate = new Date(`${start}T00:00:00.000Z`)
  const endDate = new Date(`${end}T00:00:00.000Z`)
  const sameMonth = startDate.getUTCFullYear() === endDate.getUTCFullYear()
    && startDate.getUTCMonth() === endDate.getUTCMonth()
  const startLabel = startDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  const endLabel = endDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
    timeZone: 'UTC',
  })

  return `${startLabel}-${endLabel}`
}

function formatWeekEndingLabel(end) {
  return `Week ending ${formatMonthDay(end)}`
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

export function createGrowthReviewPeriodOptions(now) {
  const currentWeek = getDateRangeForPreset('current_week', now)
  const previousWeek = getDateRangeForPreset('previous_week', now)
  const currentBiweekly = getDateRangeForPreset('current_biweekly', now)
  const previousMonth = getDateRangeForPreset('previous_month', now)
  const currentWeekDateLabel = formatMonthDayRange(currentWeek.start, currentWeek.end)
  const previousWeekDateLabel = formatMonthDayRange(previousWeek.start, previousWeek.end)
  const currentBiweeklyDateLabel = formatMonthDayRange(currentBiweekly.start, currentBiweekly.end)
  const previousMonthDateLabel = formatMonthDayRange(previousMonth.start, previousMonth.end)

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
        label: 'Previous 2 weeks',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
        range: currentBiweekly,
      }),
      createPeriodOption({
        key: 'previous_month',
        label: 'Previous month',
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.MONTHLY,
        range: previousMonth,
      }),
    ],
    reviewPeriodOptions: [
      {
        key: 'current_week',
        dateLabel: currentWeekDateLabel,
        label: formatWeekEndingLabel(currentWeek.end),
        periodId: 'current_week',
        periodLabel: formatPeriodRangeLabel(currentWeek.start, currentWeek.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
      },
      {
        key: 'previous_week',
        dateLabel: previousWeekDateLabel,
        label: 'Previous week',
        periodId: 'previous_week',
        periodLabel: formatPeriodRangeLabel(previousWeek.start, previousWeek.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
      },
      {
        key: 'current_biweekly',
        dateLabel: currentBiweeklyDateLabel,
        label: 'Previous 2 weeks',
        periodId: 'current_biweekly',
        periodLabel: formatPeriodRangeLabel(currentBiweekly.start, currentBiweekly.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY,
      },
      {
        key: 'previous_month',
        dateLabel: previousMonthDateLabel,
        label: 'Previous month',
        periodId: 'previous_month',
        periodLabel: formatPeriodRangeLabel(previousMonth.start, previousMonth.end),
        periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.MONTHLY,
      },
      {
        key: 'custom',
        dateLabel: '',
        label: 'Custom range',
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

function normalizeCampaignMetadata(payload) {
  const campaign = payload?.campaign && typeof payload.campaign === 'object'
    ? payload.campaign
    : {}

  return {
    activityStartDate: campaign.activity_start_date ?? campaign.activityStartDate ?? '',
    id: campaign.id ?? '',
    name: campaign.name ?? campaign.label ?? '',
    status: campaign.status ?? '',
    type: campaign.type ?? '',
    value: campaign.value ?? campaign.campaign_value ?? campaign.campaignValue ?? '',
  }
}

function buildCampaignQuery(campaignId) {
  if (!campaignId) {
    return ''
  }

  const params = new URLSearchParams()
  params.set('campaign_id', campaignId)

  return `?${params.toString()}`
}

function normalizeGrowthReviewCampaignOption(campaign = {}) {
  return {
    activityStartDate: campaign.activity_start_date ?? campaign.activityStartDate ?? '',
    campaignValue: campaign.campaign_value ?? campaign.campaignValue ?? campaign.value ?? '',
    hasCompletedCalculation: Boolean(
      campaign.has_completed_calculation ?? campaign.hasCompletedCalculation,
    ),
    id: campaign.id ?? '',
    isDefault: Boolean(campaign.is_default ?? campaign.isDefault),
    lastCalculatedAt: campaign.last_calculated_at ?? campaign.lastCalculatedAt ?? '',
    name: campaign.name ?? campaign.label ?? '',
    pipelineId: campaign.pipeline_id ?? campaign.pipelineId ?? '',
    sourceConnectionId: campaign.source_connection_id ?? campaign.sourceConnectionId ?? '',
    status: campaign.status ?? '',
    type: campaign.type ?? '',
  }
}

export async function getGrowthReviewCampaignsFromApi({
  apiClient,
  workspaceId,
}) {
  if (!workspaceId) {
    return {
      campaigns: [],
      defaultCampaignId: '',
    }
  }

  const payload = await apiClient.get(`/api/workspaces/${workspaceId}/growth-review/campaigns/`)

  return {
    campaigns: Array.isArray(payload?.campaigns)
      ? payload.campaigns.map(normalizeGrowthReviewCampaignOption)
      : [],
    defaultCampaignId: payload?.default_campaign_id ?? payload?.defaultCampaignId ?? '',
  }
}

export async function getGrowthReviewDashboardPageFromApi({
  apiClient,
  campaignId,
  now = new Date(),
  viewer,
  workspaceId,
}) {
  if (!workspaceId) {
    return {
      reason: 'workspace_not_found',
      status: 'error',
    }
  }

  const payload = await apiClient.get(`/api/workspaces/${workspaceId}/growth-review/${buildCampaignQuery(campaignId)}`)
  const readModel = normalizeGrowthReviewReadModel({
    ...payload,
    workspace_id: payload?.workspace_id ?? workspaceId,
  })
  const charts = normalizeGrowthReviewChartsReadModel(payload)
  const weeklyReporting = normalizeGrowthReviewWeeklyReportingReadModel(payload)
  const periodOptions = createGrowthReviewPeriodOptions(now)
  const preset = getDentalGrowthReviewPresetForViewer(viewer)

  return {
    calculationMeta: null,
    campaign: normalizeCampaignMetadata(payload),
    campaignId: campaignId || payload?.campaign?.id || '',
    charts,
    dashboardExplanations: normalizeGrowthReviewDashboardExplanations(
      payload?.dashboard_explanations ?? payload?.chart_explanations,
    ),
    client: {
      id: workspaceId,
      name: payload?.workspace?.name ?? payload?.client?.name ?? 'Workspace',
      portalSlug: payload?.workspace?.slug ?? payload?.client?.portalSlug ?? '',
    },
    period: readModel.period,
    periodOptions: periodOptions.periodOptions,
    layout: charts.layout,
    permissions: {
      canCustomizeLayout: payload?.permissions?.can_customize_layout === true,
      canEditDashboardExplanations:
        payload?.permissions?.can_edit_dashboard_explanations === true
        || payload?.permissions?.can_edit_chart_explanations === true,
    },
    preset,
    previousPeriod: null,
    reason: null,
    reviewPeriodOptions: periodOptions.reviewPeriodOptions,
    selectedReviewPeriodOptionKey: '',
    source: 'published',
    status: 'ready',
    weeklyReporting,
    zones: mapZoneState(preset),
  }
}

export async function updateGrowthReviewDashboardExplanation({
  apiClient,
  campaignId,
  explanationKey,
  explanation,
  workspaceId,
}) {
  if (!workspaceId || !campaignId || !explanationKey) {
    throw new Error('Workspace, campaign, and dashboard item are required to update an explanation.')
  }

  const payload = await apiClient.request(
    `/api/workspaces/${workspaceId}/growth-review/dashboard-explanations/${encodeURIComponent(explanationKey)}/`,
    {
      body: {
        additional_note: explanation.additionalNote,
        calculation_explanation: explanation.calculationExplanation,
        campaign_id: campaignId,
        definition: explanation.definition,
      },
      method: 'PUT',
    },
  )

  return normalizeGrowthReviewDashboardExplanations({
    [explanationKey]: payload.explanation,
  })[explanationKey]
}

export async function resetGrowthReviewDashboardExplanation({
  apiClient,
  campaignId,
  explanationKey,
  workspaceId,
}) {
  if (!workspaceId || !campaignId || !explanationKey) {
    throw new Error('Workspace, campaign, and dashboard item are required to reset an explanation.')
  }

  const query = new URLSearchParams({ campaign_id: campaignId })
  const payload = await apiClient.request(
    `/api/workspaces/${workspaceId}/growth-review/dashboard-explanations/${encodeURIComponent(explanationKey)}/?${query}`,
    { method: 'DELETE' },
  )

  return normalizeGrowthReviewDashboardExplanations({
    [explanationKey]: payload.explanation,
  })[explanationKey]
}

export async function updateGrowthReviewDashboardLayout({
  apiClient,
  campaignId,
  items,
  reset = false,
  workspaceId,
}) {
  if (!workspaceId) {
    throw new Error('workspaceId is required to update Growth Review layout.')
  }

  if (!campaignId) {
    throw new Error('campaignId is required to update Growth Review layout.')
  }

  const payload = await apiClient.request(`/api/workspaces/${workspaceId}/growth-review/layout/`, {
    body: reset
      ? { campaign_id: campaignId, reset: true }
      : {
        campaign_id: campaignId,
        items: items.map((item, index) => ({
          is_visible: item.isVisible !== false,
          position: (index + 1) * 10,
          widget_key: item.widgetKey ?? item.widget_key,
        })),
      },
    method: 'PUT',
  })

  return normalizeGrowthReviewDashboardLayout(payload.layout)
}

export async function getAcceptedTreatmentDrilldownFromApi({
  apiClient,
  campaignId,
  workspaceId,
}) {
  if (!workspaceId) {
    return {
      available: false,
      items: [],
      reason: 'workspace_not_found',
      stage: {
        count: 0,
        key: 'treatment_accepted',
        label: 'Treatment Accepted',
      },
    }
  }

  return apiClient.get(`/api/workspaces/${workspaceId}/growth-review/drilldowns/accepted-treatment/${buildCampaignQuery(campaignId)}`)
}
