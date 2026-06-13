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
  bookings: 'calendar',
  conversion_rate: 'checkCircle2',
  emails_sent: 'mail',
  manager_calls: 'phone',
  patients: 'users',
  replied_positive: 'messageSquare',
  sms_sent: 'messageSquare',
  success_rate: 'checkCircle2',
  treatment_accepted: 'checkCircle2',
}

const cardCaptionByKey = {
  actual_bookings: 'Booked appointments',
  conversion_rate: 'Booking conversion',
  emails_sent: 'Emails sent',
  manager_calls: 'Calls completed',
  patients: 'Target patients',
  replied_positive: 'Patient replies',
  sms_sent: 'SMS sent',
  success_rate: 'Booking conversion',
  treatment_accepted: 'Accepted treatment',
}

const cardTitleByKey = {
  actual_bookings: 'Bookings',
  bookings: 'Bookings',
  conversion_rate: 'Conversion',
  emails_sent: 'Email',
  manager_calls: 'Managers',
  patients: 'Reach',
  replied_positive: 'Replied',
  sms_sent: 'SMS',
  success_rate: 'Conversion',
  treatment_accepted: 'Treatment',
}

const cardToneByKey = {
  actual_bookings: 'green',
  bookings: 'green',
  conversion_rate: 'neutral',
  emails_sent: 'purple',
  manager_calls: 'amber',
  patients: 'blue',
  replied_positive: 'amber',
  sms_sent: 'blue',
  success_rate: 'neutral',
  treatment_accepted: 'neutral',
}

const DURATION_CARD_KEY = 'duration'
const TREATMENT_ACCEPTED_STAGE_KEY = 'treatment_accepted'

const refreshStatusLabel = {
  completed: 'Updated',
  failed: 'Failed',
  idle: 'Ready',
  pending: 'Waiting',
  running: 'Updating',
  skipped: 'Skipped',
}

const refreshStatusClass = {
  completed: 'text-success',
  failed: 'text-destructive',
  pending: 'text-text-quaternary',
  running: 'text-premium-blue',
  skipped: 'text-text-muted',
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

  if (refresh?.status === 'failed') {
    return 'Retry'
  }

  return 'Refresh'
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
  const treatmentAcceptedCount = Number(stage.stage_count ?? stage.count ?? stage.output_count ?? 0)

  return {
    caption: 'Accepted treatment',
    displayValue: treatmentAcceptedCount.toLocaleString('en-US'),
    key: TREATMENT_ACCEPTED_STAGE_KEY,
    label: 'Treatment',
    value: treatmentAcceptedCount,
  }
}

function formatCohortPercent(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%'
  }

  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
}

function buildActivityCards({ cards, funnelChart }) {
  const derivedCards = [
    createTreatmentAcceptedCard(funnelChart),
  ].filter(Boolean)
  const sourceCards = (Array.isArray(cards) ? cards : [])
    .filter((card) => card.key !== 'patients')
    .filter((card) => !(card.key === 'manager_calls' && !Number(card.value)))

  const nextCards = []
  let derivedInserted = false

  sourceCards.forEach((card) => {
    if (card.key === DURATION_CARD_KEY) {
      nextCards.push(...derivedCards)
      derivedInserted = true
      return
    }

    nextCards.push(card)
  })

  if (!derivedInserted) {
    nextCards.push(...derivedCards)
  }

  return nextCards
}

function ActivityCard({ card }) {
  const tone = getCardTone(card)
  const classes = cardToneClass[tone] ?? cardToneClass.neutral
  const valueClass = classes.value ?? reactivationText.metricValue
  const captionClass = reactivationText.metricCaption

  return (
    <article className={`flex min-h-[92px] items-center gap-control rounded-block px-4 py-3 shadow-block ${classes.surface}`}>
      <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-control ${classes.icon}`}>
        <Icon name={getCardIconName(card)} size={15} />
      </span>

      <div className="min-w-0">
        <p className={valueClass}>
          {formatCardValue(card)}
        </p>
        <p className={`mt-tag truncate ${captionClass}`} title={`${getCardTitle(card)}: ${formatCardCaption(card)}`}>
          {formatCardCaption(card)}
        </p>
      </div>
    </article>
  )
}

function RefreshStepStatus({ step }) {
  const status = step.status || 'pending'
  const label = refreshStatusLabel[status] ?? status
  const toneClass = refreshStatusClass[status] ?? 'text-text-muted'

  return (
    <li className="flex items-center justify-between gap-component">
      <span className="min-w-0 truncate text-label font-medium text-text-secondary">
        {step.label}
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
    <article className="flex min-h-[92px] items-center gap-3 rounded-block bg-block px-4 py-3 shadow-block md:col-span-3 xl:col-span-2">
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

export function ReactivationCampaignSummary({
  campaign,
  chart,
  funnelChart,
  period,
  refresh,
  updatedAt,
}) {
  if (!chart?.available) {
    return null
  }

  const cards = buildActivityCards({
    cards: chart.cards,
    funnelChart,
  })

  if (!cards.length) {
    return null
  }

  const heroCard = cards.find((card) => HERO_CARD_KEYS.includes(card.key))
  const secondaryCards = cards.filter((card) => card !== heroCard)
  const cohortCount = Number(funnelChart?.stages?.[0]?.stage_count ?? 0)
  const bookingsCount = Number(heroCard?.value ?? 0)
  const bookedPercent = heroCard && cohortCount > 0
    ? formatCohortPercent((bookingsCount / cohortCount) * 100)
    : ''
  const weeklyDelta = getRecentBookingsDelta(chart.series)
  const periodRange = formatPeriodRange(period)
  const headerMeta = [
    periodRange,
    cohortCount > 0 ? `${cohortCount.toLocaleString('en-US')} patients in cohort` : '',
  ].filter(Boolean)

  return (
    <section className="grid gap-control">
      <header className="flex flex-wrap items-start justify-between gap-control">
        <div className="min-w-0">
          <h2 className={reactivationText.sectionTitle}>
            {campaign?.name || 'Reactivation campaign'}
          </h2>
          {headerMeta.length ? (
            <p className={`mt-tag ${reactivationText.updatedMeta}`}>
              {headerMeta.join(' · ')}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-control">
          <p className={reactivationText.updatedMeta}>{formatUpdatedAt(updatedAt)}</p>
          {refresh ? <RefreshStatusPopover refresh={refresh} /> : null}
        </div>
      </header>
      <div className="grid gap-control md:grid-cols-3 xl:grid-cols-7">
        {heroCard ? <HeroBookingsCard bookedPercent={bookedPercent} card={heroCard} weeklyDelta={weeklyDelta} /> : null}
        <ReactivationCampaignKpiCards funnelChart={funnelChart} />
        {secondaryCards.map((card) => (
          <ActivityCard card={card} key={card.key || card.label} />
        ))}
      </div>
    </section>
  )
}
