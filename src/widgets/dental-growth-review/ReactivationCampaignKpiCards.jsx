import { Icon } from '@/shared/icons'

import { buildCampaignKpiCardsModel } from './reactivationCampaignKpiModel'
import { CampaignMetricExplanation } from './CampaignMetricExplanation'

const toneClass = {
  blue: 'bg-premium-blue/10 text-premium-blue',
  purple: 'bg-premium-purple/10 text-premium-purple',
}

function CampaignKpiCard({
  card,
  className = '',
  explanationEditor,
  explanations,
}) {
  return (
    <article className={`flex min-h-[92px] items-center gap-control rounded-block bg-block px-4 py-3 shadow-block ${className}`}>
      <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-control ${toneClass[card.tone] ?? toneClass.blue}`}>
        <Icon name={card.iconName} size={17} />
      </span>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-tag">
          <p className="truncate text-label font-semibold text-text-primary">{card.label}</p>
          <CampaignMetricExplanation
            explanationEditor={explanationEditor}
            explanationKey={card.explanationKey}
            explanations={explanations}
          />
        </div>
        <p className="mt-micro text-[26px] font-semibold leading-[30px] tabular-nums text-text-primary">
          {card.value}
        </p>
        <p className="mt-tag truncate text-label font-medium text-text-muted" title={card.helper}>
          {card.helper}
        </p>
      </div>
    </article>
  )
}

export function ReactivationCampaignKpiCards({
  className = '',
  explanationEditor,
  explanations,
  funnelChart,
  includeIds,
}) {
  const includedIds = Array.isArray(includeIds) && includeIds.length ? new Set(includeIds) : null
  const cards = buildCampaignKpiCardsModel(funnelChart)
    .filter((card) => !includedIds || includedIds.has(card.id))

  if (!cards.length) {
    return null
  }

  return cards.map((card) => (
    <CampaignKpiCard
      card={card}
      className={className}
      explanationEditor={explanationEditor}
      explanations={explanations}
      key={card.id}
    />
  ))
}
