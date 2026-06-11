import { Icon } from '@/shared/icons'

import { reactivationText } from './reactivationTypography'

const cardToneClass = {
  amber: {
    icon: 'bg-warning-muted text-warning-foreground',
    surface: 'bg-block text-text-primary',
  },
  blue: {
    icon: 'bg-premium-blue/10 text-premium-blue',
    surface: 'bg-block text-text-primary',
  },
  green: {
    icon: 'bg-success-muted text-success',
    surface: 'bg-block text-text-primary',
    value: reactivationText.metricValuePositive,
  },
  neutral: {
    icon: 'bg-fill-secondary text-text-muted',
    surface: 'bg-block text-text-primary',
  },
  purple: {
    icon: 'bg-premium-purple/10 text-premium-purple',
    surface: 'bg-block text-text-primary',
  },
  red: {
    icon: 'bg-destructive/10 text-destructive',
    surface: 'bg-block text-text-primary',
  },
}

const cardIconByKey = {
  actual_bookings: 'calendar',
  bookings: 'calendar',
  conversion_rate: 'checkCircle2',
  emails_sent: 'mail',
  manager_calls: 'phone',
  patients: 'users',
  sms_sent: 'messageSquare',
  success_rate: 'checkCircle2',
  treatment_accepted: 'checkCircle2',
}

const cardCaptionByKey = {
  actual_bookings: 'Bookings obtained',
  conversion_rate: 'Conversion rate (CR)',
  emails_sent: 'Emails sent',
  manager_calls: 'Calls completed',
  patients: 'Target patients',
  sms_sent: 'SMS sent',
  success_rate: 'Conversion rate (CR)',
  treatment_accepted: 'Conversion rate (CR)',
}

const cardTitleByKey = {
  actual_bookings: 'Bookings',
  bookings: 'Bookings',
  conversion_rate: 'Conversion',
  emails_sent: 'Email',
  manager_calls: 'Managers',
  patients: 'Reach',
  sms_sent: 'SMS',
  success_rate: 'Conversion',
  treatment_accepted: 'Conversion',
}

const cardToneByKey = {
  actual_bookings: 'green',
  bookings: 'green',
  conversion_rate: 'red',
  emails_sent: 'purple',
  manager_calls: 'amber',
  patients: 'blue',
  sms_sent: 'blue',
  success_rate: 'red',
  treatment_accepted: 'red',
}

const DURATION_CARD_KEY = 'duration'
const TREATMENT_ACCEPTED_STAGE_KEY = 'treatment_accepted'

function formatUpdatedAt(value) {
  if (!value) {
    return 'Data update pending'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Data update pending'
  }

  return `Data updated ${date.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
}

function formatCardValue(card) {
  if (card.displayValue) {
    return card.displayValue
  }

  const value = Number(card.value)
  if (card.unit === '%' && Number.isFinite(value)) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`
  }

  if (card.unit === 'days') {
    return `${card.value} days`
  }

  if (Number.isFinite(value)) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value)
  }

  return card.value
}

function getCardIconName(card) {
  return cardIconByKey[card.key] ?? 'target'
}

function getCardTone(card) {
  return cardToneByKey[card.key] ?? 'neutral'
}

function getCardTitle(card) {
  return cardTitleByKey[card.key] ?? card.label
}

function formatCardCaption(card) {
  const caption = String(card.caption || cardCaptionByKey[card.key] || '').trim()
  if (!caption) {
    return ''
  }

  return caption
}

function normalizeStageKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
}

function getTreatmentAcceptedStage(funnelChart) {
  const stages = Array.isArray(funnelChart?.stages) ? funnelChart.stages : []

  return stages.find((stage) => {
    const id = normalizeStageKey(stage.id ?? stage.stage_id)
    const name = normalizeStageKey(stage.stage_name ?? stage.name)

    return id === TREATMENT_ACCEPTED_STAGE_KEY || name === TREATMENT_ACCEPTED_STAGE_KEY
  })
}

function createTreatmentAcceptedCard(funnelChart) {
  const stage = getTreatmentAcceptedStage(funnelChart)
  if (!stage) {
    return null
  }
  const stages = Array.isArray(funnelChart?.stages) ? funnelChart.stages : []
  const cohortCount = Number(stages[0]?.stage_count ?? stages[0]?.count ?? 0)
  const treatmentAcceptedCount = Number(stage.stage_count ?? stage.count ?? stage.output_count ?? 0)
  const conversionRate = cohortCount > 0
    ? (treatmentAcceptedCount / cohortCount) * 100
    : 0

  return {
    caption: 'Conversion rate (CR)',
    displayValue: `${conversionRate.toFixed(conversionRate >= 10 || conversionRate === 0 ? 0 : 2)}%`,
    key: TREATMENT_ACCEPTED_STAGE_KEY,
    label: 'Conversion',
    unit: '%',
    value: conversionRate,
  }
}

function buildActivityCards({ cards, funnelChart }) {
  const treatmentAcceptedCard = createTreatmentAcceptedCard(funnelChart)
  const sourceCards = Array.isArray(cards) ? cards : []

  if (!treatmentAcceptedCard) {
    return sourceCards.filter((card) => card.key !== DURATION_CARD_KEY)
  }

  const nextCards = []
  let inserted = false

  sourceCards.forEach((card) => {
    if (card.key === DURATION_CARD_KEY) {
      nextCards.push(treatmentAcceptedCard)
      inserted = true
      return
    }

    nextCards.push(card)
  })

  if (!inserted) {
    nextCards.push(treatmentAcceptedCard)
  }

  return nextCards
}

function ActivityCard({ card }) {
  const tone = getCardTone(card)
  const classes = cardToneClass[tone] ?? cardToneClass.neutral
  const labelClass = reactivationText.metricLabel
  const valueClass = classes.value ?? reactivationText.metricValue
  const captionClass = reactivationText.metricCaption

  return (
    <article className={`flex min-h-[150px] flex-col justify-between rounded-block p-5 shadow-block ${classes.surface}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-[14px] ${classes.icon}`}>
          <Icon name={getCardIconName(card)} size={19} />
        </span>
        <p className={`pt-0.5 ${labelClass}`}>
          {getCardTitle(card)}
        </p>
      </div>

      <div>
        <p className={valueClass}>
          {formatCardValue(card)}
        </p>
        <p className={`mt-2 ${captionClass}`}>
          {formatCardCaption(card)}
        </p>
      </div>
    </article>
  )
}

export function ReactivationCampaignSummary({ chart, funnelChart, updatedAt }) {
  if (!chart?.available) {
    return null
  }

  const cards = buildActivityCards({
    cards: chart.cards,
    funnelChart,
  })

  return (
    <div className="grid gap-component">
      {cards.length ? (
        <section className="grid gap-control">
          <div className="flex justify-end">
            <p className={reactivationText.updatedMeta}>{formatUpdatedAt(updatedAt)}</p>
          </div>
          <div className="grid gap-control md:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
              <ActivityCard card={card} key={card.key || card.label} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
