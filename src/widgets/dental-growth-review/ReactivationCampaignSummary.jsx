import { MetricGrid, MetricTile } from '@/shared/ui'

import { CampaignMetricExplanation } from './CampaignMetricExplanation'
import { buildReactivationCampaignSummaryModel } from './reactivationCampaignSummaryModel'

export function ReactivationCampaignSummary({
  chart,
  explanationEditor,
  explanations,
  funnelChart,
}) {
  const cards = buildReactivationCampaignSummaryModel({ chart, funnelChart })

  if (!cards.length) {
    return null
  }

  return (
    <MetricGrid variant="compact">
      {cards.map((card) => (
        <MetricTile
          {...card}
          action={(
            <CampaignMetricExplanation
              explanationEditor={explanationEditor}
              explanationKey={card.explanationKey}
              explanations={explanations}
            />
          )}
          key={card.id}
        />
      ))}
    </MetricGrid>
  )
}
