import { useNavigate } from 'react-router-dom'

import { PageShell } from '@/shared/ui'

import {
  DentalGrowthReviewState,
  FunnelView,
  GrowthReviewCoreHeader,
  HeroMetrics,
} from './DentalGrowthReviewBlocks'

export function DentalGrowthReviewDashboard({ page }) {
  const navigate = useNavigate()

  if (page.status === 'error' || !page.period) {
    return (
      <PageShell className="py-section" width="wide">
        <DentalGrowthReviewState page={page} />
      </PageShell>
    )
  }

  const period = page.period
  const content = period.content

  function handlePeriodChange(optionKey) {
    const selected = page.reviewPeriodOptions.find((option) => option.key === optionKey)

    if (!selected?.periodId) {
      return
    }

    const search = new URLSearchParams()
    search.set('clientId', page.client.id)
    search.set('periodId', selected.periodId)

    if (selected?.periodType) {
      search.set('periodType', selected.periodType)
    }

    navigate(`/client/growth-review?${search.toString()}`)
  }

  function handleCustomRangeApply(periodOption) {
    if (!periodOption?.id) {
      return
    }

    const search = new URLSearchParams()
    search.set('clientId', page.client.id)
    search.set('periodId', periodOption.id)

    if (periodOption.periodType) {
      search.set('periodType', periodOption.periodType)
    }

    navigate(`/client/growth-review?${search.toString()}`)
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <GrowthReviewCoreHeader
        onCustomRangeApply={handleCustomRangeApply}
        onPeriodChange={handlePeriodChange}
        page={page}
        selectedPeriodOptionKey={page.selectedReviewPeriodOptionKey}
      />

      <HeroMetrics metrics={content.hero_metrics} />

      <FunnelView funnel={content.funnel} highlights={content.funnel_highlights} />
    </PageShell>
  )
}
