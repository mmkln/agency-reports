import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_PROFILE_SPECIALTY_META,
  CLINIC_SERVICE_LINE_STATUSES,
  CLINIC_SERVICE_LINE_STATUS_META,
  assertClinicAggregateRecord,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
} from '../../entities/clinic'
import { canAccessClient } from '../policies/accessPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'

const VALID_SPECIALTIES = new Set(Object.values(CLINIC_PROFILE_SPECIALTIES))
const VALID_SERVICE_LINE_STATUSES = new Set(Object.values(CLINIC_SERVICE_LINE_STATUSES))
const VALID_CHANNELS = new Set(Object.values(CLINIC_ACQUISITION_CHANNELS))

function assertAgencyAdmin(viewer) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can manage clinic setup.')
  }
}

function getEditableClinicClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessClient(viewer, client.id)) {
    throw new Error('Clinic setup is not available for this admin.')
  }

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic setup is only available for clinic clients.')
  }

  return client
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeOptionalText(value = '') {
  return normalizeText(value)
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

function normalizeBoolean(value) {
  return typeof value === 'boolean' ? value : value !== 'false'
}

function normalizeEnum(value, validValues, fallback, fieldName) {
  const normalizedValue = value || fallback

  if (!validValues.has(normalizedValue)) {
    throw new Error(`${fieldName} is invalid.`)
  }

  return normalizedValue
}

function normalizeLocationIds(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.map(normalizeText).filter(Boolean))]
}

function sortByDisplayOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
    || left.name.localeCompare(right.name)
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

