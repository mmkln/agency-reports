import { Icon } from '@/shared/icons'

import { buildCampaignKpiCardsModel } from './reactivationCampaignKpiModel'

const toneClass = {
  blue: 'bg-premium-blue/10 text-premium-blue',
  purple: 'bg-premium-purple/10 text-premium-purple',
}

function CampaignKpiCard({ card }) {
  return (
    <article className="flex min-h-[92px] items-center gap-control rounded-block bg-block px-4 py-3 shadow-block">
      <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-control ${toneClass[card.tone] ?? toneClass.blue}`}>
        <Icon name={card.iconName} size={17} />
      </span>

      <div className="min-w-0">
        <p className="truncate text-label font-semibold text-text-primary">{card.label}</p>
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

export function ReactivationCampaignKpiCards({ funnelChart }) {
  const cards = buildCampaignKpiCardsModel(funnelChart)

  if (!cards.length) {
    return null
  }

  return cards.map((card) => (
    <CampaignKpiCard card={card} key={card.id} />
  ))
}
