import { forwardRef } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

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
const SEQUENCE_STARTED_STAGE_KEY = 'sequence_started'
const HIDDEN_ACTIVITY_CARD_KEYS = new Set(['duration', 'patients'])
const LABELED_ACTIVITY_CARD_KEYS = new Set(['negative_replies', 'opt_out_patients'])

const refreshStatusLabel = {
  already_running: 'Already running',
  completed: 'Updated',
  failed: 'Failed',
  idle: 'Ready',
  pending: 'Waiting',
  queued: 'Queued',
  running: 'Updating',
  skipped: 'Skipped',
  sync_already_running: 'Already running',
}

const refreshStatusClass = {
  already_running: 'text-premium-blue',
  completed: 'text-success',
  failed: 'text-destructive',
  pending: 'text-text-quaternary',
  queued: 'text-premium-blue',
  running: 'text-premium-blue',
  skipped: 'text-text-muted',
  sync_already_running: 'text-premium-blue',
}

function formatPeriodDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatPeriodRange(period) {
  const start = formatPeriodDate(period?.start ?? period?.period_start)
  const end = formatPeriodDate(period?.end ?? period?.period_end)

  if (!start || !end) {
    return ''
  }

  return `${start} – ${end}`
}

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

function getRefreshButtonLabel(refresh) {
  if (refresh?.isRefreshing) {
    return 'Updating'
  }

  if (refresh?.status === 'already_running') {
    return 'Refresh'
  }

  if (refresh?.status === 'failed') {
    return 'Retry'
  }

  return 'Refresh'
}

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

function getSequenceStartedCount(funnelChart) {
  const stage = funnelChart?.stages?.find((item) => item.stage_id === SEQUENCE_STARTED_STAGE_KEY)

  return Number(stage?.stage_count ?? 0)
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

function RefreshStepStatus({ step }) {
  const status = step.status || 'pending'
  const label = refreshStatusLabel[status] ?? status
  const toneClass = refreshStatusClass[status] ?? 'text-text-muted'
  const detail = step.detail || step.errorMessage || ''

  return (
    <li className="flex items-start justify-between gap-component">
      <span className="min-w-0">
        <span className="block truncate text-label font-medium text-text-secondary">
          {step.label}
        </span>
        {detail ? (
          <span className="mt-1 block text-caption font-normal leading-snug text-text-muted">
            {detail}
          </span>
        ) : null}
      </span>
      <span className={`shrink-0 text-label font-semibold ${toneClass}`}>
        {label}
      </span>
    </li>
  )
}

function RefreshStatusPopover({ refresh }) {
  const steps = refresh?.refreshRun?.steps ?? []
  const hasSteps = steps.length > 0
  const isRefreshing = refresh?.isRefreshing

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-8 rounded-control px-3 text-label"
          onClick={refresh?.startRefresh}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Icon name={isRefreshing ? 'clock' : 'refreshCw'} size={14} />
          {getRefreshButtonLabel(refresh)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div>
          <p className="text-ui font-semibold text-text-primary">
            {isRefreshing ? 'Updating Growth Review' : 'Data refresh'}
          </p>
          <p className="mt-tag text-label font-normal text-text-muted">
            Source data sync and dashboard calculation run on the backend.
          </p>
        </div>

        {hasSteps ? (
          <ul className="mt-component grid gap-control">
            {steps.map((step) => (
              <RefreshStepStatus key={step.key || step.id} step={step} />
            ))}
          </ul>
        ) : (
          <p className="mt-component rounded-control bg-fill-secondary px-control py-item text-label text-text-muted">
            No refresh has been run in this session.
          </p>
        )}

        {refresh?.error ? (
          <p className="mt-control rounded-control bg-destructive/10 px-control py-item text-label font-medium text-destructive">
            {refresh.error}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

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
  campaign,
  campaignSelector,
  chart,
  funnelChart,
  period,
  refresh,
  secondaryAction,
  updatedAt,
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
  const sequenceStartedCount = getSequenceStartedCount(funnelChart)
  const bookingsCount = Number(heroCard?.value ?? 0)
  const bookedPercent = heroCard && cohortCount > 0
    ? formatCohortPercent((bookingsCount / cohortCount) * 100)
    : ''
  const weeklyDelta = getRecentBookingsDelta(chart.series)
  const periodRange = formatPeriodRange(period)
  const cohortLabel = cohortCount > 0
    ? `${cohortCount.toLocaleString('en-US')} patients in cohort`
    : ''
  const sequenceStartedLabel = sequenceStartedCount > 0
    ? `${sequenceStartedCount.toLocaleString('en-US')} started sequence`
    : ''

  return (
    <section className="grid gap-control">
      <header className="flex flex-wrap items-start justify-between gap-control">
        <div className="min-w-0">
          {campaignSelector ?? (
            <h2 className={reactivationText.sectionTitle}>
              {campaign?.name || 'Reactivation campaign'}
            </h2>
          )}
          {periodRange || cohortLabel ? (
            <div className={`mt-tag grid gap-1 ${reactivationText.updatedMeta}`}>
              {periodRange ? <p>{periodRange}</p> : null}
              {cohortLabel ? (
                <p>
                  <span>{cohortLabel}</span>
                  {sequenceStartedLabel ? (
                    <>
                      <span> · </span>
                      <span>{sequenceStartedLabel}</span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-control">
          <p className={reactivationText.updatedMeta}>{formatUpdatedAt(updatedAt)}</p>
          {refresh ? <RefreshStatusPopover refresh={refresh} /> : null}
          {secondaryAction}
        </div>
      </header>
      <div className="grid gap-control md:grid-cols-2 xl:grid-cols-4">
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
      </div>
    </section>
  )
}
