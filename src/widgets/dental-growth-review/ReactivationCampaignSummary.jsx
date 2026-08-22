import { forwardRef } from 'react'

import { Icon } from '@/shared/icons'

import { ReactivationCampaignKpiCards } from './ReactivationCampaignKpiCards'
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
  booked_expected_value: 'dollarSign',
  bookings: 'calendar',
  conversion_rate: 'checkCircle2',
  emails_sent: 'mail',
  manager_calls: 'phone',
  negative_replies: 'circleAlert',
  opt_out_patients: 'circleAlert',
  patients: 'users',
  replied_positive: 'messageSquare',
  sms_sent: 'messageSquare',
  success_rate: 'checkCircle2',
  treatment_accepted: 'checkCircle2',
}

const cardCaptionByKey = {
  actual_bookings: 'Booked appointments',
  booked_expected_value: 'Booked expected value',
  conversion_rate: 'Booking conversion',
  emails_sent: 'Emails sent',
  manager_calls: 'Calls completed',
  negative_replies: 'Negative replies',
  opt_out_patients: 'Opted out patients',
  patients: 'Target patients',
  replied_positive: 'Patient replies',
  sms_sent: 'SMS sent',
  success_rate: 'Booking conversion',
  treatment_accepted: 'Accepted treatment',
}

const cardTitleByKey = {
  actual_bookings: 'Bookings',
  booked_expected_value: 'Value',
  bookings: 'Bookings',
  conversion_rate: 'Conversion',
  emails_sent: 'Email',
  manager_calls: 'Managers',
  negative_replies: 'Negative',
  opt_out_patients: 'Opt-outs',
  patients: 'Reach',
  replied_positive: 'Replied',
  sms_sent: 'SMS',
  success_rate: 'Conversion',
  treatment_accepted: 'Treatment',
}

const cardToneByKey = {
  actual_bookings: 'green',
  booked_expected_value: 'green',
  bookings: 'green',
  conversion_rate: 'neutral',
  emails_sent: 'purple',
  manager_calls: 'amber',
  negative_replies: 'red',
  opt_out_patients: 'red',
  patients: 'blue',
  replied_positive: 'amber',
  sms_sent: 'blue',
  success_rate: 'neutral',
  treatment_accepted: 'neutral',
}

const BOOKED_EXPECTED_VALUE_CARD_KEY = 'booked_expected_value'
const HIDDEN_ACTIVITY_CARD_KEYS = new Set(['duration', 'patients'])
const LABELED_ACTIVITY_CARD_KEYS = new Set(['negative_replies', 'opt_out_patients'])

function formatCardValue(card) {
  if (card.key === BOOKED_EXPECTED_VALUE_CARD_KEY) {
    const value = Number(card.value)
    if (Number.isFinite(value)) {
      return new Intl.NumberFormat('en-US', {
        currency: 'USD',
        maximumFractionDigits: 0,
        style: 'currency',
      }).format(value)
    }
  }

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

function getActivityCardLabel(card) {
  if (!LABELED_ACTIVITY_CARD_KEYS.has(card.key)) {
    return ''
  }

  return String(cardCaptionByKey[card.key] || card.label || '').trim()
}

function getActivityCardCaption(card) {
  const caption = formatCardCaption(card)
  const label = getActivityCardLabel(card)

  if (label && caption.toLowerCase() === label.toLowerCase()) {
    return ''
  }

  return caption
}

function findCardByKey(cards, key) {
  return cards.find((card) => card.key === key) ?? null
}

function formatCohortPercent(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%'
  }

  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
}

function buildActivityCards({ cards }) {
  return (Array.isArray(cards) ? cards : [])
    .filter((card) => !HIDDEN_ACTIVITY_CARD_KEYS.has(card.key))
    .filter((card) => !(card.key === 'manager_calls' && !Number(card.value)))
}

const ActivityCard = forwardRef(function ActivityCard({
  card,
  className = '',
  isInteractive = false,
  ...triggerProps
}, ref) {
  const tone = getCardTone(card)
  const classes = cardToneClass[tone] ?? cardToneClass.neutral
  const valueClass = classes.value ?? reactivationText.metricValue
  const captionClass = reactivationText.metricCaption
  const label = getActivityCardLabel(card)
  const caption = getActivityCardCaption(card)
  const iconSizeClass = label ? 'size-9' : 'size-8'
  const iconSize = label ? 17 : 15
  const labeledValueClass = 'mt-micro text-[26px] font-semibold leading-[30px] tabular-nums text-text-primary'
  const labeledCaptionClass = 'mt-tag truncate text-label font-medium text-text-muted'
  const content = (
    <>
      <span className={`inline-flex ${iconSizeClass} shrink-0 items-center justify-center rounded-control ${classes.icon}`}>
        <Icon name={getCardIconName(card)} size={iconSize} />
      </span>

      <div className="min-w-0 flex-1 text-left">
        {label ? (
          <p className="truncate text-label font-semibold text-text-primary">{label}</p>
        ) : null}
        <p className={label ? labeledValueClass : valueClass}>
          {formatCardValue(card)}
        </p>
        {caption ? (
          <p className={label ? labeledCaptionClass : `mt-tag truncate ${captionClass}`} title={`${getCardTitle(card)}: ${caption}`}>
            {caption}
          </p>
        ) : null}
      </div>

      {isInteractive ? (
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-control text-text-quaternary">
          <Icon name="arrowRight" size={14} />
        </span>
      ) : null}
    </>
  )

  if (isInteractive) {
    const buttonClassName = [
      `flex min-h-[92px] w-full items-center gap-control rounded-block px-4 py-3 shadow-block transition hover:bg-fill-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${classes.surface}`,
      className,
    ].filter(Boolean).join(' ')

    return (
      <button
        aria-label={`View ${formatCardCaption(card)} patients`}
        className={buttonClassName}
        ref={ref}
        type="button"
        {...triggerProps}
      >
        {content}
      </button>
    )
  }

  return (
    <article className={`flex min-h-[92px] items-center gap-control rounded-block px-4 py-3 shadow-block ${classes.surface} ${className}`}>
      {content}
    </article>
  )
})