function mapProfile(profile) {
  if (!profile) {
    return {
      capacity_notes: '',
      client_id: '',
      id: '',
      insurance_model: '',
      primary_goal: '',
      specialty: CLINIC_PROFILE_SPECIALTIES.OTHER,
    }
  }

  return normalizeClinicProfile(profile)
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

function deleteRemovedRecords({ clientId, inputRecords, repository }) {
  const retainedIds = new Set(inputRecords.map((record) => record.id).filter(Boolean))

  repository.listByClientId(clientId).forEach((record) => {
    if (!retainedIds.has(record.id)) {
      repository.deleteById(record.id)
    }
  })
}

function requireIdGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function buildProfileRecord({ clientId, existingProfile, input, timestamp }) {
  assertClinicAggregateRecord(input, 'Clinic profile')

  const specialty = normalizeEnum(
    input?.specialty,
    VALID_SPECIALTIES,
    CLINIC_PROFILE_SPECIALTIES.OTHER,
    'Clinic specialty',
  )
  const record = normalizeClinicProfile({
    capacity_notes: normalizeOptionalText(input?.capacity_notes),
    client_id: clientId,
    id: existingProfile?.id ?? input?.id,
    insurance_model: normalizeOptionalText(input?.insurance_model),
    primary_goal: normalizeOptionalText(input?.primary_goal),
    specialty,
  })

  return existingProfile
    ? updateTimestamped(existingProfile, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildLocationRecord({ clientId, existingRecord, id, input, timestamp, index }) {
  assertClinicAggregateRecord(input, 'Clinic location')

  const name = normalizeText(input.name)

  if (!name) {
    throw new Error('Location name is required.')
  }

  const record = normalizeClinicLocation({
    address: normalizeOptionalText(input.address),
    city: normalizeOptionalText(input.city),
    client_id: clientId,
    display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : (index + 1) * 10,
    id,
    is_active: normalizeBoolean(input.is_active),
    name,
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildServiceLineRecord({
  clientId,
  existingRecord,
  id,
  input,
  locationIds,
  timestamp,
  index,
}) {
  assertClinicAggregateRecord(input, 'Clinic service line')

  const name = normalizeText(input.name)

  if (!name) {
    throw new Error('Service line name is required.')
  }

  const serviceLineLocationIds = normalizeLocationIds(input.location_ids)

  serviceLineLocationIds.forEach((locationId) => {
    if (!locationIds.has(locationId)) {
      throw new Error('Service line location is invalid.')
    }
  })

  const primaryChannel = normalizeOptionalText(input.primary_channel)
  const record = normalizeClinicServiceLine({
    average_value: normalizeNumber(input.average_value, 'Average appointment value'),
    capacity_note: normalizeOptionalText(input.capacity_note),
    client_id: clientId,
    display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : (index + 1) * 10,
    id,
    location_ids: serviceLineLocationIds,
    name,
    primary_channel: primaryChannel
      ? normalizeEnum(primaryChannel, VALID_CHANNELS, CLINIC_ACQUISITION_CHANNELS.OTHER, 'Primary channel')
      : null,
    status: normalizeEnum(
      input.status,
      VALID_SERVICE_LINE_STATUSES,
      CLINIC_SERVICE_LINE_STATUSES.PLANNED,
      'Service line status',
    ),
    target_monthly_bookings: normalizeNumber(input.target_monthly_bookings, 'Target monthly bookings'),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

export function getAdminClinicSetupPage({ clientId, repositories, viewer }) {
  const client = getEditableClinicClient({ clientId, repositories, viewer })
  const locations = repositories.clinicLocations
    .listByClientId(clientId)
    .map(normalizeClinicLocation)
    .sort(sortByDisplayOrder)
  const serviceLines = repositories.clinicServiceLines
    .listByClientId(clientId)
    .map(normalizeClinicServiceLine)
    .sort(sortByDisplayOrder)
  const profile = mapProfile(repositories.clinicProfiles.listByClientId(clientId)[0] ?? null)

  return {
    client: mapClient(client),
    locations,
    profile,
    serviceLineStatusMeta: CLINIC_SERVICE_LINE_STATUS_META,
    specialtyMeta: CLINIC_PROFILE_SPECIALTY_META,
    status: 'ready',
    serviceLines,
  }
}

export function saveAdminClinicSetup({
  clientId,
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  requireIdGenerator(idGenerator)

  getEditableClinicClient({ clientId, repositories, viewer })

  const timestamp = now()
  const existingProfile = repositories.clinicProfiles.listByClientId(clientId)[0] ?? null
  const profileRecord = buildProfileRecord({
    clientId,
    existingProfile,
    input: input?.profile ?? {},
    timestamp,
  })

  repositories.clinicProfiles.upsert({
    ...profileRecord,
    id: profileRecord.id || idGenerator(),
  })

  const existingLocationsById = new Map(
    repositories.clinicLocations.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const locations = (input?.locations ?? []).filter((location) => normalizeText(location.name))

  deleteRemovedRecords({
    clientId,
    inputRecords: locations,
    repository: repositories.clinicLocations,
  })

  locations.forEach((location, index) => {
    const id = location.id || idGenerator()
    repositories.clinicLocations.upsert(buildLocationRecord({
      clientId,
      existingRecord: existingLocationsById.get(id),
      id,
      index,
      input: location,
      timestamp,
    }))
  })

  const savedLocationIds = new Set(repositories.clinicLocations.listByClientId(clientId).map((location) => location.id))
  const existingServiceLinesById = new Map(
    repositories.clinicServiceLines.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const serviceLines = (input?.serviceLines ?? []).filter((serviceLine) => normalizeText(serviceLine.name))

  deleteRemovedRecords({
    clientId,
    inputRecords: serviceLines,
    repository: repositories.clinicServiceLines,
  })

  serviceLines.forEach((serviceLine, index) => {
    const id = serviceLine.id || idGenerator()
    repositories.clinicServiceLines.upsert(buildServiceLineRecord({
      clientId,
      existingRecord: existingServiceLinesById.get(id),
      id,
      index,
      input: serviceLine,
      locationIds: savedLocationIds,
      timestamp,
    }))
  })

  return getAdminClinicSetupPage({ clientId, repositories, viewer })
}
