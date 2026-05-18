import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_ACQUISITION_CHANNEL_META,
  CLINIC_CAMPAIGN_STATUS_META,
  CLINIC_CAMPAIGN_STATUSES,
  assertClinicAggregateRecord,
  CLINIC_COMPLIANCE_STATUS_META,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_RECORD_PUBLISH_STATE_META,
  CLINIC_RECORD_PUBLISH_STATES,
  normalizeBookingPipelineSnapshot,
  normalizeCallBookingMetric,
  normalizeClinicLocation,
  normalizeClinicServiceLine,
  normalizeLocationPerformance,
  normalizePatientAcquisitionSnapshot,
  normalizeServiceLinePerformance,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../../entities/needed-from-client'
import {
  assertClinicPublishReady,
  getBookingPipelinePublishReadiness,
  getCallBookingPublishReadiness,
  getLocationPerformancePublishReadiness,
  getPatientAcquisitionPublishReadiness,
  getServiceLinePerformancePublishReadiness,
} from '../policies/clinicPublishReadinessPolicy'

const VALID_CHANNELS = new Set(Object.values(CLINIC_ACQUISITION_CHANNELS))
const VALID_CAMPAIGN_STATUSES = new Set(Object.values(CLINIC_CAMPAIGN_STATUSES))
const VALID_COMPLIANCE_STATUSES = new Set(Object.values(CLINIC_COMPLIANCE_STATUSES))

const METRIC_READINESS = Object.freeze({
  booking_pipeline: getBookingPipelinePublishReadiness,
  call_booking: getCallBookingPublishReadiness,
  location_performance: getLocationPerformancePublishReadiness,
  patient_acquisition: getPatientAcquisitionPublishReadiness,
  service_line_performance: getServiceLinePerformancePublishReadiness,
})
const OPEN_NEEDED_ACTION_STATUSES = new Set([
  NEEDED_ACTION_STATUSES.ANSWERED,
  NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
  NEEDED_ACTION_STATUSES.PENDING,
])

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage clinic metrics.')
  }
}

function getEditableClinicClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Clinic metrics are not available for this admin.')
  }

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic metrics are only available for clinic clients.')
  }

  return client
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeOptionalText(value = '') {
  return normalizeText(value)
}

function normalizeOptionalReference(value = '') {
  return normalizeText(value) || null
}

