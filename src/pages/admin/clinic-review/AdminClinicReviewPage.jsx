import { Link, useNavigate } from 'react-router-dom'

import {
  AdminClientWorkspaceFrame,
  getWorkspaceReviewSetupPath,
  resolveRouteWorkspaceId,
} from '@/features/admin-client-workspace'
import { GrowthReviewDateRangePicker } from '@/features/growth-review-date-range'
import { Button } from '@/shared/ui'
import {
  createGrowthReviewPeriodOptions,
  resolveGrowthReviewDateRange,
} from '../../../domain/services/growthReviewApiReadService'
import { DentalGrowthReviewPage } from '../../dashboards/dental-growth-review'

export function AdminClinicReviewPage({ routeParams = {}, runtime }) {
  const navigate = useNavigate()
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })
  const reviewSetupHref = getWorkspaceReviewSetupPath(workspaceId)
  const dateRange = resolveGrowthReviewDateRange({
    end: routeParams.end,
    periodId: routeParams.periodId,
    start: routeParams.start,
  })
  const { reviewPeriodOptions } = createGrowthReviewPeriodOptions(new Date())

  function navigateToReview(search) {
    navigate(`/admin/clinic-review?${search.toString()}`)
  }

  function createBaseSearch() {
    const search = new URLSearchParams()

    if (workspaceId) {
      search.set('workspaceId', workspaceId)
    }

    return search
  }

  function handlePeriodChange(optionKey) {
    const selected = reviewPeriodOptions.find((option) => option.key === optionKey)

    if (!selected?.periodId) {
      return
    }

    const search = createBaseSearch()

    search.set('periodId', selected.periodId)

    if (selected.periodType) {
      search.set('periodType', selected.periodType)
    }

    navigateToReview(search)
  }

  function handleCustomRangeApply(range) {
    if (!range?.start || !range?.end) {
      return
    }

    const search = createBaseSearch()

    search.set('start', range.start)
    search.set('end', range.end)

    navigateToReview(search)
  }

  return (
    <AdminClientWorkspaceFrame
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
      currentPage="clinic-review"
      routeParams={routeParams}
      runtime={runtime}
      width="content"
    >
      <DentalGrowthReviewPage
        funnelEmptyAction={workspaceId ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={reviewSetupHref}>Open Review Setup</Link>
          </Button>
        ) : null}
        routeParams={{
          ...routeParams,
          clientId: workspaceId,
          workspaceId,
        }}
        runtime={runtime}
      />
    </AdminClientWorkspaceFrame>
  )
}
