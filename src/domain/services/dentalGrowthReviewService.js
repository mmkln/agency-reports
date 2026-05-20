import { CLIENT_TYPES } from '../../entities/client'
import {
  canViewerAccessDentalGrowthReview,
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_ZONES,
  getDentalGrowthReviewPresetForViewer,
  normalizeDentalGrowthReviewPeriod,
  validateDentalGrowthReviewPeriod,
} from '../../entities/dental-growth-review'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

function sortByPeriodDesc(left, right) {
  return new Date(right.period_end || 0).getTime() - new Date(left.period_end || 0).getTime()
    || String(left.label).localeCompare(String(right.label))
}

function canPreviewDraft(viewer) {
  return viewer?.role === USER_ROLES.AGENCY_ADMIN && Boolean(viewer.agencyId)
}

function isVisiblePeriod(period, source) {
  if (source === 'draft') {
    return period.publish_state === DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT
  }

  return [
    DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
    DENTAL_GROWTH_REVIEW_PUBLISH_STATES.ARCHIVED,
  ].includes(period.publish_state)
}

function getClinicClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.type !== CLIENT_TYPES.CLINIC || !canAccessClient(viewer, clientId)) {
    return null
  }

  if (viewer?.agencyId && client.agency_id !== viewer.agencyId) {
    return null
  }

  return client
}

function getDefaultPeriodForType(periods, periodType) {
  return periods.find((period) => period.period_type === periodType) ?? null
}

function getPreviousEquivalentPeriod(periods, selectedPeriod) {
  if (!selectedPeriod) {
    return null
  }

  return periods
    .filter((period) => period.period_type === selectedPeriod.period_type)
    .filter((period) => period.id !== selectedPeriod.id)
    .filter((period) => new Date(period.period_end).getTime() < new Date(selectedPeriod.period_end).getTime())
    .sort(sortByPeriodDesc)[0] ?? null
}

function mapPeriodOption(period) {
  return {
    id: period.id,
    label: period.label,
    periodEnd: period.period_end,
    periodStart: period.period_start,
    periodType: period.period_type,
  }
}

function getPeriodsForType(periods, periodType) {
  return periods
    .filter((period) => period.period_type === periodType)
    .sort(sortByPeriodDesc)
}

function createReviewPeriodOptions(periods) {
  const weeklyPeriods = getPeriodsForType(periods, DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY)
  const biweeklyPeriods = getPeriodsForType(periods, DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY)
  const optionConfigs = [
    ['current_week', 'Current week', weeklyPeriods[0]],
    ['previous_week', 'Previous week', weeklyPeriods[1]],
    ['current_biweekly', 'Current bi-weekly period', biweeklyPeriods[0]],
    ['previous_biweekly', 'Previous bi-weekly period', biweeklyPeriods[1]],
  ]

  return [
    ...optionConfigs
      .filter(([, , period]) => period)
      .map(([key, label, period]) => ({
        key,
        label,
        periodId: period.id,
        periodLabel: period.label,
        periodType: period.period_type,
      })),
    {
      disabled: true,
      key: 'custom',
      label: 'Custom date range',
      periodId: null,
      periodLabel: 'Available through imported custom periods',
      periodType: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.CUSTOM,
    },
  ]
}

function getSelectedReviewPeriodOptionKey(options, selectedPeriod) {
  return options.find((option) => option.periodId === selectedPeriod?.id)?.key ?? selectedPeriod?.id ?? ''
}

function mapZoneState(preset) {
  return DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
    ...zone,
    defaultCollapsed: preset === 'operator'
      ? zone.defaultCollapsedForOperator
      : zone.defaultCollapsedForExecutive,
  }))
}

export function getDentalGrowthReviewDashboardPage({
  clientId,
  periodId,
  periodType = DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
  source = 'published',
  repositories,
  viewer,
}) {
  const client = getClinicClient({ clientId, repositories, viewer })
  const normalizedSource = source === 'draft' ? 'draft' : 'published'

  if (!client || !canViewerAccessDentalGrowthReview(viewer)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  if (normalizedSource === 'draft' && !canPreviewDraft(viewer)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const periods = (repositories.dentalGrowthReviewPeriods?.listByClientId(clientId) ?? [])
    .map((record) => validateDentalGrowthReviewPeriod(record))
    .filter((period) => isVisiblePeriod(period, normalizedSource))
    .sort(sortByPeriodDesc)
  const normalizedPeriodType = Object.values(DENTAL_GROWTH_REVIEW_PERIOD_TYPES).includes(periodType)
    ? periodType
    : DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY
  const selectedPeriod = periodId
    ? periods.find((period) => period.id === periodId) ?? null
    : getDefaultPeriodForType(periods, normalizedPeriodType) ?? periods[0] ?? null
  const previousPeriod = getPreviousEquivalentPeriod(periods, selectedPeriod)
  const preset = getDentalGrowthReviewPresetForViewer(viewer)
  const reviewPeriodOptions = createReviewPeriodOptions(periods)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      type: client.type,
    },
    period: selectedPeriod ? normalizeDentalGrowthReviewPeriod(selectedPeriod) : null,
    periodOptions: periods.map(mapPeriodOption),
    preset,
    previousPeriod: previousPeriod ? normalizeDentalGrowthReviewPeriod(previousPeriod) : null,
    reason: periodId && !selectedPeriod ? 'period_not_found' : null,
    reviewPeriodOptions,
    selectedReviewPeriodOptionKey: getSelectedReviewPeriodOptionKey(reviewPeriodOptions, selectedPeriod),
    source: normalizedSource,
    status: 'ready',
    zones: mapZoneState(preset),
  }
}
