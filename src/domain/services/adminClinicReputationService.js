import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  assertClinicAggregateRecord,
  CLINIC_RECORD_PUBLISH_STATE_META,
  CLINIC_RECORD_PUBLISH_STATES,
  normalizeClinicLocation,
  normalizeReputationSnapshot,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage clinic reputation.')
  }
}

function getEditableClinicClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Clinic reputation is not available for this admin.')
  }

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic reputation is only available for clinic clients.')
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

function normalizeGoogleRating(value) {
  const rating = normalizeNumber(value, 'Google rating')

  if (rating > 5) {
    throw new Error('Google rating must be between 0 and 5.')
  }

  return rating
}

function normalizePercent(value, fieldName) {
  const percent = normalizeNumber(value, fieldName)

  if (percent > 100) {
    throw new Error(`${fieldName} must be between 0 and 100.`)
  }

  return percent
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

function getLocations({ clientId, repositories }) {
  return repositories.clinicLocations
    .listByClientId(clientId)
    .map(normalizeClinicLocation)
    .sort(sortByDisplayOrder)
}

function validateLocation(value, validLocationIds) {
  if (value && !validLocationIds.has(value)) {
    throw new Error('Reputation location is invalid.')
  }
}

function filterMeaningfulRecords(records = []) {
  return records.filter((record) => (
    normalizeText(record.period_label)
    || normalizeText(record.period_start)
    || normalizeText(record.period_end)
    || normalizeText(record.summary)
  ))
}

function deleteRemovedRecords({ clientId, inputRecords, repository }) {
  const retainedIds = new Set(inputRecords.map((record) => record.id).filter(Boolean))

  repository.listByClientId(clientId).forEach((record) => {
    if (!retainedIds.has(record.id)) {
      repository.deleteById(record.id)
    }
  })
}

function buildReputationSnapshotRecord({
  clientId,
  existingRecord,
  id,
  input,
  timestamp,
  validLocationIds,
}) {
  assertClinicAggregateRecord(input, 'Reputation snapshot')

  const locationId = normalizeOptionalReference(input.location_id)

  validateLocation(locationId, validLocationIds)

  const record = normalizeReputationSnapshot({
    client_id: clientId,
    data_source: normalizeOptionalText(input.data_source),
    gbp_updates: normalizeNumber(input.gbp_updates, 'Google Business Profile updates'),
    google_rating: normalizeGoogleRating(input.google_rating),
    id,
    insight: normalizeOptionalText(input.insight),
    last_updated_at: timestamp,
    local_visibility_note: normalizeOptionalText(input.local_visibility_note),
    location_id: locationId,
    negative_reviews: normalizeNumber(input.negative_reviews, 'Negative reviews'),
    period_end: requireText(input.period_end, 'Reputation period end'),
    period_label: requireText(input.period_label, 'Reputation period label'),
    period_start: requireText(input.period_start, 'Reputation period start'),
    provider_profile_completeness: normalizePercent(
      input.provider_profile_completeness,
      'Provider profile completeness',
    ),
    ...preservePublishState(existingRecord),
    review_count: normalizeNumber(input.review_count, 'Review count'),
    review_request_sent: normalizeNumber(input.review_request_sent, 'Review requests sent'),
    review_response_drafts: normalizeNumber(input.review_response_drafts, 'Review response drafts'),
    reviews_gained: normalizeNumber(input.reviews_gained, 'Reviews gained'),
    summary: normalizeOptionalText(input.summary),
    unanswered_reviews: normalizeNumber(input.unanswered_reviews, 'Unanswered reviews'),
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

function publishReputationRecord({
  clientId,
  id,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  getEditableClinicClient({ clientId, repositories, viewer })

  const existingRecord = repositories.reputationSnapshots.findById(id)

  if (!existingRecord || existingRecord.client_id !== clientId) {
    throw new Error('Reputation snapshot was not found.')
  }

  const timestamp = now()
  const normalizedRecord = normalizeReputationSnapshot(existingRecord)

  repositories.reputationSnapshots.upsert(normalizeReputationSnapshot({
    ...normalizedRecord,
    publish_state: CLINIC_RECORD_PUBLISH_STATES.PUBLISHED,
    published_at: normalizedRecord.published_at ?? timestamp,
    published_by: normalizedRecord.published_by ?? viewer.userId ?? null,
    updated_at: timestamp,
  }))

  return getAdminClinicReputationPage({ clientId, repositories, viewer })
}

export function getAdminClinicReputationPage({ clientId, repositories, viewer }) {
  const client = getEditableClinicClient({ clientId, repositories, viewer })
  const locations = getLocations({ clientId, repositories })

  return {
    client: mapClient(client),
    locations,
    publishStateMeta: CLINIC_RECORD_PUBLISH_STATE_META,
    reputationSnapshots: repositories.reputationSnapshots
      .listByClientId(clientId)
      .map(normalizeReputationSnapshot)
      .sort(sortByPeriodDesc),
    status: 'ready',
  }
}

export function saveAdminClinicReputation({
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
  const locations = getLocations({ clientId, repositories })
  const validLocationIds = new Set(locations.map((location) => location.id))
  const snapshots = filterMeaningfulRecords(input?.reputationSnapshots)
  const existingSnapshotsById = new Map(
    repositories.reputationSnapshots.listByClientId(clientId).map((record) => [record.id, record]),
  )

  deleteRemovedRecords({
    clientId,
    inputRecords: snapshots,
    repository: repositories.reputationSnapshots,
  })

  snapshots.forEach((snapshot) => {
    const id = snapshot.id || idGenerator()

    repositories.reputationSnapshots.upsert(buildReputationSnapshotRecord({
      clientId,
      existingRecord: existingSnapshotsById.get(id),
      id,
      input: snapshot,
      timestamp,
      validLocationIds,
    }))
  })

  return getAdminClinicReputationPage({ clientId, repositories, viewer })
}

export function publishReputationSnapshot(args) {
  return publishReputationRecord({
    ...args,
    id: args.snapshotId ?? args.id,
  })
}
