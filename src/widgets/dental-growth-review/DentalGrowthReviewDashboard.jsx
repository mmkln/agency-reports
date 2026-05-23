import { useNavigate } from 'react-router-dom'

import { PageShell } from '@/shared/ui'

import {
  CompactFreshnessFooter,
  DataTrustAlert,
  DecisionCards,
  DentalGrowthReviewState,
  FunnelView,
  GrowthReviewCoreHeader,
  HeroMetrics,
  NarrativeColumns,
} from './DentalGrowthReviewBlocks'

export function DentalGrowthReviewDashboard({ page }) {
  const navigate = useNavigate()

  if (page.status === 'error' || !page.period) {
    return (
      <PageShell className="py-section" width="full">
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

  return (
    <PageShell className="pb-section pt-card" width="full">
      <GrowthReviewCoreHeader
        onPeriodChange={handlePeriodChange}
        page={page}
        selectedPeriodOptionKey={page.selectedReviewPeriodOptionKey}
      />

      <DataTrustAlert sources={period.data_sources} />

      <HeroMetrics metrics={content.hero_metrics} />

      <NarrativeColumns items={content.narrative_items} />

      <FunnelView funnel={content.funnel} highlights={content.funnel_highlights} />

      <DecisionCards decisions={content.decisions} />

      <CompactFreshnessFooter sources={period.data_sources} />
    </PageShell>
  )
}
