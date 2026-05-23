import {
  DENTAL_GROWTH_REVIEW_LAYER,
  DENTAL_GROWTH_REVIEW_LAYER_META,
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_SOURCE_TYPES,
  DENTAL_GROWTH_REVIEW_STATUSES,
  DENTAL_GROWTH_REVIEW_ZONES,
  normalizeDentalGrowthReviewPeriod,
  normalizeDentalGrowthReviewSourceBatch,
  validateDentalGrowthReviewSourceBatch,
  validateDentalGrowthReviewPeriod,
} from '../../entities/dental-growth-review'
import {
  canViewerImportClinicReporting,
  canViewerPublishClinicReporting,
  CLINIC_REPORTING_LAYERS,
  CLINIC_REPORTING_LAYER_META,
  CLINIC_REPORTING_PUBLISH_STATES,
  normalizeClinicReportingPeriod,
} from '../../entities/clinic-reporting'
import { USER_ROLES } from '../../entities/profile'
import {
  assertClientFacingClinicReportingPayload,
  mapClinicReportingPeriodSummary,
} from './clinicReportingService'

const LAYER_REPOSITORY_KEYS = Object.freeze({
  [CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS]: 'clinicDailyOperations',
  [CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE]: 'clinicExecutivePerformancePeriods',
  [CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY]: 'clinicMonthlyStrategyPeriods',
  [CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR]: 'clinicWeeklyOperatorPeriods',
  [DENTAL_GROWTH_REVIEW_LAYER]: 'dentalGrowthReviewPeriods',
})

const ADMIN_REPORTING_LAYER_META = Object.freeze({
  ...CLINIC_REPORTING_LAYER_META,
  [DENTAL_GROWTH_REVIEW_LAYER]: DENTAL_GROWTH_REVIEW_LAYER_META,
})

const ADMIN_REPORTING_LAYERS = Object.freeze([
  ...Object.values(CLINIC_REPORTING_LAYERS),
  DENTAL_GROWTH_REVIEW_LAYER,
])

function assertAdminCanImport(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId || !canViewerImportClinicReporting(viewer)) {
    throw new Error('Only admins can import clinic reporting records.')
  }
}

function assertAdminCanPublish(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId || !canViewerPublishClinicReporting(viewer)) {
    throw new Error('Only admins can publish clinic reporting records.')
  }
}

function getAdminClinicClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Clinic account was not found.')
  }

  return client
}

function getRepositoryForLayer(repositories, layer) {
  return repositories[LAYER_REPOSITORY_KEYS[layer]]
}

function isDentalGrowthReviewLayer(layer) {
  return layer === DENTAL_GROWTH_REVIEW_LAYER
}

function sortByPeriodDesc(left, right) {
  return new Date(right.periodEnd || 0).getTime() - new Date(left.periodEnd || 0).getTime()
    || String(left.title).localeCompare(String(right.title))
}

function sortByImportedDesc(left, right) {
  return new Date(right.importedAt || right.periodEnd || 0).getTime() - new Date(left.importedAt || left.periodEnd || 0).getTime()
    || String(left.id).localeCompare(String(right.id))
}

function sortDentalGrowthPeriodsDesc(left, right) {
  return new Date(right.period_end || 0).getTime() - new Date(left.period_end || 0).getTime()
    || String(left.label).localeCompare(String(right.label))
}

function parsePayload(rawJson) {
  if (typeof rawJson !== 'string') {
    return rawJson
  }

  return JSON.parse(rawJson)
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0
}

function createSourceSectionReadiness(payload) {
  const sections = [
    ['hero_metrics', 'Hero metrics', ['appointments', 'spend']],
    ['funnel_conversion', 'Funnel conversion', ['leads', 'appointments']],
    ['speed_to_lead_channel', 'Speed-to-lead and channel attribution', ['conversations', 'leads', 'appointments', 'spend']],
    ['reactivation_tracks', 'Reactivation tracks', ['track_touches', 'capacity_slots', 'appointments']],
    ['deliverability_team_health', 'Deliverability and team health', ['sms_events', 'email_events', 'call_logs', 'conversations']],
    ['reputation_referral', 'Reputation and referrals', ['reviews', 'referrals']],
    ['source_freshness', 'Source freshness', ['source_freshness']],
  ]

  return sections.map(([id, label, requiredSections]) => {
    const suppliedSections = requiredSections.filter((section) => hasItems(payload[section]))
    const missingSections = requiredSections.filter((section) => !hasItems(payload[section]))
    const status = suppliedSections.length === requiredSections.length
      ? 'ready'
      : suppliedSections.length > 0 ? 'partial' : 'missing'

    return {
      id,
      label,
      missingSections,
      requiredSections,
      status,
      suppliedSections,
    }
  })
}

function createSourceReadinessWarnings(readiness) {
  return readiness
    .filter((section) => section.status !== 'ready')
    .map((section) => `${section.label} is ${section.status}; missing ${section.missingSections.join(', ')}.`)
}

function assertValidSourceFreshnessPayload(sourcePayload) {
  const freshnessRecords = Array.isArray(sourcePayload.source_freshness) ? sourcePayload.source_freshness : []

  freshnessRecords.forEach((source, index) => {
    const label = `source_freshness[${index}]`
    const sourceName = source.source_name ?? source.name

    if (!sourceName) {
      throw new Error(`${label} requires source_name.`)
    }

    if (!source.last_updated_at || !parseDate(source.last_updated_at)) {
      throw new Error(`${label} requires a valid last_updated_at.`)
    }

    if (!Object.values(DENTAL_GROWTH_REVIEW_STATUSES).includes(source.freshness_status)) {
      throw new Error(`${label} requires freshness_status green, yellow, red, or grey.`)
    }

    if (!Array.isArray(source.affected_metrics) || source.affected_metrics.length === 0) {
      throw new Error(`${label} requires affected_metrics.`)
    }
  })
}

function createImportedPeriod({
  clientId,
  idGenerator,
  layer,
  now,
  payload,
  viewer,
}) {
  const timestamp = now()

  if (isDentalGrowthReviewLayer(layer)) {
    return validateDentalGrowthReviewPeriod({
      ...payload,
      client_id: clientId || payload.client_id,
      created_at: payload.created_at ?? timestamp,
      id: payload.id || idGenerator(),
      publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
      updated_at: timestamp,
    })
  }

  return normalizeClinicReportingPeriod({
    ...payload,
    client_id: clientId || payload.client_id,
    created_at: payload.created_at ?? timestamp,
    created_by: payload.created_by ?? viewer.userId,
    id: payload.id || idGenerator(),
    imported_at: payload.imported_at ?? timestamp,
    layer,
    publish_state: CLINIC_REPORTING_PUBLISH_STATES.DRAFT,
    updated_at: timestamp,
    updated_by: viewer.userId,
  }, layer)
}

function getPeriodClientId(period) {
  return period.client_id
}

function mapDentalGrowthReviewPeriodSummary(period) {
  const normalized = normalizeDentalGrowthReviewPeriod(period)

  return {
    calculatedAt: normalized.calculated_at,
    calculationSourceBatchId: normalized.calculation_source_batch_id,
    calculationVersion: normalized.calculation_version,
    clientId: normalized.client_id,
    id: normalized.id,
    layer: DENTAL_GROWTH_REVIEW_LAYER,
    layerMeta: DENTAL_GROWTH_REVIEW_LAYER_META,
    periodEnd: normalized.period_end,
    periodLabel: normalized.label,
    periodStart: normalized.period_start,
    publishState: normalized.publish_state,
    sourceTrust: normalized.data_sources,
    title: normalized.title,
  }
}

function getWorstFreshnessStatus(sources = []) {
  const statuses = sources.map((source) => source.freshness_status)

  if (statuses.includes(DENTAL_GROWTH_REVIEW_STATUSES.RED)) {
    return DENTAL_GROWTH_REVIEW_STATUSES.RED
  }

  if (statuses.includes(DENTAL_GROWTH_REVIEW_STATUSES.YELLOW)) {
    return DENTAL_GROWTH_REVIEW_STATUSES.YELLOW
  }

  if (statuses.includes(DENTAL_GROWTH_REVIEW_STATUSES.GREEN)) {
    return DENTAL_GROWTH_REVIEW_STATUSES.GREEN
  }

  return DENTAL_GROWTH_REVIEW_STATUSES.GREY
}

