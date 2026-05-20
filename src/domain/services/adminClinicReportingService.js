import {
  DENTAL_GROWTH_REVIEW_LAYER,
  DENTAL_GROWTH_REVIEW_LAYER_META,
  DENTAL_GROWTH_REVIEW_PERIOD_TYPES,
  DENTAL_GROWTH_REVIEW_PUBLISH_STATES,
  DENTAL_GROWTH_REVIEW_STATUSES,
  DENTAL_GROWTH_REVIEW_ZONES,
  normalizeDentalGrowthReviewPeriod,
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
    throw new Error('Only agency admins can import clinic reporting records.')
  }
}

function assertAdminCanPublish(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId || !canViewerPublishClinicReporting(viewer)) {
    throw new Error('Only agency admins can publish clinic reporting records.')
  }
}

function getAdminClinicClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Clinic client was not found for this agency.')
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

function parsePayload(rawJson) {
  if (typeof rawJson !== 'string') {
    return rawJson
  }

  return JSON.parse(rawJson)
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

function mapAdminReportingPeriodSummary(period, layer) {
  return isDentalGrowthReviewLayer(layer)
    ? mapDentalGrowthReviewPeriodSummary(period)
    : mapClinicReportingPeriodSummary(period)
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

  return {
    client,
    layers: ADMIN_REPORTING_LAYERS.map((layer) => ({
      id: layer,
      ...ADMIN_REPORTING_LAYER_META[layer],
    })),
    records,
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

function createDefaultDentalGrowthReviewPeriod({
  client,
  idGenerator,
  now,
  viewer,
}) {
  const timestamp = now()
  const today = timestamp.slice(0, 10)

  return validateDentalGrowthReviewPeriod({
    client_id: client.id,
    content: {
      decisions: [
        {
          context: 'Review capacity, source confidence, and the biggest funnel leak before the next operating review.',
          decision_due_by: today,
          estimated_impact: 'Keeps the next campaign change tied to revenue, capacity, or patient acquisition impact.',
          id: 'decision-1',
          options: ['Approve recommended change', 'Defer until more data is available'],
          owner: 'Mike',
          recommended_decision: 'Choose one operating change for the next period.',
          risk: 'Leaving too many open decisions weakens accountability.',
          status: 'pending',
          title: 'Choose next operating change',
        },
      ],
      hero_metrics: [
        ['bookings', 'Bookings This Period'],
        ['attended', 'Attended Appointments'],
        ['projected-revenue', 'Projected 90-Day Revenue Range'],
        ['investment', 'Total Marketing Investment'],
        ['cost-per-patient', 'Cost Per New/Reactivated Patient'],
        ['biggest-leak', 'Biggest Funnel Leak'],
      ].map(([id, title]) => ({
        confidence: 'medium',
        delta_absolute: '0',
        delta_percent: '0%',
        formula: 'Pending admin update',
        id,
        last_updated_at: timestamp,
        prior_period_value: '0',
        source: 'Manual draft',
        status: DENTAL_GROWTH_REVIEW_STATUSES.GREY,
        target: 'Set target',
        title,
        tooltip_definition: 'Define source, formula, target, and period comparison before publishing.',
        unit: '',
        value: '0',
      })),
      narrative_items: [
        ['win-1', 'win', 'Win to confirm'],
        ['win-2', 'win', 'Win to confirm'],
        ['win-3', 'win', 'Win to confirm'],
        ['loss-1', 'loss', 'Leak to explain'],
        ['loss-2', 'loss', 'Leak to explain'],
        ['loss-3', 'loss', 'Leak to explain'],
        ['next-1', 'next', 'Next action'],
        ['next-2', 'next', 'Next action'],
        ['next-3', 'next', 'Next action'],
      ].map(([id, type, title]) => ({
        body: 'Replace this draft with metric-backed operating context.',
        created_by: 'manual',
        id,
        impact_level: 'medium',
        metric_delta: 'Pending',
        next_implication: 'Update before publishing.',
        owner: viewer.userId,
        supporting_metric_id: '',
        title,
        type,
        why_it_matters: 'Keeps the review narrative tied to a measurable change.',
      })),
      period_context: {
        auto_summary: 'Draft operating review. Add the executive summary before publishing.',
        cadence_label: 'Weekly review',
        freshness_summary: 'Draft data freshness not confirmed.',
        top_alert_message: 'Draft review is not client-visible until published.',
        top_alert_status: DENTAL_GROWTH_REVIEW_STATUSES.YELLOW,
      },
    },
    created_at: timestamp,
    data_sources: [
      {
        affected_metrics: ['Hero metrics', 'Funnel', 'Decisions'],
        freshness_note: 'Confirm source exports before publishing.',
        freshness_status: DENTAL_GROWTH_REVIEW_STATUSES.GREY,
        id: 'manual-draft',
        last_updated_at: timestamp,
        owner: viewer.userId,
        source_name: 'Manual draft',
        source_type: 'manual',
      },
    ],
    id: idGenerator(),
    label: `Week ending ${today}`,
    period_end: today,
    period_start: today,
    period_type: DENTAL_GROWTH_REVIEW_PERIOD_TYPES.WEEKLY,
    publish_state: DENTAL_GROWTH_REVIEW_PUBLISH_STATES.DRAFT,
    title: `${client.name} Dental Growth Review`,
    updated_at: timestamp,
    updated_by: viewer.userId,
    zones: DENTAL_GROWTH_REVIEW_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name,
      zone_number: zone.number,
    })),
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

export function createAdminDentalGrowthReviewDraft({
  clientId,
  idGenerator,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAdminCanImport(viewer)
  const client = getAdminClinicClient({ clientId, repositories, viewer })
  const period = createDefaultDentalGrowthReviewPeriod({
    client,
    idGenerator,
    now,
    viewer,
  })

  getRepositoryForLayer(repositories, DENTAL_GROWTH_REVIEW_LAYER).upsert(period)

  return mapDentalGrowthReviewPeriodSummary(period)
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
  const nextPeriod = validateDentalGrowthReviewPeriod({
    ...currentPeriod,
    ...period,
    client_id: currentPeriod.client_id,
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