function requireText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeNumber(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return 0
  }

  const numberValue = Number(normalizedValue)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} must be a positive number.`)
  }

  return numberValue
}

function normalizeEnum(value, validValues, fallback, fieldName) {
  const normalizedValue = value || fallback

  if (!validValues.has(normalizedValue)) {
    throw new Error(`${fieldName} is invalid.`)
  }

  return normalizedValue
}

function sortByDisplayOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
    || left.name.localeCompare(right.name)
}

function sortByPeriodDesc(left, right) {
  return new Date(right.period_start || 0).getTime() - new Date(left.period_start || 0).getTime()
    || left.period_label.localeCompare(right.period_label)
}

function mapClient(client) {
  return {
    id: client.id,
    name: client.name,
    portalSlug: client.portal_slug,
    primaryContactEmail: client.primary_contact_email,
    primaryContactName: client.primary_contact_name,
    status: client.status,
    type: client.type,
    typeMeta: CLIENT_TYPE_META[client.type],
    updatedAt: client.updated_at,
  }
}

function createTimestamped(record, timestamp) {
  return {
    created_at: timestamp,
    ...record,
    updated_at: timestamp,
  }
}

function updateTimestamped(existingRecord, record, timestamp) {
  return {
    ...existingRecord,
    ...record,
    updated_at: timestamp,
  }
}

function preservePublishState(existingRecord) {
  return {
    publish_state: existingRecord?.publish_state ?? CLINIC_RECORD_PUBLISH_STATES.DRAFT,
    published_at: existingRecord?.published_at ?? null,
    published_by: existingRecord?.published_by ?? null,
  }
}

function getClinicFoundation({ clientId, repositories }) {
  const locations = repositories.clinicLocations
    .listByClientId(clientId)
    .map(normalizeClinicLocation)
    .sort(sortByDisplayOrder)
  const serviceLines = repositories.clinicServiceLines
    .listByClientId(clientId)
    .map(normalizeClinicServiceLine)
    .sort(sortByDisplayOrder)

  return {
    locationIds: new Set(locations.map((location) => location.id)),
    locations,
    serviceLineIds: new Set(serviceLines.map((serviceLine) => serviceLine.id)),
    serviceLines,
  }
}

function validateReference(value, validIds, fieldName) {
  if (value && !validIds.has(value)) {
    throw new Error(`${fieldName} is invalid.`)
  }
}

function deleteRemovedRecords({ clientId, inputRecords, repository }) {
  const retainedIds = new Set(inputRecords.map((record) => record.id).filter(Boolean))

  repository.listByClientId(clientId).forEach((record) => {
    if (!retainedIds.has(record.id)) {
      repository.deleteById(record.id)
    }
  })
}

function filterMeaningfulRecords(records = []) {
  return records.filter((record) => (
    normalizeText(record.period_label)
    || normalizeText(record.period_start)
    || normalizeText(record.period_end)
    || normalizeText(record.summary)
  ))
}

function buildPatientAcquisitionRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Patient acquisition snapshot')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = normalizeOptionalReference(input.service_line_id)

  validateReference(locationId, foundation.locationIds, 'Patient acquisition location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Patient acquisition service line')

  const record = normalizePatientAcquisitionSnapshot({
    attended_appointments: normalizeNumber(input.attended_appointments, 'Attended appointments'),
    booked_appointments: normalizeNumber(input.booked_appointments, 'Booked appointments'),
    campaign_name: normalizeOptionalText(input.campaign_name),
    calls: normalizeNumber(input.calls, 'Calls'),
    channel: normalizeEnum(
      input.channel,
      VALID_CHANNELS,
      CLINIC_ACQUISITION_CHANNELS.OTHER,
      'Patient acquisition channel',
    ),
    chats: normalizeNumber(input.chats, 'Chats'),
    clicks: normalizeNumber(input.clicks, 'Clicks'),
    client_id: clientId,
    data_source: normalizeOptionalText(input.data_source),
    forms: normalizeNumber(input.forms, 'Forms'),
    id,
    impressions: normalizeNumber(input.impressions, 'Impressions'),
    insight: normalizeOptionalText(input.insight),
    landing_page_visits: normalizeNumber(input.landing_page_visits, 'Landing page visits'),
    last_updated_at: timestamp,
    location_id: locationId,
    period_end: requireText(input.period_end, 'Patient acquisition period end'),
    period_label: requireText(input.period_label, 'Patient acquisition period label'),
    period_start: requireText(input.period_start, 'Patient acquisition period start'),
    ...preservePublishState(existingRecord),
    qualified_inquiries: normalizeNumber(input.qualified_inquiries, 'Qualified inquiries'),
    service_line_id: serviceLineId,
    spend: normalizeNumber(input.spend, 'Spend'),
    summary: normalizeOptionalText(input.summary),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildBookingPipelineSnapshotRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Booking pipeline snapshot')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = normalizeOptionalReference(input.service_line_id)

  validateReference(locationId, foundation.locationIds, 'Booking pipeline location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Booking pipeline service line')

  const record = normalizeBookingPipelineSnapshot({
    attended_appointments: normalizeNumber(input.attended_appointments, 'Attended appointments'),
    booked_appointments: normalizeNumber(input.booked_appointments, 'Booked appointments'),
    campaign_name: normalizeOptionalText(input.campaign_name),
    calls: normalizeNumber(input.calls, 'Calls'),
    chats: normalizeNumber(input.chats, 'Chats'),
    clicks: normalizeNumber(input.clicks, 'Clicks'),
    client_id: clientId,
    data_source: normalizeOptionalText(input.data_source),
    forms: normalizeNumber(input.forms, 'Forms'),
    id,
    impressions: normalizeNumber(input.impressions, 'Impressions'),
    insight: normalizeOptionalText(input.insight),
    landing_page_visits: normalizeNumber(input.landing_page_visits, 'Landing page visits'),
    last_updated_at: timestamp,
    location_id: locationId,
    missed_calls: normalizeNumber(input.missed_calls, 'Missed calls'),
    no_response_leads: normalizeNumber(input.no_response_leads, 'No-response leads'),
    period_end: requireText(input.period_end, 'Booking pipeline period end'),
    period_label: requireText(input.period_label, 'Booking pipeline period label'),
    period_start: requireText(input.period_start, 'Booking pipeline period start'),
    ...preservePublishState(existingRecord),
    qualified_inquiries: normalizeNumber(input.qualified_inquiries, 'Qualified inquiries'),
    service_line_id: serviceLineId,
    summary: normalizeOptionalText(input.summary),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildCallBookingMetricRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Call booking metric')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = normalizeOptionalReference(input.service_line_id)

  validateReference(locationId, foundation.locationIds, 'Call booking location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Call booking service line')

  const record = normalizeCallBookingMetric({
    answered_calls: normalizeNumber(input.answered_calls, 'Answered calls'),
    average_response_seconds: normalizeNumber(input.average_response_seconds, 'Average response seconds'),
    booked_from_calls: normalizeNumber(input.booked_from_calls, 'Booked from calls'),
    campaign_name: normalizeOptionalText(input.campaign_name),
    client_id: clientId,
    data_source: normalizeOptionalText(input.data_source),
    first_time_calls: normalizeNumber(input.first_time_calls, 'First-time caller calls'),
    follow_up_needed_count: normalizeNumber(input.follow_up_needed_count, 'Follow-up needed count'),
    form_leads: normalizeNumber(input.form_leads, 'Form leads'),
    id,
    insight: normalizeOptionalText(input.insight),
    last_updated_at: timestamp,
    location_id: locationId,
    missed_calls: normalizeNumber(input.missed_calls, 'Missed calls'),
    no_response_leads: normalizeNumber(input.no_response_leads, 'No-response leads'),
    not_booked_reasons: Array.isArray(input.not_booked_reasons) ? input.not_booked_reasons : [],
    peak_call_times: Array.isArray(input.peak_call_times) ? input.peak_call_times : [],
    period_end: requireText(input.period_end, 'Call booking period end'),
    period_label: requireText(input.period_label, 'Call booking period label'),
    period_start: requireText(input.period_start, 'Call booking period start'),
    ...preservePublishState(existingRecord),
    service_line_id: serviceLineId,
    summary: normalizeOptionalText(input.summary),
    total_calls: normalizeNumber(input.total_calls, 'Total calls'),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function isOpenNeededAction(action) {
  return OPEN_NEEDED_ACTION_STATUSES.has(action?.status)
}

function createBookingActionKey(metricId, suggestionType) {
  return `${metricId}:${suggestionType}`
}

function getOpenBookingActionsBySuggestionKey({ clientId, repositories }) {
  const actions = repositories.neededFromClient?.listByClientId?.(clientId) ?? []

  return new Map(
    actions
      .filter((action) => isOpenNeededAction(action))
      .filter((action) => action.related_call_booking_metric_id && action.clinic_action_type)
      .map((action) => [
        createBookingActionKey(action.related_call_booking_metric_id, action.clinic_action_type),
        action,
      ]),
  )
}

function createBookingActionSuggestion({
  actionType,
  label,
  metric,
  openBookingActionsBySuggestionKey,
}) {
  const openAction = openBookingActionsBySuggestionKey.get(createBookingActionKey(metric.id, actionType))

  return {
    actionLabel: label,
    defaultActionType: actionType === CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT
      ? NEEDED_ACTION_TYPES.APPROVAL
      : NEEDED_ACTION_TYPES.DECISION,
    hasOpenAction: Boolean(openAction),
    openAction: openAction
      ? {
          id: openAction.id,
          status: openAction.status,
          title: openAction.title,
        }
      : null,
    type: actionType,
  }
}

function getCallBookingActionSuggestions({ metric, openBookingActionsBySuggestionKey }) {
  const suggestions = []

  if (metric.missed_calls > 0) {
    suggestions.push(createBookingActionSuggestion({
      actionType: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
      label: 'Create missed-call action',
      metric,
      openBookingActionsBySuggestionKey,
    }))
  }

  if (metric.average_response_seconds >= 120) {
    suggestions.push(createBookingActionSuggestion({
      actionType: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
      label: 'Create call script action',
      metric,
      openBookingActionsBySuggestionKey,
    }))
  }

  if (metric.no_response_leads + metric.follow_up_needed_count > 0) {
    suggestions.push(createBookingActionSuggestion({
      actionType: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
      label: 'Create follow-up action',
      metric,
      openBookingActionsBySuggestionKey,
    }))
  }

  return suggestions
}

function buildServiceLinePerformanceRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Service line performance')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = requireText(input.service_line_id, 'Service line performance service line')

  validateReference(locationId, foundation.locationIds, 'Service line performance location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Service line performance service line')

  const record = normalizeServiceLinePerformance({
    ad_approval_status: normalizeOptionalText(input.ad_approval_status),
    booked_appointments: normalizeNumber(input.booked_appointments, 'Booked appointments'),
    campaign_name: normalizeOptionalText(input.campaign_name),
    campaign_status: normalizeEnum(
      input.campaign_status,
      VALID_CAMPAIGN_STATUSES,
      CLINIC_CAMPAIGN_STATUSES.PLANNED,
      'Campaign status',
    ),
    capacity_note: normalizeOptionalText(input.capacity_note),
    client_id: clientId,
    compliance_status: normalizeEnum(
      input.compliance_status,
      VALID_COMPLIANCE_STATUSES,
      CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      'Service line compliance status',
    ),
    cost_per_booked_appointment: normalizeNumber(
      input.cost_per_booked_appointment,
      'Cost per booked appointment',
    ),
    cost_per_inquiry: normalizeNumber(input.cost_per_inquiry, 'Cost per inquiry'),
    data_source: normalizeOptionalText(input.data_source),
    id,
    inquiries: normalizeNumber(input.inquiries, 'Inquiries'),
    insight: normalizeOptionalText(input.insight),
    landing_page_status: normalizeOptionalText(input.landing_page_status),
    last_updated_at: timestamp,
    location_id: locationId,
    period_end: requireText(input.period_end, 'Service line performance period end'),
    period_label: requireText(input.period_label, 'Service line performance period label'),
    period_start: requireText(input.period_start, 'Service line performance period start'),
    ...preservePublishState(existingRecord),
    service_line_id: serviceLineId,
    spend: normalizeNumber(input.spend, 'Spend'),
    summary: normalizeOptionalText(input.summary),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildLocationPerformanceRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Location performance')

  const locationId = requireText(input.location_id, 'Location performance location')

  validateReference(locationId, foundation.locationIds, 'Location performance location')

  const record = normalizeLocationPerformance({
    answered_calls: normalizeNumber(input.answered_calls, 'Answered calls'),
    booked_appointments: normalizeNumber(input.booked_appointments, 'Booked appointments'),
    client_id: clientId,
    compliance_status: normalizeEnum(
      input.compliance_status,
      VALID_COMPLIANCE_STATUSES,
      CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      'Location compliance status',
    ),
    cost_per_booked_appointment: normalizeNumber(
      input.cost_per_booked_appointment,
      'Cost per booked appointment',
    ),
    data_source: normalizeOptionalText(input.data_source),
    google_rating: normalizeNumber(input.google_rating, 'Google rating'),
    id,
    inquiries: normalizeNumber(input.inquiries, 'Inquiries'),
    insight: normalizeOptionalText(input.insight),
    last_updated_at: timestamp,
    location_id: locationId,
    missed_calls: normalizeNumber(input.missed_calls, 'Missed calls'),
    period_end: requireText(input.period_end, 'Location performance period end'),
    period_label: requireText(input.period_label, 'Location performance period label'),
    period_start: requireText(input.period_start, 'Location performance period start'),
    ...preservePublishState(existingRecord),
    review_count: normalizeNumber(input.review_count, 'Review count'),
    reviews_gained: normalizeNumber(input.reviews_gained, 'Reviews gained'),
    spend: normalizeNumber(input.spend, 'Spend'),
    summary: normalizeOptionalText(input.summary),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}


function requireIdGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function publishClinicMetricRecord({
  clientId,
  id,
  normalize,
  now = () => new Date().toISOString(),
  readiness,
  repository,
  repositories,
  viewer,
}) {
  getEditableClinicClient({ clientId, repositories, viewer })

  const existingRecord = repository.findById(id)

  if (!existingRecord || existingRecord.client_id !== clientId) {
    throw new Error('Clinic metric record was not found.')
  }

  const timestamp = now()
  const normalizedRecord = normalize(existingRecord)
  assertClinicPublishReady(readiness(normalizedRecord))

  repository.upsert(normalize({
    ...normalizedRecord,
    publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
    published_at: normalizedRecord.published_at ?? timestamp,
    published_by: normalizedRecord.published_by ?? viewer.userId ?? null,
    updated_at: timestamp,
  }))

  return getAdminClinicMetricsPage({ clientId, repositories, viewer })
}

export function getAdminClinicMetricsPage({ clientId, repositories, viewer }) {
  const client = getEditableClinicClient({ clientId, repositories, viewer })
  const foundation = getClinicFoundation({ clientId, repositories })
  const openBookingActionsBySuggestionKey = getOpenBookingActionsBySuggestionKey({
    clientId,
    repositories,
  })

  return {
    acquisitionChannelMeta: CLINIC_ACQUISITION_CHANNEL_META,
    bookingPipelineSnapshots: repositories.bookingPipelineSnapshots
      .listByClientId(clientId)
      .map(normalizeBookingPipelineSnapshot)
      .map((record) => ({
        ...record,
        publish_readiness: getBookingPipelinePublishReadiness(record),
      }))
      .sort(sortByPeriodDesc),
    callBookingMetrics: repositories.callBookingMetrics
      .listByClientId(clientId)
      .map(normalizeCallBookingMetric)
      .map((record) => ({
        ...record,
        booking_action_suggestions: getCallBookingActionSuggestions({
          metric: record,
          openBookingActionsBySuggestionKey,
        }),
        publish_readiness: getCallBookingPublishReadiness(record),
      }))
      .sort(sortByPeriodDesc),
    campaignStatusMeta: CLINIC_CAMPAIGN_STATUS_META,
    client: mapClient(client),
    complianceStatusMeta: CLINIC_COMPLIANCE_STATUS_META,
    locationPerformance: repositories.locationPerformance
      .listByClientId(clientId)
      .map(normalizeLocationPerformance)
      .map((record) => ({
        ...record,
        publish_readiness: getLocationPerformancePublishReadiness(record),
      }))
      .sort(sortByPeriodDesc),
    locations: foundation.locations,
    patientAcquisitionSnapshots: repositories.patientAcquisitionSnapshots
      .listByClientId(clientId)
      .map(normalizePatientAcquisitionSnapshot)
      .map((record) => ({
        ...record,
        publish_readiness: getPatientAcquisitionPublishReadiness(record),
      }))
      .sort(sortByPeriodDesc),
    publishStateMeta: CLINIC_RECORD_PUBLISH_STATE_META,
    serviceLines: foundation.serviceLines,
    serviceLinePerformance: repositories.serviceLinePerformance
      .listByClientId(clientId)
      .map(normalizeServiceLinePerformance)
      .map((record) => ({
        ...record,
        publish_readiness: getServiceLinePerformancePublishReadiness(record),
      }))
      .sort(sortByPeriodDesc),
    status: 'ready',
  }
}

export function saveAdminClinicMetrics({
  clientId,
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireIdGenerator(idGenerator)
  getEditableClinicClient({ clientId, repositories, viewer })

  const foundation = getClinicFoundation({ clientId, repositories })
  const timestamp = now()
  const acquisitionRecords = filterMeaningfulRecords(input?.patientAcquisitionSnapshots)
  const bookingPipelineRecords = filterMeaningfulRecords(input?.bookingPipelineSnapshots)
  const callBookingRecords = filterMeaningfulRecords(input?.callBookingMetrics)
  const locationPerformanceRecords = filterMeaningfulRecords(input?.locationPerformance)
  const serviceLinePerformanceRecords = filterMeaningfulRecords(input?.serviceLinePerformance)
  const existingAcquisitionById = new Map(
    repositories.patientAcquisitionSnapshots.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingBookingPipelineById = new Map(
    repositories.bookingPipelineSnapshots.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingCallBookingById = new Map(
    repositories.callBookingMetrics.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingLocationPerformanceById = new Map(
    repositories.locationPerformance.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingServiceLinePerformanceById = new Map(
    repositories.serviceLinePerformance.listByClientId(clientId).map((record) => [record.id, record]),
  )

  deleteRemovedRecords({
    clientId,
    inputRecords: acquisitionRecords,
    repository: repositories.patientAcquisitionSnapshots,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: bookingPipelineRecords,
    repository: repositories.bookingPipelineSnapshots,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: callBookingRecords,
    repository: repositories.callBookingMetrics,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: locationPerformanceRecords,
    repository: repositories.locationPerformance,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: serviceLinePerformanceRecords,
    repository: repositories.serviceLinePerformance,
  })

  acquisitionRecords.forEach((record) => {
    const id = record.id || idGenerator()

    repositories.patientAcquisitionSnapshots.upsert(buildPatientAcquisitionRecord({
      clientId,
      existingRecord: existingAcquisitionById.get(id),
      foundation,
      id,
      input: record,
      timestamp,
    }))
  })

  bookingPipelineRecords.forEach((record) => {
    const id = record.id || idGenerator()

    repositories.bookingPipelineSnapshots.upsert(buildBookingPipelineSnapshotRecord({
      clientId,
      existingRecord: existingBookingPipelineById.get(id),
      foundation,
      id,
      input: record,
      timestamp,
    }))
  })

  callBookingRecords.forEach((record) => {
    const id = record.id || idGenerator()

    repositories.callBookingMetrics.upsert(buildCallBookingMetricRecord({
      clientId,
      existingRecord: existingCallBookingById.get(id),
      foundation,
      id,
      input: record,
      timestamp,
    }))
  })

  locationPerformanceRecords.forEach((record) => {
    const id = record.id || idGenerator()

    repositories.locationPerformance.upsert(buildLocationPerformanceRecord({
      clientId,
      existingRecord: existingLocationPerformanceById.get(id),
      foundation,
      id,
      input: record,
      timestamp,
    }))
  })

  serviceLinePerformanceRecords.forEach((record) => {
    const id = record.id || idGenerator()

    repositories.serviceLinePerformance.upsert(buildServiceLinePerformanceRecord({
      clientId,
      existingRecord: existingServiceLinePerformanceById.get(id),
      foundation,
      id,
      input: record,
      timestamp,
    }))
  })

  return getAdminClinicMetricsPage({ clientId, repositories, viewer })
}

export function publishPatientAcquisitionSnapshot(args) {
  return publishClinicMetricRecord({
    ...args,
    id: args.snapshotId ?? args.id,
    normalize: normalizePatientAcquisitionSnapshot,
    readiness: METRIC_READINESS.patient_acquisition,
    repository: args.repositories.patientAcquisitionSnapshots,
  })
}

export function publishBookingPipelineSnapshot(args) {
  return publishClinicMetricRecord({
    ...args,
    id: args.snapshotId ?? args.id,
    normalize: normalizeBookingPipelineSnapshot,
    readiness: METRIC_READINESS.booking_pipeline,
    repository: args.repositories.bookingPipelineSnapshots,
  })
}

export function publishCallBookingMetric(args) {
  return publishClinicMetricRecord({
    ...args,
    id: args.metricId ?? args.id,
    normalize: normalizeCallBookingMetric,
    readiness: METRIC_READINESS.call_booking,
    repository: args.repositories.callBookingMetrics,
  })
}

export function publishLocationPerformance(args) {
  return publishClinicMetricRecord({
    ...args,
    id: args.performanceId ?? args.id,
    normalize: normalizeLocationPerformance,
    readiness: METRIC_READINESS.location_performance,
    repository: args.repositories.locationPerformance,
  })
}

export function publishServiceLinePerformance(args) {
  return publishClinicMetricRecord({
    ...args,
    id: args.performanceId ?? args.id,
    normalize: normalizeServiceLinePerformance,
    readiness: METRIC_READINESS.service_line_performance,
    repository: args.repositories.serviceLinePerformance,
  })
}
