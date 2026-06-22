import {
  DENTAL_GROWTH_REVIEW_CONFIDENCE,
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_STATUSES,
  DENTAL_GROWTH_REVIEW_ZONES,
} from '../../entities/dental-growth-review'
import {
  createNormalizedBookingFromGhlEvent,
  createNormalizedContactEventFromGhlEvent,
  createNormalizedLeadFromGhlEvent,
  GHL_GROWTH_REVIEW_EVENT_TYPES,
  normalizeGhlGrowthReviewEvent,
} from '../../entities/ghl-integration'

const GHL_CALCULATION_VERSION = 'growth-review-ghl-v1'

function isDateInsidePeriod(value, periodStart, periodEnd) {
  const time = new Date(value).getTime()
  const start = new Date(`${periodStart}T00:00:00.000Z`).getTime()
  const end = new Date(`${periodEnd}T23:59:59.999Z`).getTime()

  return Number.isFinite(time) && time >= start && time <= end
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function getPreviousPeriod({ periodEnd, periodStart }) {
  const start = new Date(`${periodStart}T00:00:00.000Z`)
  const end = new Date(`${periodEnd}T00:00:00.000Z`)
  const lengthDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1)
  const previousEnd = addDays(start, -1)
  const previousStart = addDays(previousEnd, -(lengthDays - 1))

  return {
    periodEnd: formatIsoDate(previousEnd),
    periodStart: formatIsoDate(previousStart),
  }
}

function getDefaultWeekForDate(value) {
  const end = new Date(value)
  const start = addDays(end, -6)

  return {
    periodEnd: formatIsoDate(end),
    periodStart: formatIsoDate(start),
  }
}

function percentage(numerator, denominator) {
  if (!denominator) {
    return 0
  }

  return Math.round((numerator / denominator) * 100)
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right)

  if (!sorted.length) {
    return null
  }

  const midpoint = Math.floor(sorted.length / 2)

  return sorted.length % 2
    ? sorted[midpoint]
    : Math.round((sorted[midpoint - 1] + sorted[midpoint]) / 2)
}

function getDelta(current, prior) {
  const absolute = current - prior
  const percent = prior ? Math.round((absolute / prior) * 100) : current ? 100 : 0

  return {
    absolute,
    percent,
  }
}

function formatDeltaAbsolute(value, unit = '') {
  if (value === 0) {
    return '0'
  }

  const prefix = value > 0 ? '+' : ''

  return `${prefix}${value}${unit}`
}

function formatDeltaPercent(value) {
  if (value === 0) {
    return '0%'
  }

  return `${value > 0 ? '+' : ''}${value}%`
}

function createHeroMetric({
  confidence = DENTAL_GROWTH_REVIEW_CONFIDENCE.HIGH,
  current,
  formula,
  id,
  prior,
  source = 'GHL',
  status = DENTAL_GROWTH_REVIEW_STATUSES.GREY,
  target = '',
  title,
  tooltip,
  unit = '',
  value = current,
}) {
  const delta = typeof current === 'number' && typeof prior === 'number'
    ? getDelta(current, prior)
    : { absolute: '', percent: '' }
  const displayValue = typeof value === 'number' ? `${value}${unit}` : value

  return {
    confidence,
    delta_absolute: typeof delta.absolute === 'number' ? formatDeltaAbsolute(delta.absolute, unit) : '',
    delta_percent: typeof delta.percent === 'number' ? formatDeltaPercent(delta.percent) : '',
    formula,
    id,
    last_updated_at: new Date().toISOString(),
    prior_period_value: prior || prior === 0 ? `${prior}${unit}` : '',
    source,
    status,
    target,
    title,
    tooltip_definition: tooltip,
    unit,
    value: displayValue || displayValue === 0 ? displayValue : 'Unavailable',
  }
}

function createUnavailableMetric({ formula, id, title, tooltip }) {
  return {
    confidence: DENTAL_GROWTH_REVIEW_CONFIDENCE.UNAVAILABLE,
    delta_absolute: '',
    delta_percent: '',
    formula,
    id,
    last_updated_at: '',
    prior_period_value: '',
    source: 'Unavailable from GHL-only data',
    status: DENTAL_GROWTH_REVIEW_STATUSES.GREY,
    target: '',
    title,
    tooltip_definition: tooltip,
    unit: '',
    value: 'Unavailable',
  }
}