const HERO_CARD_KEYS = ['actual_bookings', 'bookings']
const PATIENT_REPLIES_CARD_ID = 'patient-replies'
const REPLY_TO_BOOKING_CARD_ID = 'reply-to-booking'

function getRecentBookingsDelta(series = [], days = 7) {
  const points = (Array.isArray(series) ? series : []).filter((point) => point?.date)
  const lastPoint = points[points.length - 1]

  if (!lastPoint) {
    return 0
  }

  const lastDate = new Date(`${lastPoint.date}T00:00:00.000Z`)

  if (Number.isNaN(lastDate.getTime())) {
    return 0
  }

  const cutoff = new Date(lastDate)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)

  let baseline = 0

  points.forEach((point) => {
    const pointDate = new Date(`${point.date}T00:00:00.000Z`)

    if (!Number.isNaN(pointDate.getTime()) && pointDate <= cutoff) {
      baseline = Number(point.cumulativeBookings ?? baseline) || baseline
    }
  })

  return Math.max(0, Number(lastPoint.cumulativeBookings ?? 0) - baseline)
}

function HeroBookingsCard({ bookedPercent, card, weeklyDelta }) {
  const context = [
    bookedPercent ? `${bookedPercent} of cohort` : '',
    weeklyDelta > 0 ? `+${weeklyDelta.toLocaleString('en-US')} this week` : '',
  ].filter(Boolean).join(' · ')

  return (
    <article className="flex min-h-[92px] items-center gap-3 rounded-block bg-block px-4 py-3 shadow-block">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
        <Icon name="calendar" size={19} />
      </span>
      <div className="min-w-0">
        <p className={reactivationText.metricLabel}>Booked appointments</p>
        <p className="mt-tag flex flex-wrap items-baseline gap-x-2">
          <span className="text-[40px] font-semibold leading-[42px] tracking-normal tabular-nums text-success">
            {formatCardValue(card)}
          </span>
          {context ? (
            <span className="text-ui font-normal leading-5 text-text-secondary">{context}</span>
          ) : null}
        </p>
      </div>
    </article>
  )
}

function BookedExpectedValueCard({ card }) {
  return (
    <article className="flex min-h-[92px] items-center gap-3 rounded-block bg-block px-4 py-3 shadow-block">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-success-muted text-success">
        <Icon name="dollarSign" size={19} />
      </span>
      <div className="min-w-0">
        <p className={reactivationText.metricLabel}>Booked expected value</p>
        <p className="mt-tag text-[30px] font-semibold leading-[34px] tracking-normal tabular-nums text-success">
          {formatCardValue(card)}
        </p>
      </div>
    </article>
  )
}

export function ReactivationCampaignSummary({
  chart,
  funnelChart,
}) {
  if (!chart?.available) {
    return null
  }

  const cards = buildActivityCards({
    cards: chart.cards,
  })

  if (!cards.length) {
    return null
  }

  const heroCard = cards.find((card) => HERO_CARD_KEYS.includes(card.key))
  const bookedExpectedValueCard = findCardByKey(cards, BOOKED_EXPECTED_VALUE_CARD_KEY)
  const activityCards = cards.filter((card) => (
    card !== heroCard
    && card !== bookedExpectedValueCard
  ))
  const cohortCount = Number(funnelChart?.stages?.[0]?.stage_count ?? 0)
  const bookingsCount = Number(heroCard?.value ?? 0)
  const bookedPercent = heroCard && cohortCount > 0
    ? formatCohortPercent((bookingsCount / cohortCount) * 100)
    : ''
  const weeklyDelta = getRecentBookingsDelta(chart.series)

  return (
    <section className="grid gap-control md:grid-cols-2 xl:grid-cols-4">
      {heroCard ? <HeroBookingsCard bookedPercent={bookedPercent} card={heroCard} weeklyDelta={weeklyDelta} /> : null}
      {bookedExpectedValueCard ? <BookedExpectedValueCard card={bookedExpectedValueCard} /> : null}
      <ReactivationCampaignKpiCards
        funnelChart={funnelChart}
        includeIds={[PATIENT_REPLIES_CARD_ID]}
      />
      {activityCards.length ? (
        <>
          <ReactivationCampaignKpiCards
            funnelChart={funnelChart}
            includeIds={[REPLY_TO_BOOKING_CARD_ID]}
          />
          {activityCards.map((card) => (
            <ActivityCard card={card} key={card.key || card.label} />
          ))}
        </>
      ) : null}
    </section>
  )
}
