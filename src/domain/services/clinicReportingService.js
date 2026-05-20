import { CLIENT_TYPES } from '../../entities/client'
import {
  assertNoPatientLevelFields,
  canViewerAccessClinicReportingLayer,
  canViewerAccessOperationalRows,
  CLINIC_REPORTING_LAYERS,
  CLINIC_REPORTING_LAYER_META,
  CLINIC_REPORTING_PUBLISH_STATES,
  CLINIC_REPORTING_PUBLISH_STATE_META,
  isClientFacingClinicReportingLayer,
  isClientRole,
  normalizeClinicReportingPeriod,
} from '../../entities/clinic-reporting'
import { canAccessClient } from '../policies/accessPolicy'

const LAYER_REPOSITORY_KEYS = Object.freeze({
  [CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS]: 'clinicDailyOperations',
  [CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE]: 'clinicExecutivePerformancePeriods',
  [CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY]: 'clinicMonthlyStrategyPeriods',
  [CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR]: 'clinicWeeklyOperatorPeriods',
})

function getRepositoryForLayer(repositories, layer) {
  return repositories[LAYER_REPOSITORY_KEYS[layer]]
}

function sortByPeriodDesc(left, right) {
  return new Date(right.period_end || 0).getTime() - new Date(left.period_end || 0).getTime()
    || String(left.title).localeCompare(String(right.title))
}

function isVisiblePublishedRecord(record) {
  return [
    CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
    CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED,
  ].includes(record.publish_state)
}

function getClinicClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.type !== CLIENT_TYPES.CLINIC || !canAccessClient(viewer, clientId)) {
    return null
  }

  if (viewer?.agencyId && client.agency_id !== viewer.agencyId) {
    return null
  }

  return client
}

function redactDailyOperationalRows(period) {
  return {
    ...period,
    content: {
      ...period.content,
      call_queue: [],
      callback_queue: [],
      reply_queue: [],
    },
  }
}

function mapPeriodForViewer(period, { viewer }) {
  const normalized = normalizeClinicReportingPeriod(period)

  if (
    normalized.layer === CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS
    && !canViewerAccessOperationalRows(viewer)
  ) {
    return redactDailyOperationalRows(normalized)
  }

  return normalized
}

function getClinicReportingPage({
  clientId,
  layer,
  periodId,
  repositories,
  source = 'published',
  viewer,
}) {
  const client = getClinicClient({ clientId, repositories, viewer })

  if (!client || !canViewerAccessClinicReportingLayer(viewer, layer)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const repository = getRepositoryForLayer(repositories, layer)
  const canReadDrafts = source === 'draft' && !isClientRole(viewer?.role)
  const records = (repository?.listByClientId(clientId) ?? [])
    .map((record) => normalizeClinicReportingPeriod(record, layer))
    .filter((record) => record.layer === layer)
    .filter((record) => canReadDrafts || isVisiblePublishedRecord(record))
    .sort(sortByPeriodDesc)
  const selectedRecord = periodId
    ? records.find((record) => record.id === periodId) ?? null
    : records[0] ?? null
  const operationalRowsVisible = layer === CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS
    ? canViewerAccessOperationalRows(viewer)
    : false

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      type: client.type,
    },
    layer,
    layerMeta: CLINIC_REPORTING_LAYER_META[layer],
    operationalRowsVisible,
    period: selectedRecord ? mapPeriodForViewer(selectedRecord, { viewer }) : null,
    periods: records.map((record) => mapPeriodForViewer(record, { viewer })),
    reason: periodId && !selectedRecord ? 'period_not_found' : null,
    source: canReadDrafts ? 'draft' : 'published',
    status: 'ready',
  }
}

export function getClinicDailyOperationsPage(input) {
  return getClinicReportingPage({
    ...input,
    layer: CLINIC_REPORTING_LAYERS.DAILY_OPERATIONS,
  })
}

export function getClinicWeeklyOperatorPage(input) {
  return getClinicReportingPage({
    ...input,
    layer: CLINIC_REPORTING_LAYERS.WEEKLY_OPERATOR,
  })
}

export function getClinicExecutivePerformancePage(input) {
  return getClinicReportingPage({
    ...input,
    layer: CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE,
  })
}

export function getClinicMonthlyStrategyPage(input) {
  return getClinicReportingPage({
    ...input,
    layer: CLINIC_REPORTING_LAYERS.MONTHLY_STRATEGY,
  })
}

export function assertClientFacingClinicReportingPayload(record, layer) {
  if (isClientFacingClinicReportingLayer(layer)) {
    assertNoPatientLevelFields(record, CLINIC_REPORTING_LAYER_META[layer]?.label ?? 'Clinic reporting')
  }
}

export function mapClinicReportingPeriodSummary(period) {
  const normalized = normalizeClinicReportingPeriod(period)

  return {
    clientId: normalized.client_id,
    id: normalized.id,
    layer: normalized.layer,
    layerMeta: CLINIC_REPORTING_LAYER_META[normalized.layer],
    periodEnd: normalized.period_end,
    periodLabel: normalized.period_label,
    periodStart: normalized.period_start,
    publishState: normalized.publish_state,
    publishStateMeta: CLINIC_REPORTING_PUBLISH_STATE_META[normalized.publish_state],
    sourceTrust: normalized.source_trust,
    title: normalized.title,
  }
}