function listPeriodRecords(repository, clientId, dateField, periodStart, periodEnd) {
  return (repository?.listByWorkspaceId(clientId) ?? [])
    .filter((record) => isDateInsidePeriod(record[dateField], periodStart, periodEnd))
}

function calculateMedianFirstReply({ contactEvents, leads }) {
  const eventsByContact = new Map()

  contactEvents.forEach((event) => {
    if (!eventsByContact.has(event.contact_id)) {
      eventsByContact.set(event.contact_id, [])
    }

    eventsByContact.get(event.contact_id).push(event)
  })

  const responseMinutes = leads.map((lead) => {
    const events = (eventsByContact.get(lead.contact_id) ?? [])
      .slice()
      .sort((left, right) => new Date(left.event_at).getTime() - new Date(right.event_at).getTime())
    const firstInbound = events.find((event) => event.direction === 'inbound')
    const firstOutbound = firstInbound
      ? events.find((event) => (
        event.direction === 'outbound'
        && new Date(event.event_at).getTime() >= new Date(firstInbound.event_at).getTime()
      ))
      : events.find((event) => event.direction === 'outbound')

    if (!firstInbound || !firstOutbound) {
      return null
    }

    return Math.round((new Date(firstOutbound.event_at).getTime() - new Date(firstInbound.event_at).getTime()) / 60_000)
  })

  return median(responseMinutes)
}

function countContactedLeads({ contactEvents, leads }) {
  const outboundContacts = new Set(
    contactEvents
      .filter((event) => event.direction === 'outbound')
      .map((event) => event.contact_id),
  )

  return leads.filter((lead) => outboundContacts.has(lead.contact_id)).length
}

function calculatePeriodStats({ clientId, periodEnd, periodStart, repositories }) {
  const leads = listPeriodRecords(repositories.normalizedLeads, clientId, 'created_at', periodStart, periodEnd)
  const contactEvents = listPeriodRecords(repositories.normalizedContactEvents, clientId, 'event_at', periodStart, periodEnd)
  const bookings = listPeriodRecords(repositories.normalizedBookings, clientId, 'appointment_created_at', periodStart, periodEnd)
  const contacted = countContactedLeads({ contactEvents, leads })

  return {
    bookings: bookings.length,
    contacted,
    leadToBookedRate: percentage(bookings.length, leads.length),
    leadToContactedRate: percentage(contacted, leads.length),
    leads: leads.length,
    medianFirstReplyMinutes: calculateMedianFirstReply({ contactEvents, leads }),
  }
}

function getStatusFromRate(value, target) {
  if (!target) {
    return DENTAL_GROWTH_REVIEW_STATUSES.GREY
  }

  if (value >= target) {
    return DENTAL_GROWTH_REVIEW_STATUSES.GREEN
  }

  return value >= target * 0.8
    ? DENTAL_GROWTH_REVIEW_STATUSES.YELLOW
    : DENTAL_GROWTH_REVIEW_STATUSES.RED
}

function createFunnelStage({ count, denominator, id, label, target }) {
  const conversionRate = denominator ? percentage(count, denominator) : 0
  const dropOffCount = Math.max(0, denominator - count)

  return {
    confidence: denominator ? DENTAL_GROWTH_REVIEW_CONFIDENCE.HIGH : DENTAL_GROWTH_REVIEW_CONFIDENCE.UNAVAILABLE,
    conversion_rate: conversionRate,
    drop_off_count: dropOffCount,
    drop_off_percent: denominator ? percentage(dropOffCount, denominator) : 0,
    id,
    stage_count: count,
    stage_name: label,
    status: getStatusFromRate(conversionRate, target),
    target,
    unit: '%',
  }
}