function mapDentalGrowthReviewSourceBatchSummary(batch, generatedPeriod) {
  const normalized = normalizeDentalGrowthReviewSourceBatch(batch)
  const freshness = normalized.payload.source_freshness

  return {
    clientId: normalized.client_id,
    generatedPeriodId: normalized.generated_period_id,
    generatedPeriodLabel: generatedPeriod?.label ?? '',
    generatedPublishState: generatedPeriod?.publish_state ?? '',
    generatedTitle: generatedPeriod?.title ?? '',
    id: normalized.id,
    importedAt: normalized.imported_at,
    importedBy: normalized.imported_by,
    periodEnd: normalized.period_end,
    periodStart: normalized.period_start,
    periodType: normalized.period_type,
    sourceType: normalized.source_type,
    validationErrors: normalized.validation_errors,
    validationState: normalized.validation_state,
    worstFreshnessStatus: getWorstFreshnessStatus(freshness),
  }
}

function mapAdminReportingPeriodSummary(period, layer) {
  return isDentalGrowthReviewLayer(layer)
    ? mapDentalGrowthReviewPeriodSummary(period)
    : mapClinicReportingPeriodSummary(period)
}

function getPreviousDentalGrowthReviewPeriod({ batch, repositories }) {
  return (repositories.dentalGrowthReviewPeriods?.listByClientId(batch.client_id) ?? [])
    .map((record) => normalizeDentalGrowthReviewPeriod(record))
    .filter((period) => period.period_type === batch.period_type)
    .filter((period) => new Date(period.period_end).getTime() < new Date(batch.period_end).getTime())
    .sort(sortDentalGrowthPeriodsDesc)[0] ?? null
}

export function previewAdminClinicReportingImport({
  clientId,
  idGenerator,
  layer,
  now = () => new Date().toISOString(),
  rawJson,
  repositories,
  viewer,
}) {
  assertAdminCanImport(viewer)

  try {
    const payload = parsePayload(rawJson)
    const period = createImportedPeriod({
      clientId,
      idGenerator,
      layer,
      now,
      payload,
      viewer,
    })

    getAdminClinicClient({
      clientId: getPeriodClientId(period),
      repositories,
      viewer,
    })
    if (!isDentalGrowthReviewLayer(layer)) {
      assertClientFacingClinicReportingPayload(payload, layer)
    }

    return {
      contractVersion: isDentalGrowthReviewLayer(layer) ? 'dental-growth-review/v1' : 'clinic-reporting/v1',
      errors: [],
      isValid: true,
      period,
      warnings: [],
    }
  } catch (error) {
    return {
      contractVersion: isDentalGrowthReviewLayer(layer) ? 'dental-growth-review/v1' : 'clinic-reporting/v1',
      errors: [
        {
          message: error instanceof Error ? error.message : 'Clinic reporting import failed.',
          path: '$',
          severity: 'error',
        },
      ],
      isValid: false,
      period: null,
      warnings: [],
    }
  }
}

export function importAdminClinicReportingJson(input) {
  const result = previewAdminClinicReportingImport(input)

  if (!result.isValid || !result.period) {
    return result
  }

  const repository = getRepositoryForLayer(input.repositories, input.layer)
  repository.upsert(result.period)

  return {
    ...result,
    period: mapAdminReportingPeriodSummary(result.period, input.layer),
  }
}

export function previewAdminDentalGrowthReviewSourceImport({
  clientId,
  idGenerator,
  now = () => new Date().toISOString(),
  rawJson,
  repositories,
  viewer,
}) {
  assertAdminCanImport(viewer)

  try {
    const payload = parsePayload(rawJson)
    const sourceBatch = createSourceBatchFromPayload({
      clientId,
      idGenerator,
      now,
      payload,
      viewer,
    })
    const sourceReadiness = createSourceSectionReadiness(sourceBatch.payload)
    getAdminClinicClient({
      clientId: sourceBatch.client_id,
      repositories,
      viewer,
    })
    const generatedPeriod = generateDentalGrowthReviewPeriodFromSourceBatch({
      batch: sourceBatch,
      idGenerator,
      now,
      previousPeriod: getPreviousDentalGrowthReviewPeriod({ batch: sourceBatch, repositories }),
      viewer,
    })

    return {
      contractVersion: 'dental-growth-review-source/v1',
      errors: [],
      generatedPeriod,
      isValid: true,
      sourceBatch,
      sourceReadiness,
      warnings: createSourceReadinessWarnings(sourceReadiness),
    }
  } catch (error) {
    return {
      contractVersion: 'dental-growth-review-source/v1',
      errors: [{
        message: error instanceof Error ? error.message : 'Dental growth source import failed.',
        path: '$',
        severity: 'error',
      }],
      generatedPeriod: null,
      isValid: false,
      sourceBatch: null,
      sourceReadiness: [],
      warnings: [],
    }
  }
}

export function importDentalGrowthReviewSourceAndGenerateDraft(input) {
  const result = previewAdminDentalGrowthReviewSourceImport(input)

  if (!result.isValid || !result.sourceBatch || !result.generatedPeriod) {
    return result
  }

  const sourceBatch = {
    ...result.sourceBatch,
    generated_period_id: result.generatedPeriod.id,
  }

  input.repositories.dentalGrowthReviewSourceBatches.upsert(sourceBatch)
  input.repositories.dentalGrowthReviewPeriods.upsert(result.generatedPeriod)

  return {
    ...result,
    generatedPeriod: mapDentalGrowthReviewPeriodSummary(result.generatedPeriod),
    sourceBatch: normalizeDentalGrowthReviewSourceBatch(sourceBatch),
  }
}

export function getAdminClinicReportingPage({ clientId, repositories, viewer }) {
  assertAdminCanImport(viewer)
  const client = getAdminClinicClient({ clientId, repositories, viewer })
  const records = ADMIN_REPORTING_LAYERS.flatMap((layer) => {
    const layerRecords = getRepositoryForLayer(repositories, layer)?.listByClientId(clientId) ?? []

    return layerRecords.map((record) => {
      const recordLayer = record.layer ?? (record.zones ? DENTAL_GROWTH_REVIEW_LAYER : layer)

      return mapAdminReportingPeriodSummary(record, recordLayer)
    })
  })
    .filter((record) => record.layer)
    .sort(sortByPeriodDesc)
  const sourceBatches = (repositories.dentalGrowthReviewSourceBatches?.listByClientId(clientId) ?? [])
    .map((batch) => {
      const normalized = normalizeDentalGrowthReviewSourceBatch(batch)
      const generatedPeriod = normalized.generated_period_id
        ? repositories.dentalGrowthReviewPeriods?.findById(normalized.generated_period_id)
        : null

      return mapDentalGrowthReviewSourceBatchSummary(normalized, generatedPeriod)
    })
    .sort(sortByImportedDesc)

  return {
    client,
    layers: ADMIN_REPORTING_LAYERS.map((layer) => ({
      id: layer,
      ...ADMIN_REPORTING_LAYER_META[layer],
    })),
    records,
    sourceBatches,
  }
}

function normalizeEditablePeriod(period, layer) {
  return isDentalGrowthReviewLayer(layer)
    ? normalizeDentalGrowthReviewPeriod(period)
    : normalizeClinicReportingPeriod(period, layer)
}

function getPublishStateForLayer(layer) {
  return isDentalGrowthReviewLayer(layer)
    ? DENTAL_GROWTH_REVIEW_PUBLISH_STATES
    : CLINIC_REPORTING_PUBLISH_STATES
}

function isArchivedState(layer, publishState) {
  return publishState === getPublishStateForLayer(layer).ARCHIVED
}

function isPublishedState(layer, publishState) {
  return publishState === getPublishStateForLayer(layer).PUBLISHED
}

function finalizePublishStatePeriod({
  layer,
  period,
  publishState,
  timestamp,
  viewer,
}) {
  const nextPeriod = {
    ...period,
    archived_at: isArchivedState(layer, publishState)
      ? period.archived_at ?? timestamp
      : period.archived_at,
    publish_state: publishState,
    published_at: isPublishedState(layer, publishState)
      ? period.published_at ?? timestamp
      : period.published_at,
    published_by: isPublishedState(layer, publishState)
      ? period.published_by ?? viewer.userId
      : period.published_by,
    updated_at: timestamp,
    updated_by: viewer.userId,
  }

  return isDentalGrowthReviewLayer(layer)
    ? validateDentalGrowthReviewPeriod(nextPeriod)
    : nextPeriod
}

