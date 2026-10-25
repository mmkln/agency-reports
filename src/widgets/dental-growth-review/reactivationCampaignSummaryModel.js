import { buildCampaignKpiCardsModel } from './reactivationCampaignKpiModel'

const BOOKED_EXPECTED_VALUE_CARD_KEY = 'booked_expected_value'
const HERO_CARD_KEYS = new Set(['actual_bookings', 'bookings'])
const HIDDEN_ACTIVITY_CARD_KEYS = new Set(['duration', 'patients'])
const LABELED_ACTIVITY_CARD_KEYS = new Set(['negative_replies', 'opt_out_patients'])

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
  actual_bookings: 'positive',
  booked_expected_value: 'positive',
  bookings: 'positive',
  conversion_rate: 'neutral',
  emails_sent: 'accent',
  manager_calls: 'warning',
  negative_replies: 'negative',
  opt_out_patients: 'negative',
  patients: 'info',
  replied_positive: 'warning',
  sms_sent: 'info',
  success_rate: 'neutral',
  treatment_accepted: 'neutral',
}

const explanationKeyByCardKey = {
  actual_bookings: 'summary.booked_appointments',
  booked_expected_value: 'summary.booked_expected_value',
  bookings: 'summary.booked_appointments',
  emails_sent: 'summary.emails_sent',
  manager_calls: 'summary.manager_calls',
  negative_replies: 'summary.negative_replies',
  opt_out_patients: 'summary.opt_out_patients',
  sms_sent: 'summary.sms_sent',
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

function formatCardCaption(card) {
  return String(card.caption || cardCaptionByKey[card.key] || '').trim()
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
  return label && caption.toLowerCase() === label.toLowerCase() ? '' : caption
}

function formatCohortPercent(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%'
  }

  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
}

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

function buildActivityCardModel(card) {
  const label = getActivityCardLabel(card)
  const helper = getActivityCardCaption(card)

  return {
    explanationKey: explanationKeyByCardKey[card.key],
    helper,
    helperTitle: helper ? `${cardTitleByKey[card.key] ?? card.label}: ${helper}` : '',
    iconName: cardIconByKey[card.key] ?? 'target',
    id: card.key || card.label,
    label,
    tone: cardToneByKey[card.key] ?? 'neutral',
    value: formatCardValue(card),
    variant: 'activity',
  }
}

function buildKpiCardModel(card) {
  return {
    ...card,
    helperTone: 'muted',
    tone: card.tone === 'purple' ? 'accent' : 'info',
    variant: 'standard',
  }
}

export function buildReactivationCampaignSummaryModel({ chart, funnelChart }) {
  if (!chart?.available) {
    return []
  }

  const sourceCards = (Array.isArray(chart.cards) ? chart.cards : [])
    .filter((card) => !HIDDEN_ACTIVITY_CARD_KEYS.has(card.key))
    .filter((card) => !(card.key === 'manager_calls' && !Number(card.value)))

  if (!sourceCards.length) {
    return []
  }

  const heroCard = sourceCards.find((card) => HERO_CARD_KEYS.has(card.key))
  const bookedExpectedValueCard = sourceCards.find((card) => card.key === BOOKED_EXPECTED_VALUE_CARD_KEY)
  const activityCards = sourceCards.filter((card) => card !== heroCard && card !== bookedExpectedValueCard)
  const campaignKpis = buildCampaignKpiCardsModel(funnelChart)
  const patientReplies = campaignKpis.find((card) => card.id === 'patient-replies')
  const replyToBooking = campaignKpis.find((card) => card.id === 'reply-to-booking')
  const cards = []

  if (heroCard) {
    const cohortCount = Number(funnelChart?.stages?.[0]?.stage_count ?? 0)
    const bookingsCount = Number(heroCard.value ?? 0)
    const bookedPercent = cohortCount > 0
      ? formatCohortPercent((bookingsCount / cohortCount) * 100)
      : ''
    const weeklyDelta = getRecentBookingsDelta(chart.series)
    const helper = [
      bookedPercent ? `${bookedPercent} of cohort` : '',
      weeklyDelta > 0 ? `+${weeklyDelta.toLocaleString('en-US')} this week` : '',
    ].filter(Boolean).join(' · ')

    cards.push({
      explanationKey: 'summary.booked_appointments',
      helper,
      iconName: 'calendar',
      id: heroCard.key,
      label: 'Booked appointments',
      tone: 'positive',
      value: formatCardValue(heroCard),
      variant: 'featured',
    })
  }

  if (bookedExpectedValueCard) {
    cards.push({
      emphasis: 'strong',
      explanationKey: 'summary.booked_expected_value',
      iconName: 'dollarSign',
      id: bookedExpectedValueCard.key,
      label: 'Booked expected value',
      tone: 'positive',
      value: formatCardValue(bookedExpectedValueCard),
      variant: 'standard',
    })
  }

  if (patientReplies) {
    cards.push(buildKpiCardModel(patientReplies))
  }

  if (activityCards.length && replyToBooking) {
    cards.push(buildKpiCardModel(replyToBooking))
  }

  cards.push(...activityCards.map(buildActivityCardModel))
  return cards
}