function createGrowthReviewContent({ current, previous }) {
  const contactedTarget = 80
  const bookedTarget = 25
  const firstReplyTargetMinutes = 5
  const medianReply = current.medianFirstReplyMinutes
  const priorMedianReply = previous.medianFirstReplyMinutes

  return {
    decisions: [],
    funnel: [
      createFunnelStage({
        count: current.leads,
        denominator: current.leads,
        id: 'leads-received',
        label: 'Leads Received',
        target: 100,
      }),
      createFunnelStage({
        count: current.contacted,
        denominator: current.leads,
        id: 'contacted',
        label: 'Contacted',
        target: contactedTarget,
      }),
      createFunnelStage({
        count: current.bookings,
        denominator: current.leads,
        id: 'booked',
        label: 'Booked',
        target: bookedTarget,
      }),
    ],
    funnel_highlights: {},
    hero_metrics: [
      createHeroMetric({
        current: current.bookings,
        formula: 'count normalized bookings created inside the selected period',
        id: 'bookings',
        prior: previous.bookings,
        status: current.bookings >= previous.bookings
          ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN
          : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW,
        target: String(Math.max(previous.bookings, 1)),
        title: 'Bookings',
        tooltip: 'Bookings created from GHL appointment and booked-opportunity events.',
      }),
      createHeroMetric({
        current: current.leads,
        formula: 'count canonical leads derived from GHL contacts, opportunities, conversations, and appointments',
        id: 'leads-received',
        prior: previous.leads,
        status: current.leads ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : DENTAL_GROWTH_REVIEW_STATUSES.GREY,
        title: 'Leads Received',
        tooltip: 'Canonical lead events derived from GHL data. A lead is not assumed to be a native GHL object.',
      }),
      createHeroMetric({
        current: current.leadToContactedRate,
        formula: 'leads with outbound follow-up / leads received',
        id: 'lead-contacted-rate',
        prior: previous.leadToContactedRate,
        status: getStatusFromRate(current.leadToContactedRate, contactedTarget),
        target: `${contactedTarget}%`,
        title: 'Lead -> Contacted',
        tooltip: 'Calculated from conversation/call outbound events after a lead is created.',
        unit: '%',
      }),
      createHeroMetric({
        current: current.leadToBookedRate,
        formula: 'bookings created / leads received',
        id: 'lead-booked-rate',
        prior: previous.leadToBookedRate,
        status: getStatusFromRate(current.leadToBookedRate, bookedTarget),
        target: `${bookedTarget}%`,
        title: 'Lead -> Booked',
        tooltip: 'Calculated from normalized bookings divided by canonical leads.',
        unit: '%',
      }),
      createHeroMetric({
        current: medianReply ?? 0,
        formula: 'median first outbound reply time after first inbound message',
        id: 'median-first-reply',
        prior: priorMedianReply ?? 0,
        status: medianReply == null
          ? DENTAL_GROWTH_REVIEW_STATUSES.GREY
          : medianReply <= firstReplyTargetMinutes
            ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN
            : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW,
        target: `<${firstReplyTargetMinutes}m`,
        title: 'Median First Reply',
        tooltip: 'Calculated from GHL conversation message timestamps. Business-hours adjustment comes later.',
        unit: 'm',
        value: medianReply == null ? 'Unavailable' : `${medianReply}m`,
      }),
      createUnavailableMetric({
        formula: 'requires Weave/Dentrix/PMS attendance status',
        id: 'attended-appointments',
        title: 'Attended Appointments',
        tooltip: 'GHL is not the source of truth for attended appointments unless PMS attendance is synced back.',
      }),
    ],
    metrics: [],
    narrative_items: [],
    period_context: {},
  }
}