function getPeriodSummary(period, layer) {
  return mapAdminReportingPeriodSummary(period, layer)
}

function parseDate(value) {
  const date = value ? new Date(value) : null
  return date && Number.isFinite(date.getTime()) ? date : null
}

function isWithinPeriod(value, periodStart, periodEnd) {
  const date = parseDate(value)
  const start = parseDate(periodStart)
  const end = parseDate(periodEnd)

  if (!date || !start || !end) {
    return false
  }

  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime() + 86_399_999
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString()}`
}

function formatPercent(value) {
  return `${Math.round(value)}%`
}

function formatMinutes(value) {
  return `${Math.round(value)} min`
}

function calculateRate(numerator, denominator) {
  return denominator > 0 ? (numerator / denominator) * 100 : 0
}

function getStatusForLowValue(value, greenTarget, yellowTarget) {
  if (value <= greenTarget) {
    return DENTAL_GROWTH_REVIEW_STATUSES.GREEN
  }

  if (value <= yellowTarget) {
    return DENTAL_GROWTH_REVIEW_STATUSES.YELLOW
  }

  return DENTAL_GROWTH_REVIEW_STATUSES.RED
}

function getStatusForRate(value, greenTarget, yellowTarget) {
  if (value >= greenTarget) {
    return DENTAL_GROWTH_REVIEW_STATUSES.GREEN
  }

  if (value >= yellowTarget) {
    return DENTAL_GROWTH_REVIEW_STATUSES.YELLOW
  }

  return DENTAL_GROWTH_REVIEW_STATUSES.RED
}

function normalizeSourceName(value) {
  const normalized = String(value ?? 'unknown').trim().toLowerCase().replaceAll(/[\s-]+/g, '_')
  const aliases = {
    facebook: 'meta',
    facebook_ads: 'meta',
    fb: 'meta',
    google: 'google_ads',
    google_business_profile: 'gbp',
    google_search: 'google_ads',
    meta_ads: 'meta',
    referrals: 'referral',
    winback: 'reactivation',
  }
  const source = aliases[normalized] ?? normalized
  const allowed = new Set(['meta', 'google_ads', 'gbp', 'organic', 'referral', 'reactivation', 'walk_in', 'email', 'sms', 'unknown'])

  return allowed.has(source) ? source : 'unknown'
}

function getAppointmentDate(appointment) {
  return appointment.appointment_date ?? appointment.scheduled_at ?? appointment.created_at
}

function getCreatedBookings(appointments, periodStart, periodEnd) {
  return appointments.filter((appointment) => {
    const createdAt = appointment.created_at ?? appointment.booked_at ?? getAppointmentDate(appointment)
    return isWithinPeriod(createdAt, periodStart, periodEnd)
  })
}

function getAttendedAppointments(appointments, periodStart, periodEnd) {
  const attendedStatuses = new Set(['attended', 'completed', 'complete'])

  return appointments.filter((appointment) => (
    attendedStatuses.has(String(appointment.status ?? '').toLowerCase())
    && isWithinPeriod(getAppointmentDate(appointment), periodStart, periodEnd)
  ))
}

function getConfirmedAppointments(appointments, periodStart, periodEnd) {
  const confirmedStatuses = new Set(['confirmed', 'attended', 'completed', 'complete'])

  return appointments.filter((appointment) => (
    confirmedStatuses.has(String(appointment.status ?? '').toLowerCase())
    && isWithinPeriod(getAppointmentDate(appointment), periodStart, periodEnd)
  ))
}

function getPatientTypeCount(appointments, patientType) {
  return appointments.filter((appointment) => String(appointment.patient_type ?? '').toLowerCase() === patientType).length
}

function getMinutesBetween(startValue, endValue) {
  const start = parseDate(startValue)
  const end = parseDate(endValue)

  if (!start || !end || end.getTime() < start.getTime()) {
    return null
  }

  return (end.getTime() - start.getTime()) / 60_000
}

function median(values) {
  const sorted = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right)

  if (!sorted.length) {
    return 0
  }

  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function createCalculatedMetric({
  confidence = 'medium',
  formula,
  id,
  lastUpdatedAt,
  source = 'Calculated from source batch',
  status = DENTAL_GROWTH_REVIEW_STATUSES.GREY,
  target,
  title,
  tooltipDefinition,
  unit = '',
  value,
}) {
  return {
    confidence,
    delta_absolute: '',
    delta_percent: '',
    formula,
    id,
    last_updated_at: lastUpdatedAt,
    prior_period_value: '',
    source,
    status,
    target,
    title,
    tooltip_definition: tooltipDefinition,
    unit,
    value,
  }
}

function createSourceBatchFromPayload({
  clientId,
  idGenerator,
  now,
  payload,
  viewer,
}) {
  const sourcePayload = payload.payload ?? payload
  const timestamp = now()

  assertValidSourceFreshnessPayload(sourcePayload)

  return validateDentalGrowthReviewSourceBatch({
    client_id: clientId || payload.client_id,
    id: payload.id || idGenerator(),
    imported_at: payload.imported_at ?? timestamp,
    imported_by: payload.imported_by ?? viewer.userId,
    payload: sourcePayload,
    period_end: payload.period_end ?? sourcePayload.period_end,
    period_start: payload.period_start ?? sourcePayload.period_start,
    period_type: payload.period_type ?? sourcePayload.period_type,
    source_metadata: payload.source_metadata ?? {},
    source_type: payload.source_type ?? DENTAL_GROWTH_REVIEW_SOURCE_TYPES.JSON_IMPORT,
    validation_errors: [],
    validation_state: 'valid',
  })
}

function mapDataSourcesFromPayload(payload, timestamp) {
  const freshnessRecords = payload.source_freshness.length
    ? payload.source_freshness
    : [{
        affected_metrics: ['All calculated metrics'],
        freshness_status: DENTAL_GROWTH_REVIEW_STATUSES.GREY,
        last_updated_at: timestamp,
        source_name: 'JSON source data',
        source_type: 'json',
      }]

  return freshnessRecords.map((source, index) => ({
    affected_metrics: Array.isArray(source.affected_metrics) ? source.affected_metrics : ['Calculated metrics'],
    failure_reason: source.failure_reason ?? '',
    freshness_note: source.freshness_note ?? '',
    freshness_status: source.freshness_status ?? DENTAL_GROWTH_REVIEW_STATUSES.GREY,
    id: source.id ?? `source-${index + 1}`,
    last_updated_at: source.last_updated_at ?? timestamp,
    owner: source.owner ?? '',
    source_name: source.source_name ?? source.name ?? 'Unknown source',
    source_type: source.source_type ?? 'json',
  }))
}

function getFreshnessSummary(dataSources) {
  const staleCount = dataSources.filter((source) => source.freshness_status === DENTAL_GROWTH_REVIEW_STATUSES.RED).length

  if (staleCount > 0) {
    return `${staleCount} source${staleCount === 1 ? '' : 's'} stale. Treat affected metrics as lower confidence.`
  }

  return 'All supplied sources are fresh enough for review.'
}

function createFunnelStages({ attended, bookings, confirmed, leads }) {
  const contacted = leads.filter((lead) => lead.contacted_at || lead.first_reply_at || lead.outbound_attempts > 0).length
  const stages = [
    ['lead-contacted', 'Lead -> Contacted', contacted, leads.length, 95],
    ['lead-booked', 'Lead -> Booked', bookings.length, leads.length, 35],
    ['booked-confirmed', 'Booked -> Confirmed', confirmed.length, bookings.length, 90],
    ['confirmed-attended', 'Confirmed -> Attended', attended.length, confirmed.length, 90],
  ]

  return stages.map(([id, stageName, stageCount, denominator, target]) => ({
    conversion_rate: Math.round(calculateRate(stageCount, denominator)),
    drop_off_count: Math.max(0, denominator - stageCount),
    id,
    stage_count: stageCount,
    stage_name: stageName,
    target,
  }))
}

function getBiggestLeak(funnel) {
  return funnel
    .map((stage) => ({
      ...stage,
      gap: stage.target - stage.conversion_rate,
    }))
    .sort((left, right) => right.gap - left.gap)[0]
}

function createChannelAttribution({ appointments, leads, spend }) {
  const channels = new Map()

  function getChannel(source) {
    const channel = normalizeSourceName(source)

    if (!channels.has(channel)) {
      channels.set(channel, {
        bookings: 0,
        channel,
        cost_per_booking: 0,
        cost_per_lead: 0,
        leads: 0,
        new_patients: 0,
        spend: 0,
      })
    }

    return channels.get(channel)
  }

  leads.forEach((lead) => {
    getChannel(lead.source ?? lead.contact_source).leads += 1
  })
  appointments.forEach((appointment) => {
    const channel = getChannel(appointment.source ?? appointment.contact_source)
    channel.bookings += 1
    channel.new_patients += String(appointment.patient_type ?? '').toLowerCase() === 'new' ? 1 : 0
  })
  spend.forEach((spendItem) => {
    getChannel(spendItem.source).spend += toNumber(spendItem.amount ?? spendItem.spend)
  })

  return [...channels.values()].map((channel) => ({
    ...channel,
    cost_per_booking: channel.bookings > 0 ? Math.round(channel.spend / channel.bookings) : 0,
    cost_per_lead: channel.leads > 0 ? Math.round(channel.spend / channel.leads) : 0,
  }))
}

function createSpeedToLeadMetrics({ conversations, leads, timestamp }) {
  const replyMinutes = conversations
    .map((conversation) => getMinutesBetween(
      conversation.patient_inbound_at ?? conversation.inbound_at ?? conversation.created_at,
      conversation.agent_first_reply_at ?? conversation.first_reply_at ?? conversation.responded_at,
    ))
    .filter((value) => value !== null)
  const medianReply = median(replyMinutes)
  const withinFiveRate = calculateRate(replyMinutes.filter((value) => value <= 5).length, replyMinutes.length)
  const neverContactedRate = calculateRate(
    leads.filter((lead) => !(lead.contacted_at || lead.first_reply_at || Number(lead.outbound_attempts) > 0)).length,
    leads.length,
  )
  const overFifteen = replyMinutes.filter((value) => value > 15).length
  const longestUnresolved = conversations
    .filter((conversation) => !(conversation.resolved_at || conversation.closed_at))
    .map((conversation) => getMinutesBetween(
      conversation.patient_inbound_at ?? conversation.inbound_at ?? conversation.created_at,
      timestamp,
    ))
    .filter((value) => value !== null)
    .sort((left, right) => right - left)[0] ?? 0

  return [
    createCalculatedMetric({ confidence: replyMinutes.length ? 'high' : 'unavailable', formula: 'median(agent_first_reply_at - patient_inbound_at)', id: 'median-first-reply', lastUpdatedAt: timestamp, source: 'Source batch conversations', status: replyMinutes.length ? getStatusForLowValue(medianReply, 5, 15) : DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: '<= 5 min median', title: 'Median Time to First Reply', tooltipDefinition: `${replyMinutes.length} replied conversations supplied.`, value: formatMinutes(medianReply) }),
    createCalculatedMetric({ confidence: replyMinutes.length ? 'high' : 'unavailable', formula: 'replies within 5 minutes / replied inbound conversations', id: 'reply-within-5-min', lastUpdatedAt: timestamp, source: 'Source batch conversations', status: getStatusForRate(withinFiveRate, 80, 60), target: '80%+', title: '% Replies Within 5 Minutes', tooltipDefinition: `${replyMinutes.filter((value) => value <= 5).length} of ${replyMinutes.length} replies within target.`, value: formatPercent(withinFiveRate) }),
    createCalculatedMetric({ confidence: leads.length ? 'high' : 'unavailable', formula: 'leads with zero outbound attempts / total leads', id: 'leads-never-contacted', lastUpdatedAt: timestamp, source: 'Source batch leads', status: getStatusForLowValue(neverContactedRate, 0, 5), target: '0%', title: '% Leads Never Contacted', tooltipDefinition: 'Protected internal audit list is not exposed on this dashboard.', value: formatPercent(neverContactedRate) }),
    createCalculatedMetric({ confidence: replyMinutes.length ? 'medium' : 'unavailable', formula: 'count(replies over 15 min)', id: 'reply-outliers-over-15', lastUpdatedAt: timestamp, source: 'Source batch conversations', status: overFifteen > 0 ? DENTAL_GROWTH_REVIEW_STATUSES.YELLOW : DENTAL_GROWTH_REVIEW_STATUSES.GREEN, target: '0 replies >15 min', title: 'Replies >15 Minutes', tooltipDefinition: 'Actionable outlier count, not a P95 metric.', value: overFifteen }),
    createCalculatedMetric({ confidence: conversations.length ? 'medium' : 'unavailable', formula: 'oldest unresolved inbound conversation age', id: 'longest-unresolved-reply', lastUpdatedAt: timestamp, source: 'Source batch conversations', status: longestUnresolved > 60 ? DENTAL_GROWTH_REVIEW_STATUSES.RED : getStatusForLowValue(longestUnresolved, 15, 60), target: '<= 15 min', title: 'Longest Unresolved Reply', tooltipDefinition: 'Calculated from unresolved inbound conversations only.', value: formatMinutes(longestUnresolved) }),
  ]
}

function groupByTrack(items) {
  const groups = new Map()

  items.forEach((item) => {
    const track = String(item.track ?? 'Unknown').trim() || 'Unknown'

    if (!groups.has(track)) {
      groups.set(track, [])
    }

    groups.get(track).push(item)
  })

  return groups
}

function createReplyRateHeatmap(trackTouches) {
  return [...groupByTrack(trackTouches).entries()].map(([track, touches]) => {
    const row = { id: track, track }

    touches.forEach((touch) => {
      const touchKey = `touch_${touch.touch ?? touch.touch_number ?? 1}`
      row[touchKey] = Math.round(calculateRate(toNumber(touch.replies), toNumber(touch.sent ?? touch.messages_sent)))
    })

    return row
  })
}

function createEmailOpenHeatmap(emailEvents) {
  const grouped = groupByTrack(emailEvents)

  return [...grouped.entries()].map(([track, events]) => {
    const deliveredByTouch = new Map()
    const openedByTouch = new Map()

    events.forEach((event) => {
      const touchKey = `touch_${event.touch ?? event.touch_number ?? 1}`
      deliveredByTouch.set(touchKey, (deliveredByTouch.get(touchKey) ?? 0) + (String(event.status ?? '').toLowerCase() === 'delivered' ? 1 : 0))
      openedByTouch.set(touchKey, (openedByTouch.get(touchKey) ?? 0) + (event.opened_at || String(event.event_type ?? '').toLowerCase() === 'opened' ? 1 : 0))
    })

    const row = { id: track, track }
    ;[...new Set([...deliveredByTouch.keys(), ...openedByTouch.keys()])].forEach((touchKey) => {
      row[touchKey] = Math.round(calculateRate(openedByTouch.get(touchKey) ?? 0, deliveredByTouch.get(touchKey) ?? 0))
    })

    return row
  })
}

function createReactivationTrackPerformance({ appointments, capacitySlots, spend, trackTouches }) {
  const tracks = new Set([
    ...appointments.map((appointment) => appointment.track).filter(Boolean),
    ...trackTouches.map((touch) => touch.track).filter(Boolean),
    ...spend.map((spendItem) => spendItem.track).filter(Boolean),
  ])

  return [...tracks].sort().map((track) => {
    const trackAppointments = appointments.filter((appointment) => appointment.track === track)
    const touches = trackTouches.filter((touch) => touch.track === track)
    const sent = touches.reduce((total, touch) => total + toNumber(touch.sent ?? touch.messages_sent), 0)
    const replies = touches.reduce((total, touch) => total + toNumber(touch.replies), 0)
    const trackSpend = spend
      .filter((spendItem) => spendItem.track === track)
      .reduce((total, spendItem) => total + toNumber(spendItem.amount ?? spendItem.spend), 0)
    const saturdaySlots = capacitySlots.filter((slot) => {
      const slotDate = parseDate(slot.date)
      return slot.track === track && slotDate?.getUTCDay() === 6
    })
    const offered = saturdaySlots.reduce((total, slot) => total + toNumber(slot.slots_offered ?? slot.offered), 0)
    const filled = saturdaySlots.reduce((total, slot) => total + toNumber(slot.slots_booked ?? slot.booked), 0)
    const attended = trackAppointments.filter((appointment) => ['attended', 'completed', 'complete'].includes(String(appointment.status ?? '').toLowerCase())).length

    return {
      bookings: trackAppointments.length,
      cost_per_booking: trackAppointments.length ? Math.round(trackSpend / trackAppointments.length) : 0,
      cumulative_reactivated: attended,
      id: track,
      reply_rate: Math.round(calculateRate(replies, sent)),
      saturday_slot_fill_rate: Math.round(calculateRate(filled, offered)),
      track,
    }
  })
}

function createDeliverabilityMetrics({ emailEvents, smsEvents, timestamp }) {
  const smsSent = smsEvents.length
  const smsDelivered = smsEvents.filter((event) => String(event.status ?? '').toLowerCase() === 'delivered').length
  const smsOptOuts = smsEvents.filter((event) => event.opted_out || String(event.keyword ?? '').toLowerCase() === 'stop').length
  const emailSent = emailEvents.length
  const emailDelivered = emailEvents.filter((event) => String(event.status ?? '').toLowerCase() === 'delivered').length
  const smsDeliverability = calculateRate(smsDelivered, smsSent)
  const smsOptOutRate = calculateRate(smsOptOuts, smsSent)
  const emailDeliverability = calculateRate(emailDelivered, emailSent)

  return [
    createCalculatedMetric({ confidence: smsSent ? 'high' : 'unavailable', formula: 'delivered SMS / sent SMS', id: 'sms-deliverability-rate', lastUpdatedAt: timestamp, source: 'Source batch SMS events', status: smsSent ? getStatusForRate(smsDeliverability, 95, 90) : DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: '95%+', title: 'SMS Deliverability Rate', value: formatPercent(smsDeliverability) }),
    createCalculatedMetric({ confidence: smsSent ? 'high' : 'unavailable', formula: 'STOP responses / total SMS sent', id: 'sms-opt-out-rate', lastUpdatedAt: timestamp, source: 'Source batch SMS events', status: getStatusForLowValue(smsOptOutRate, 0.5, 1), target: '<= 0.5%', title: 'SMS Opt-out Rate', value: `${Math.round(smsOptOutRate * 10) / 10}%` }),
    createCalculatedMetric({ confidence: emailSent ? 'high' : 'unavailable', formula: 'delivered emails / sent emails', id: 'email-deliverability-rate', lastUpdatedAt: timestamp, source: 'Source batch email events', status: emailSent ? getStatusForRate(emailDeliverability, 95, 90) : DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: '95%+', title: 'Email Deliverability Rate', value: formatPercent(emailDeliverability) }),
  ]
}

function createFrontDeskHealthMetrics({ callLogs, conversations, timestamp }) {
  const completedCalls = callLogs.filter((call) => ['completed', 'complete'].includes(String(call.status ?? '').toLowerCase())).length
  const callTarget = Math.max(1, toNumber(callLogs[0]?.weekly_target ?? callLogs[0]?.target, 100))
  const dispositions = callLogs.filter((call) => call.disposition).length
  const bookedCalls = callLogs.filter((call) => ['booked', 'appointment_booked'].includes(String(call.outcome ?? '').toLowerCase())).length
  const replyMinutes = conversations
    .map((conversation) => getMinutesBetween(conversation.patient_inbound_at ?? conversation.inbound_at ?? conversation.created_at, conversation.agent_first_reply_at ?? conversation.first_reply_at ?? conversation.responded_at))
    .filter((value) => value !== null)
  const withinFiveRate = calculateRate(replyMinutes.filter((value) => value <= 5).length, replyMinutes.length)
  const callsToTarget = calculateRate(completedCalls, callTarget)
  const dispositionRate = calculateRate(dispositions, completedCalls)
  const callBookingRate = calculateRate(bookedCalls, completedCalls)

  return [
    createCalculatedMetric({ confidence: replyMinutes.length ? 'high' : 'unavailable', formula: 'replies within 5 min / inbound replies', id: 'front-desk-replies-within-5', lastUpdatedAt: timestamp, source: 'Source batch conversations', status: getStatusForRate(withinFiveRate, 80, 60), target: '80%+', title: 'Response Speed', value: formatPercent(withinFiveRate) }),
    createCalculatedMetric({ confidence: callLogs.length ? 'high' : 'unavailable', formula: 'completed calls / weekly target', id: 'calls-made-vs-target', lastUpdatedAt: timestamp, source: 'Source batch call logs', status: getStatusForRate(callsToTarget, 100, 85), target: `${callTarget} calls`, title: 'Calls Made vs Target', tooltipDefinition: `${completedCalls} / ${callTarget} calls`, value: `${completedCalls} / ${callTarget}` }),
    createCalculatedMetric({ confidence: completedCalls ? 'high' : 'unavailable', formula: 'calls with disposition / completed calls', id: 'disposition-completion-rate', lastUpdatedAt: timestamp, source: 'Source batch call logs', status: getStatusForRate(dispositionRate, 100, 90), target: '100%', title: 'Disposition Completion Rate', value: formatPercent(dispositionRate) }),
    createCalculatedMetric({ confidence: completedCalls ? 'medium' : 'unavailable', formula: 'booked-call outcomes / completed calls', id: 'call-to-booking-rate', lastUpdatedAt: timestamp, source: 'Source batch call logs', status: getStatusForRate(callBookingRate, 20, 10), target: '20%+', title: 'Call-to-Booking Rate', value: formatPercent(callBookingRate) }),
  ]
}

function createOperationsChips({ appointments, assumptions, attended, confirmed, timestamp }) {
  const showRate = calculateRate(attended.length, confirmed.length || appointments.length)

  return [
    createCalculatedMetric({ confidence: confirmed.length ? 'high' : 'medium', formula: 'attended appointments / confirmed appointments', id: 'show-rate-chip', lastUpdatedAt: timestamp, source: 'Source batch appointments', status: getStatusForRate(showRate, 90, 75), target: '90%+', title: 'Show Rate', value: formatPercent(showRate) }),
    createCalculatedMetric({ confidence: assumptions.chair_utilization_rate ? 'medium' : 'unavailable', formula: 'manual/source chair utilization rate', id: 'chair-utilization-chip', lastUpdatedAt: timestamp, source: 'Source batch assumptions', status: getStatusForRate(toNumber(assumptions.chair_utilization_rate), 85, 70), target: '85%+', title: 'Chair Utilization', value: formatPercent(toNumber(assumptions.chair_utilization_rate)) }),
    createCalculatedMetric({ confidence: assumptions.hygiene_reappointment_rate ? 'medium' : 'unavailable', formula: 'manual/source hygiene reappointment rate', id: 'hygiene-reappointment-chip', lastUpdatedAt: timestamp, source: 'Source batch assumptions', status: getStatusForRate(toNumber(assumptions.hygiene_reappointment_rate), 80, 65), target: '80%+', title: 'Hygiene Reappointment Rate', value: formatPercent(toNumber(assumptions.hygiene_reappointment_rate)) }),
  ]
}

function createReputationReferralMetrics({ referrals, reviews, timestamp }) {
  const reviewCount = reviews.length
  const ratingTotal = reviews.reduce((total, review) => total + toNumber(review.rating), 0)
  const starRating = reviewCount ? ratingTotal / reviewCount : 0
  const responseRate = calculateRate(reviews.filter((review) => review.responded_at || review.response_status === 'responded').length, reviewCount)

  return [
    createCalculatedMetric({ confidence: reviewCount ? 'medium' : 'unavailable', formula: 'average Google review rating from supplied period reviews', id: 'star-rating', lastUpdatedAt: timestamp, source: 'Source batch reviews', status: starRating >= 4.7 ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : starRating >= 4.4 ? DENTAL_GROWTH_REVIEW_STATUSES.YELLOW : DENTAL_GROWTH_REVIEW_STATUSES.RED, target: '4.7+', title: 'Star Rating', value: Math.round(starRating * 10) / 10 }),
    createCalculatedMetric({ confidence: 'medium', formula: 'count(reviews created within period)', id: 'new-reviews', lastUpdatedAt: timestamp, source: 'Source batch reviews', status: reviewCount > 0 ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW, target: '1+ per period', title: 'New Reviews This Period', value: reviewCount }),
    createCalculatedMetric({ confidence: reviewCount ? 'medium' : 'unavailable', formula: 'responded reviews / new reviews', id: 'review-response-rate', lastUpdatedAt: timestamp, source: 'Source batch reviews', status: getStatusForRate(responseRate, 90, 75), target: '90%+', title: 'Review Response Rate', value: formatPercent(responseRate) }),
    createCalculatedMetric({ confidence: 'medium', formula: 'count(referrals received within period)', id: 'patient-referrals-received', lastUpdatedAt: timestamp, source: 'Source batch referrals', status: referrals.length > 0 ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW, target: '1+ per period', title: 'Patient Referrals Received', value: referrals.length }),
    createCalculatedMetric({ confidence: 'medium', formula: 'trailing supplied referral count', id: 'referrals-12-week-trend', lastUpdatedAt: timestamp, source: 'Source batch referrals', status: referrals.length > 0 ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: 'Increasing trend', title: 'Cumulative Referrals 12-Week Trend', value: referrals.reduce((total, referral) => total + toNumber(referral.count, 1), 0) }),
  ]
}

function parseMetricNumber(value) {
  if (typeof value === 'number') {
    return value
  }

  const match = String(value ?? '').replaceAll(',', '').match(/-?\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function findPreviousMetric(previousPeriod, metricId) {
  return [
    ...(previousPeriod?.content?.hero_metrics ?? []),
    ...(previousPeriod?.content?.speed_to_lead ?? []),
    ...(previousPeriod?.content?.metrics ?? []),
    ...(previousPeriod?.content?.front_desk_health ?? []),
    ...(previousPeriod?.content?.operations_chips ?? []),
    ...(previousPeriod?.content?.reputation_referral ?? []),
  ].find((metric) => metric.id === metricId)
}

function findPreviousFunnelStage(previousPeriod, stage) {
  return (previousPeriod?.content?.funnel ?? [])
    .find((previousStage) => (previousStage.id && previousStage.id === stage.id) || previousStage.stage_name === stage.stage_name)
}

function findPreviousChannel(previousPeriod, channel) {
  return (previousPeriod?.content?.channel_attribution ?? [])
    .find((previousChannel) => previousChannel.channel === channel.channel)
}

function createDeltaCandidate({
  currentValue,
  id,
  label,
  lowerIsBetter = false,
  previousValue,
  source,
  unit = '',
}) {
  const delta = currentValue - previousValue
  const score = lowerIsBetter ? -delta : delta
  const displayDelta = `${delta >= 0 ? '+' : ''}${Math.round(delta)}${unit}`

  return {
    body: `${label} moved from ${Math.round(previousValue)}${unit} to ${Math.round(currentValue)}${unit}.`,
    id,
    label,
    metric_delta: displayDelta,
    score,
    source,
  }
}

function createDeltaCandidates({
  channelAttribution,
  funnel,
  heroMetrics,
  previousPeriod,
}) {
  if (!previousPeriod) {
    return []
  }

  const metricCandidates = heroMetrics
    .filter((metric) => ['bookings', 'attended', 'cost-per-patient'].includes(metric.id))
    .map((metric) => {
      const previousMetric = findPreviousMetric(previousPeriod, metric.id)

      if (!previousMetric) {
        return null
      }

      return createDeltaCandidate({
        currentValue: parseMetricNumber(metric.value),
        id: `metric-${metric.id}`,
        label: metric.title,
        lowerIsBetter: metric.id === 'cost-per-patient',
        previousValue: parseMetricNumber(previousMetric.value),
        source: 'metric',
        unit: metric.id === 'cost-per-patient' ? '$' : '',
      })
    })
    .filter(Boolean)

  const funnelCandidates = funnel.map((stage) => {
    const previousStage = findPreviousFunnelStage(previousPeriod, stage)

    if (!previousStage) {
      return null
    }

    return createDeltaCandidate({
      currentValue: toNumber(stage.conversion_rate),
      id: `funnel-${stage.id}`,
      label: `${stage.stage_name} conversion`,
      previousValue: toNumber(previousStage.conversion_rate),
      source: 'funnel',
      unit: '%',
    })
  }).filter(Boolean)

  const channelCandidates = channelAttribution.flatMap((channel) => {
    const previousChannel = findPreviousChannel(previousPeriod, channel)

    if (!previousChannel) {
      return []
    }

    return [
      createDeltaCandidate({
        currentValue: toNumber(channel.bookings),
        id: `channel-${channel.channel}-bookings`,
        label: `${channel.channel} bookings`,
        previousValue: toNumber(previousChannel.bookings),
        source: 'channel',
      }),
      createDeltaCandidate({
        currentValue: toNumber(channel.cost_per_booking),
        id: `channel-${channel.channel}-cpb`,
        label: `${channel.channel} cost per booking`,
        lowerIsBetter: true,
        previousValue: toNumber(previousChannel.cost_per_booking),
        source: 'channel',
        unit: '$',
      }),
    ]
  })

  return [...metricCandidates, ...funnelCandidates, ...channelCandidates]
}

function createConsecutiveThresholdCandidates({ funnel, previousPeriod }) {
  if (!previousPeriod) {
    return []
  }

  return funnel
    .map((stage) => {
      const previousStage = findPreviousFunnelStage(previousPeriod, stage)

      if (!previousStage) {
        return null
      }

      const currentBelowTarget = toNumber(stage.conversion_rate) < toNumber(stage.target)
      const previousBelowTarget = toNumber(previousStage.conversion_rate) < toNumber(previousStage.target ?? stage.target)

      if (!currentBelowTarget || !previousBelowTarget) {
        return null
      }

      return {
        body: `${stage.stage_name} has missed target for 2 consecutive periods: ${stage.conversion_rate}% now and ${previousStage.conversion_rate}% prior, target ${stage.target}%.`,
        id: `threshold-${stage.id}`,
        label: `${stage.stage_name} below target`,
        metric_delta: `${stage.conversion_rate}% vs ${stage.target}% target`,
        score: toNumber(stage.target) - toNumber(stage.conversion_rate) + 100,
        source: 'threshold',
      }
    })
    .filter(Boolean)
}

function formatFunnelChange({ delta, previousStage, stage }) {
  const signedDelta = `${delta >= 0 ? '+' : ''}${Math.round(delta)} pts`

  return `${stage.stage_name}: ${stage.conversion_rate}% (${signedDelta} vs prior ${previousStage.conversion_rate}%)`
}

function createFunnelHighlights({ biggestLeak, funnel, previousPeriod }) {
  const comparisons = funnel
    .map((stage) => {
      const previousStage = findPreviousFunnelStage(previousPeriod, stage)

      if (!previousStage) {
        return null
      }

      return {
        delta: toNumber(stage.conversion_rate) - toNumber(previousStage.conversion_rate),
        previousStage,
        stage,
      }
    })
    .filter(Boolean)

  const bestImprovement = comparisons
    .filter((comparison) => comparison.delta > 0)
    .sort((left, right) => right.delta - left.delta)[0]
  const worstChange = comparisons
    .filter((comparison) => comparison.delta < 0)
    .sort((left, right) => left.delta - right.delta)[0]

  return {
    best_improvement: bestImprovement ? formatFunnelChange(bestImprovement) : 'No positive funnel improvement vs prior period',
    biggest_leak: `${biggestLeak.stage_name}: ${biggestLeak.conversion_rate}% vs ${biggestLeak.target}% target`,
    worst_change: worstChange ? formatFunnelChange(worstChange) : 'No negative funnel change vs prior period',
  }
}

function mapInsightItem(candidate, index, type) {
  const typeLabel = type === 'win'
    ? 'worked'
    : type === 'loss' ? "didn't work" : 'next'

  return {
    body: candidate.body,
    created_by: 'auto',
    id: `generated-${type}-${index + 1}`,
    impact_level: Math.abs(candidate.score ?? 0) >= 20 ? 'high' : 'medium',
    metric_delta: candidate.metric_delta,
    next_implication: candidate.next_implication ?? '',
    owner: candidate.owner ?? 'Agency',
    supporting_metric_id: candidate.id,
    title: candidate.title ?? `Top ${typeLabel}: ${candidate.label}`,
    type,
    why_it_matters: candidate.why_it_matters ?? 'Selected from the strongest period-over-period movement in the operating data.',
  }
}

function createBacklogNextCandidates(backlogItems, biggestLeak) {
  const normalizedBacklog = (backlogItems ?? [])
    .map((item, index) => {
      const expectedRevenueImpact = toNumber(item.expected_revenue_impact ?? item.revenue_impact)
      const effortToShip = toNumber(item.effort_to_ship ?? item.effort)
      const score = toNumber(item.priority_score, expectedRevenueImpact + effortToShip)

      return {
        body: item.body ?? item.description ?? `Prioritized by expected revenue impact ${formatCurrency(expectedRevenueImpact)} and effort score ${effortToShip}.`,
        id: item.id ?? `backlog-${index + 1}`,
        label: item.title ?? item.name ?? 'Backlog item',
        metric_delta: `Score ${Math.round(score)}`,
        next_implication: item.ghl_url ? `Tracked in GHL: ${item.ghl_url}` : 'Track alongside the campaign backlog for Matt and Mike comments.',
        owner: item.owner ?? 'Matt',
        score,
        title: item.title ?? item.name ?? 'Backlog item',
        why_it_matters: `Expected revenue impact ${formatCurrency(expectedRevenueImpact)}; effort to ship ${effortToShip}.`,
      }
    })
    .sort((left, right) => right.score - left.score)

  if (normalizedBacklog.length) {
    return normalizedBacklog
  }

  return [
    {
      body: `Address ${biggestLeak.stage_name}, currently ${biggestLeak.conversion_rate}% against a ${biggestLeak.target}% target.`,
      id: 'fallback-next-leak',
      label: `Improve ${biggestLeak.stage_name}`,
      metric_delta: `${biggestLeak.conversion_rate}% vs ${biggestLeak.target}% target`,
      owner: 'Matt',
      score: 1,
      title: `Improve ${biggestLeak.stage_name}`,
      why_it_matters: 'No backlog source was supplied, so the biggest calculated leak is the default next action.',
    },
  ]
}

function createGeneratedNarrative({
  attended,
  backlogItems,
  biggestLeak,
  bookings,
  channelAttribution,
  funnel,
  heroMetrics,
  previousPeriod,
}) {
  const deltaCandidates = createDeltaCandidates({
    channelAttribution,
    funnel,
    heroMetrics,
    previousPeriod,
  })
  const winCandidates = deltaCandidates
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
  const lossCandidates = [
    ...deltaCandidates
      .filter((candidate) => candidate.score < 0)
      .map((candidate) => ({ ...candidate, score: Math.abs(candidate.score) })),
    ...createConsecutiveThresholdCandidates({ funnel, previousPeriod }),
  ].sort((left, right) => right.score - left.score)
  const fallbackWins = [
    { body: `${bookings.length} appointments were booked from the supplied source batch.`, id: 'fallback-win-bookings', label: 'Booking volume calculated', metric_delta: `${bookings.length} bookings`, score: bookings.length, title: 'Booking volume calculated' },
    { body: `${attended.length} appointments were marked attended/completed in the period.`, id: 'fallback-win-attended', label: 'Attendance calculated', metric_delta: `${attended.length} attended`, score: attended.length, title: 'Attendance calculated' },
    { body: 'Source freshness and affected metrics were calculated from the source payload.', id: 'fallback-win-trust', label: 'Data trust attached', metric_delta: 'Freshness attached', score: 1, title: 'Data trust attached' },
  ]
  const fallbackLosses = [
    { body: `${biggestLeak.stage_name} is the biggest underperforming stage versus target.`, id: 'fallback-loss-leak', label: 'Biggest funnel leak identified', metric_delta: `${biggestLeak.conversion_rate}% vs ${biggestLeak.target}% target`, score: 1, title: 'Biggest funnel leak identified' },
    { body: 'Review unnormalized or unknown source values before publishing.', id: 'fallback-loss-source', label: 'Source hygiene needs review', metric_delta: 'Source hygiene check', score: 1, title: 'Source hygiene needs review' },
    { body: 'Confirm manual assumptions before using projected revenue in the review.', id: 'fallback-loss-revenue', label: 'Revenue projection depends on assumptions', metric_delta: 'Assumption-based revenue', score: 1, title: 'Revenue projection depends on assumptions' },
  ]

  return [
    ...(winCandidates.length ? winCandidates : fallbackWins).slice(0, 3).map((candidate, index) => mapInsightItem(candidate, index, 'win')),
    ...(lossCandidates.length ? lossCandidates : fallbackLosses).slice(0, 3).map((candidate, index) => mapInsightItem(candidate, index, 'loss')),
    ...createBacklogNextCandidates(backlogItems, biggestLeak).slice(0, 3).map((candidate, index) => mapInsightItem(candidate, index, 'next')),
  ]
}

function generateDentalGrowthReviewPeriodFromSourceBatch({
  batch,
  idGenerator,
  now,
  previousPeriod,
  viewer,
}) {
  const timestamp = now()
  const payload = batch.payload
  const appointments = payload.appointments
  const callLogs = payload.call_logs
  const capacitySlots = payload.capacity_slots
  const conversations = payload.conversations
  const emailEvents = payload.email_events
  const leads = payload.leads
  const referrals = payload.referrals
  const reviews = payload.reviews
  const smsEvents = payload.sms_events
  const trackTouches = payload.track_touches
  const bookings = getCreatedBookings(appointments, batch.period_start, batch.period_end)
  const attended = getAttendedAppointments(appointments, batch.period_start, batch.period_end)
  const confirmed = getConfirmedAppointments(appointments, batch.period_start, batch.period_end)
  const newPatients = getPatientTypeCount(bookings, 'new')
  const reactivatedPatients = getPatientTypeCount(bookings, 'reactivated')
  const recallPatients = getPatientTypeCount(bookings, 'recall')
  const marketingInvestment = payload.spend.reduce((total, spendItem) => total + toNumber(spendItem.amount ?? spendItem.spend), 0)
  const revenuePerAttended = toNumber(payload.assumptions.estimated_90_day_revenue_per_attended, 1120)
  const projectedMedian = attended.length * revenuePerAttended
  const projectedLow = projectedMedian * toNumber(payload.assumptions.revenue_p25_multiplier, 0.75)
  const projectedHigh = projectedMedian * toNumber(payload.assumptions.revenue_p75_multiplier, 1.18)
  const costPerPatient = marketingInvestment / Math.max(1, newPatients + reactivatedPatients)
  const showRate = Math.round(calculateRate(attended.length, confirmed.length || bookings.length))
  const funnel = createFunnelStages({ attended, bookings, confirmed, leads })
  const biggestLeak = getBiggestLeak(funnel)
  const dataSources = mapDataSourcesFromPayload(payload, timestamp)
  const speedToLeadMetrics = createSpeedToLeadMetrics({ conversations, leads, timestamp })
  const deliverabilityMetrics = createDeliverabilityMetrics({ emailEvents, smsEvents, timestamp })
  const frontDeskHealth = createFrontDeskHealthMetrics({ callLogs, conversations, timestamp })
  const operationsChips = createOperationsChips({
    appointments,
    assumptions: payload.assumptions,
    attended,
    confirmed,
    timestamp,
  })
  const reactivationTracks = createReactivationTrackPerformance({
    appointments: bookings,
    capacitySlots,
    spend: payload.spend,
    trackTouches,
  })
  const reputationReferral = createReputationReferralMetrics({ referrals, reviews, timestamp })
  const channelAttribution = createChannelAttribution({ appointments: bookings, leads, spend: payload.spend })
  const heroMetrics = [
    createCalculatedMetric({ confidence: 'high', formula: 'count(appointments where created_at/booked_at is inside period)', id: 'bookings', lastUpdatedAt: timestamp, source: 'Source batch appointments', status: bookings.length > 0 ? DENTAL_GROWTH_REVIEW_STATUSES.GREEN : DENTAL_GROWTH_REVIEW_STATUSES.RED, target: 'Set per clinic', title: 'Bookings This Period', tooltipDefinition: `${newPatients} new / ${reactivatedPatients} reactivated / ${recallPatients} recall`, value: bookings.length }),
    createCalculatedMetric({ confidence: 'high', formula: 'count(appointments where appointment_date is inside period and status is attended/completed)', id: 'attended', lastUpdatedAt: timestamp, source: 'Source batch appointments', status: getStatusForRate(showRate, 90, 75), target: '90% show rate', title: 'Attended Appointments', tooltipDefinition: `${showRate}% show rate`, value: attended.length }),
    createCalculatedMetric({ confidence: 'medium', formula: 'attended appointments x estimated 90-day revenue per attended patient', id: 'projected-revenue', lastUpdatedAt: timestamp, source: 'Source batch appointments + manual assumptions', status: DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: 'Projection range, not hard revenue', title: 'Projected 90-Day Revenue Range', tooltipDefinition: `Median ${formatCurrency(projectedMedian)} using ${formatCurrency(revenuePerAttended)} per attended patient.`, value: `${formatCurrency(projectedLow)}-${formatCurrency(projectedHigh)}` }),
    createCalculatedMetric({ confidence: 'medium', formula: 'sum(source spend amount)', id: 'investment', lastUpdatedAt: timestamp, source: 'Source batch spend', status: DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: 'Review against budget', title: 'Total Marketing Investment', tooltipDefinition: 'Total supplied campaign spend and manual cost allocations.', value: formatCurrency(marketingInvestment) }),
    createCalculatedMetric({ confidence: 'medium', formula: 'total marketing investment / (new patients + reactivated patients)', id: 'cost-per-patient', lastUpdatedAt: timestamp, source: 'Source batch spend + appointments', status: DENTAL_GROWTH_REVIEW_STATUSES.GREY, target: 'Set per clinic', title: 'Cost Per New/Reactivated Patient', tooltipDefinition: `${newPatients + reactivatedPatients} new/reactivated booked patients.`, value: formatCurrency(costPerPatient) }),
    createCalculatedMetric({ confidence: 'high', formula: 'funnel stage with largest gap versus target', id: 'biggest-leak', lastUpdatedAt: timestamp, source: 'Calculated funnel', status: biggestLeak.gap > 10 ? DENTAL_GROWTH_REVIEW_STATUSES.RED : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW, target: `${formatPercent(biggestLeak.target)} target`, title: 'Biggest Funnel Leak', tooltipDefinition: `${biggestLeak.stage_name}: ${biggestLeak.conversion_rate}%`, value: biggestLeak.stage_name }),
  ]

  return validateDentalGrowthReviewPeriod({
    calculated_at: timestamp,
    calculation_source_batch_id: batch.id,
    calculation_version: 'dental-growth-review-calculation-v1',
    client_id: batch.client_id,
    content: {
      channel_attribution: channelAttribution,
      decisions: [{
        context: `${biggestLeak.stage_name} is the largest calculated leak for this period.`,
        decision_due_by: batch.period_end,
        estimated_impact: 'Improves the weakest measurable stage in the operating funnel.',
        id: 'generated-decision-1',
        options: ['Approve the recommended workflow change', 'Wait for more source data'],
        owner: 'Mike',
        recommended_decision: `Decide what operational change will improve ${biggestLeak.stage_name}.`,
        risk: 'Publishing without a decision can turn the review into passive reporting.',
        status: 'pending',
        title: `Address ${biggestLeak.stage_name}`,
      }],
      funnel,
      funnel_highlights: createFunnelHighlights({ biggestLeak, funnel, previousPeriod }),
      front_desk_health: frontDeskHealth,
      heatmaps: {
        email_open_by_track: createEmailOpenHeatmap(emailEvents),
        reply_rate_by_track_touch: createReplyRateHeatmap(trackTouches),
      },
      hero_metrics: heroMetrics,
      metrics: deliverabilityMetrics,
      narrative_items: createGeneratedNarrative({
        attended,
        backlogItems: payload.backlog_items,
        biggestLeak,
        bookings,
        channelAttribution,
        funnel,
        heroMetrics,
        previousPeriod,
      }),
      operations_chips: operationsChips,
      period_context: {
        auto_summary: `${bookings.length} bookings and ${attended.length} attended appointments were calculated for this period. Biggest leak: ${biggestLeak.stage_name}.`,
        cadence_label: batch.period_type === DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY ? 'Bi-weekly review' : 'Weekly review',
        freshness_summary: getFreshnessSummary(dataSources),
        top_alert_message: biggestLeak.gap > 10 ? `${biggestLeak.stage_name} is below target and needs an operating decision.` : 'No critical funnel leak exceeded the high-risk threshold.',
        top_alert_status: biggestLeak.gap > 10 ? DENTAL_GROWTH_REVIEW_STATUSES.RED : DENTAL_GROWTH_REVIEW_STATUSES.YELLOW,
      },
      reactivation_tracks: reactivationTracks,
      reputation_referral: reputationReferral,
      speed_to_lead: speedToLeadMetrics,
    },
    created_at: timestamp,
    data_sources: dataSources,
    id: idGenerator(),
    label: batch.period_type === DENTAL_GROWTH_REVIEW_PERIOD_TYPES.BIWEEKLY ? `Bi-weekly review: ${batch.period_start}-${batch.period_end}` : `Week ending ${batch.period_end}`,
    period_end: batch.period_end,
    period_start: batch.period_start,
    period_type: batch.period_type,
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    title: 'Dental Growth Operating Review',
    updated_at: timestamp,
    updated_by: viewer.userId,
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({ id: zone.id, name: zone.name, zone_number: zone.number })),
  })
}

function getEditablePeriod({ layer, periodId, repositories, viewer }) {
  assertAdminCanPublish(viewer)

  const repository = getRepositoryForLayer(repositories, layer)
  const period = repository?.findById(periodId)

  if (!period) {
    throw new Error('Clinic reporting period was not found.')
  }

  const normalized = normalizeEditablePeriod(period, layer)
  getAdminClinicClient({
    clientId: normalized.client_id,
    repositories,
    viewer,
  })

  return normalized
}

export function updateAdminClinicReportingPublishState({
  layer,
  now = () => new Date().toISOString(),
  periodId,
  publishState,
  repositories,
  viewer,
}) {
  const period = getEditablePeriod({
    layer,
    periodId,
    repositories,
    viewer,
  })
  const timestamp = now()
  const nextPeriod = finalizePublishStatePeriod({
    layer,
    period,
    publishState,
    timestamp,
    viewer,
  })

  getRepositoryForLayer(repositories, layer).upsert(nextPeriod)

  return getPeriodSummary(nextPeriod, layer)
}

export function getAdminDentalGrowthReviewDraft({
  periodId,
  repositories,
  viewer,
}) {
  return getEditablePeriod({
    layer: DENTAL_GROWTH_REVIEW_LAYER,
    periodId,
    repositories,
    viewer,
  })
}

export function updateAdminDentalGrowthReviewDraft({
  now = () => new Date().toISOString(),
  period,
  repositories,
  viewer,
}) {
  assertAdminCanImport(viewer)

  const currentPeriod = getEditablePeriod({
    layer: DENTAL_GROWTH_REVIEW_LAYER,
    periodId: period?.id,
    repositories,
    viewer,
  })
  const timestamp = now()
  const editableContent = period?.content ?? {}
  const nextPeriod = validateDentalGrowthReviewPeriod({
    ...currentPeriod,
    ...period,
    client_id: currentPeriod.client_id,
    content: {
      ...currentPeriod.content,
      closed_loops: editableContent.closed_loops ?? currentPeriod.content.closed_loops,
      decisions: editableContent.decisions ?? currentPeriod.content.decisions,
      experiments: editableContent.experiments ?? currentPeriod.content.experiments,
      narrative_items: editableContent.narrative_items ?? currentPeriod.content.narrative_items,
      period_context: {
        ...currentPeriod.content.period_context,
        auto_summary: editableContent.period_context?.auto_summary ?? currentPeriod.content.period_context.auto_summary,
        top_alert_message: editableContent.period_context?.top_alert_message ?? currentPeriod.content.period_context.top_alert_message,
        top_alert_status: editableContent.period_context?.top_alert_status ?? currentPeriod.content.period_context.top_alert_status,
      },
      watching: editableContent.watching ?? currentPeriod.content.watching,
    },
    id: currentPeriod.id,
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    updated_at: timestamp,
    updated_by: viewer.userId,
  })

  getRepositoryForLayer(repositories, DENTAL_GROWTH_REVIEW_LAYER).upsert(nextPeriod)

  return {
    period: nextPeriod,
    summary: mapDentalGrowthReviewPeriodSummary(nextPeriod),
  }
}
