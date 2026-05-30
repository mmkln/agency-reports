import { useNavigate } from 'react-router-dom'

import { GrowthReviewDateRangePicker } from '@/features/growth-review-date-range'
import { PageHeader } from '@/shared/ui'
import {
  createGrowthReviewPeriodOptions,
  resolveGrowthReviewDateRange,
} from '../../../domain/services/growthReviewApiReadService'

function resolveWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.clientId
    ?? runtime.defaultClientId
    ?? runtime.viewer?.activeWorkspaceId
    ?? null
}

export function DentalGrowthReviewPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const navigate = useNavigate()
  const workspaceId = resolveWorkspaceId({ routeParams, runtime })
  const dateRange = resolveGrowthReviewDateRange({
    end: routeParams.end,
    periodId: routeParams.periodId,
    start: routeParams.start,
  })
  const { reviewPeriodOptions } = createGrowthReviewPeriodOptions(new Date())

  function navigateToGrowthReview(search) {
    navigate(`/client/growth-review?${search.toString()}`)
  }

  function handlePeriodChange(optionKey) {
    const selected = reviewPeriodOptions.find((option) => option.key === optionKey)

    if (!selected?.periodId) {
      return
    }

    const search = new URLSearchParams()

    if (workspaceId) {
      search.set('clientId', workspaceId)
    }

    search.set('periodId', selected.periodId)

    if (selected.periodType) {
      search.set('periodType', selected.periodType)
    }

    navigateToGrowthReview(search)
  }

  function handleCustomRangeApply(range) {
    if (!range?.start || !range?.end) {
      return
    }

    const search = new URLSearchParams()

    if (workspaceId) {
      search.set('clientId', workspaceId)
    }

    search.set('start', range.start)
    search.set('end', range.end)

    navigateToGrowthReview(search)
  }

  return (
    <PageHeader
      actions={(
        <GrowthReviewDateRangePicker
          end={dateRange.end}
          onCustomApply={handleCustomRangeApply}
          onPresetSelect={handlePeriodChange}
          presets={reviewPeriodOptions}
          selectedKey={dateRange.selectedKey}
          start={dateRange.start}
        />
      )}
      title={activeRoute.pageTitle ?? activeRoute.label}
      width={activeRoute.contentWidth}
    />
  )
}