export function createGhlGrowthReviewPeriod({
  clientId,
  periodEnd,
  periodStart,
  periodType = DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
  repositories,
}) {
  const previousPeriod = getPreviousPeriod({ periodEnd, periodStart })
  const current = calculatePeriodStats({
    clientId,
    periodEnd,
    periodStart,
    repositories,
  })
  const previous = calculatePeriodStats({
    clientId,
    periodEnd: previousPeriod.periodEnd,
    periodStart: previousPeriod.periodStart,
    repositories,
  })
  const calculatedAt = new Date().toISOString()
  const labelPrefix = periodType === DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY
    ? 'Bi-weekly review'
    : periodType === DENTAL_GROWTH_REVIEW_PERIOD_TYPES.CUSTOM
      ? 'Custom review'
      : 'Week ending'

  return {
    calculated_at: calculatedAt,
    calculation_version: GHL_CALCULATION_VERSION,
    client_id: clientId,
    content: createGrowthReviewContent({ current, previous }),
    data_sources: [
      {
        affected_metrics: ['Leads Received', 'Lead -> Contacted', 'Lead -> Booked', 'Bookings', 'Median First Reply'],
        failure_reason: '',
        freshness_note: 'Calculated from normalized GHL events.',
        freshness_status: DENTAL_GROWTH_REVIEW_STATUSES.GREEN,
        id: 'ghl',
        last_updated_at: calculatedAt,
        owner: 'integration',
        source_name: 'GHL',
        source_type: 'crm',
      },
    ],
    id: `growth-review-${clientId}-${periodStart}-${periodEnd}`,
    label: `${labelPrefix} ${periodEnd}`,
    period_end: periodEnd,
    period_start: periodStart,
    period_type: periodType,
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.PUBLISHED,
    title: 'Dental Growth Review',
    updated_at: calculatedAt,
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name,
      zone_number: zone.number,
    })),
  }
}

export function saveGhlGrowthReviewSnapshot({
  clientId,
  periodEnd,
  periodStart,
  periodType = DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
  repositories,
}) {
  const period = createGhlGrowthReviewPeriod({
    clientId,
    periodEnd,
    periodStart,
    periodType,
    repositories,
  })
  const snapshot = {
    calculated_at: period.calculated_at,
    client_id: clientId,
    content: period.content,
    id: `snapshot-${clientId}-${periodStart}-${periodEnd}`,
    period_end: periodEnd,
    period_start: periodStart,
    period_type: periodType,
  }

  repositories.growthReviewSnapshots?.upsert(snapshot)
  repositories.dentalGrowthReviewPeriods?.upsert(period)

  return {
    period,
    snapshot,
  }
}

export function ingestGhlGrowthReviewEvent({
  clientId,
  now = new Date().toISOString(),
  payload,
  repositories,
}) {
  const rawEvent = normalizeGhlGrowthReviewEvent(payload, { clientId, now })

  if (!rawEvent.client_id) {
    throw new Error('GHL event requires client_id.')
  }

  repositories.rawGhlEvents.upsert(rawEvent)

  const shouldCreateLead = [
    GHL_GROWTH_REVIEW_EVENT_TYPES.APPOINTMENT_CREATED,
    GHL_GROWTH_REVIEW_EVENT_TYPES.CONTACT_CREATED,
    GHL_GROWTH_REVIEW_EVENT_TYPES.CONVERSATION_MESSAGE,
    GHL_GROWTH_REVIEW_EVENT_TYPES.OPPORTUNITY_CREATED,
  ].includes(rawEvent.event_type)
  const lead = shouldCreateLead ? createNormalizedLeadFromGhlEvent(rawEvent) : null
  const contactEvent = createNormalizedContactEventFromGhlEvent(rawEvent)
  const booking = createNormalizedBookingFromGhlEvent(rawEvent)

  if (lead) {
    repositories.normalizedLeads.upsert(lead)
  }

  if (contactEvent) {
    repositories.normalizedContactEvents.upsert(contactEvent)
  }

  if (booking) {
    repositories.normalizedBookings.upsert(booking)
  }

  const period = payload?.period_start && payload?.period_end
    ? { periodEnd: payload.period_end, periodStart: payload.period_start }
    : getDefaultWeekForDate(rawEvent.occurred_at)
  const snapshotResult = saveGhlGrowthReviewSnapshot({
    clientId: rawEvent.client_id,
    periodEnd: period.periodEnd,
    periodStart: period.periodStart,
    periodType: payload?.period_type ?? DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
    repositories,
  })

  return {
    booking,
    contactEvent,
    lead,
    period: snapshotResult.period,
    rawEvent,
  }
}
