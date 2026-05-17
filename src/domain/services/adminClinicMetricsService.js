import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_ACQUISITION_CHANNEL_META,
  assertClinicAggregateRecord,
  normalizeCallBookingMetric,
  normalizeClinicLocation,
  normalizeClinicServiceLine,
  normalizePatientAcquisitionSnapshot,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'

const VALID_CHANNELS = new Set(Object.values(CLINIC_ACQUISITION_CHANNELS))

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
    qualified_inquiries: normalizeNumber(input.qualified_inquiries, 'Qualified inquiries'),
    service_line_id: serviceLineId,
    spend: normalizeNumber(input.spend, 'Spend'),
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
    period_end: requireText(input.period_end, 'Call booking period end'),
    period_label: requireText(input.period_label, 'Call booking period label'),
    period_start: requireText(input.period_start, 'Call booking period start'),
    service_line_id: serviceLineId,
    summary: normalizeOptionalText(input.summary),
    total_calls: normalizeNumber(input.total_calls, 'Total calls'),
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

export function getAdminClinicMetricsPage({ clientId, repositories, viewer }) {
  const client = getEditableClinicClient({ clientId, repositories, viewer })
  const foundation = getClinicFoundation({ clientId, repositories })

  return {
    acquisitionChannelMeta: CLINIC_ACQUISITION_CHANNEL_META,
    callBookingMetrics: repositories.callBookingMetrics
      .listByClientId(clientId)
      .map(normalizeCallBookingMetric)
      .sort(sortByPeriodDesc),
    client: mapClient(client),
    locations: foundation.locations,
    patientAcquisitionSnapshots: repositories.patientAcquisitionSnapshots
      .listByClientId(clientId)
      .map(normalizePatientAcquisitionSnapshot)
      .sort(sortByPeriodDesc),
    serviceLines: foundation.serviceLines,
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
  const callBookingRecords = filterMeaningfulRecords(input?.callBookingMetrics)
  const existingAcquisitionById = new Map(
    repositories.patientAcquisitionSnapshots.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingCallBookingById = new Map(
    repositories.callBookingMetrics.listByClientId(clientId).map((record) => [record.id, record]),
  )

  deleteRemovedRecords({
    clientId,
    inputRecords: acquisitionRecords,
    repository: repositories.patientAcquisitionSnapshots,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: callBookingRecords,
    repository: repositories.callBookingMetrics,
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

  return getAdminClinicMetricsPage({ clientId, repositories, viewer })
}
