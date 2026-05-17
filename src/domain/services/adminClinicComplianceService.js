import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_APPROVAL_STATUSES,
  CLINIC_APPROVAL_STATUS_META,
  CLINIC_APPROVAL_TYPES,
  CLINIC_APPROVAL_TYPE_META,
  CLINIC_COMPLIANCE_STATUSES,
  CLINIC_COMPLIANCE_STATUS_META,
  assertClinicAggregateRecord,
  normalizeClinicLocation,
  normalizeClinicServiceLine,
  normalizeComplianceReview,
  normalizeMedicalApproval,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'

const VALID_COMPLIANCE_STATUSES = new Set(Object.values(CLINIC_COMPLIANCE_STATUSES))
const VALID_APPROVAL_TYPES = new Set(Object.values(CLINIC_APPROVAL_TYPES))
const TERMINAL_APPROVAL_STATUSES = new Set([
  CLINIC_APPROVAL_STATUSES.APPROVED,
  CLINIC_APPROVAL_STATUSES.EXPIRED,
  CLINIC_APPROVAL_STATUSES.REJECTED,
])
const APPROVAL_TRANSITIONS = Object.freeze({
  [CLINIC_APPROVAL_STATUSES.APPROVED]: new Set([
    CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
  ]),
  [CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED]: new Set([
    CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
  ]),
  [CLINIC_APPROVAL_STATUSES.REJECTED]: new Set([
    CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
  ]),
  [CLINIC_APPROVAL_STATUSES.EXPIRED]: new Set([
    CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW,
    CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
  ]),
})

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage clinic compliance.')
  }
}

function getEditableClinicClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Clinic compliance is not available for this admin.')
  }

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic compliance is only available for clinic clients.')
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

function normalizeOptionalDate(value = '', fieldName) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return null
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function sortByDisplayOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
    || left.name.localeCompare(right.name)
}

function sortReviews(left, right) {
  return right.open_issues - left.open_issues
    || left.title.localeCompare(right.title)
}

function sortApprovals(left, right) {
  return new Date(left.due_date ?? '9999-12-31').getTime() - new Date(right.due_date ?? '9999-12-31').getTime()
    || left.title.localeCompare(right.title)
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

function filterMeaningfulReviews(records = []) {
  return records.filter((record) => (
    normalizeText(record.title)
    || normalizeText(record.platform)
    || normalizeText(record.summary)
  ))
}

function filterMeaningfulApprovals(records = []) {
  return records.filter((record) => (
    normalizeText(record.title)
    || normalizeText(record.instructions)
    || normalizeText(record.decision_comment)
  ))
}

function buildComplianceReviewRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Compliance review')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = normalizeOptionalReference(input.service_line_id)

  validateReference(locationId, foundation.locationIds, 'Compliance review location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Compliance review service line')

  const record = normalizeComplianceReview({
    blocked_items: normalizeNumber(input.blocked_items, 'Blocked items'),
    client_id: clientId,
    data_source: normalizeOptionalText(input.data_source),
    id,
    last_updated_at: timestamp,
    limited_ads: normalizeNumber(input.limited_ads, 'Limited ads'),
    location_id: locationId,
    next_action: normalizeOptionalText(input.next_action),
    open_issues: normalizeNumber(input.open_issues, 'Open issues'),
    pending_approvals: normalizeNumber(input.pending_approvals, 'Pending approvals'),
    platform: normalizeOptionalText(input.platform),
    risk_note: normalizeOptionalText(input.risk_note),
    service_line_id: serviceLineId,
    status: normalizeEnum(
      input.status,
      VALID_COMPLIANCE_STATUSES,
      CLINIC_COMPLIANCE_STATUSES.NOT_REVIEWED,
      'Compliance status',
    ),
    summary: normalizeOptionalText(input.summary),
    title: requireText(input.title, 'Compliance review title'),
  })

  return existingRecord
    ? updateTimestamped(existingRecord, record, timestamp)
    : createTimestamped(record, timestamp)
}

function buildMedicalApprovalRecord({
  clientId,
  existingRecord,
  foundation,
  id,
  input,
  timestamp,
}) {
  assertClinicAggregateRecord(input, 'Medical approval')

  const locationId = normalizeOptionalReference(input.location_id)
  const serviceLineId = normalizeOptionalReference(input.service_line_id)
  const status = existingRecord?.status ?? CLINIC_APPROVAL_STATUSES.PENDING_MEDICAL_REVIEW

  validateReference(locationId, foundation.locationIds, 'Medical approval location')
  validateReference(serviceLineId, foundation.serviceLineIds, 'Medical approval service line')

  const record = normalizeMedicalApproval({
    approval_type: normalizeEnum(
      input.approval_type,
      VALID_APPROVAL_TYPES,
      CLINIC_APPROVAL_TYPES.MEDICAL_CLAIM,
      'Approval type',
    ),
    approved_at: status === CLINIC_APPROVAL_STATUSES.APPROVED
      ? normalizeOptionalDate(input.approved_at, 'Approved at') ?? timestamp
      : normalizeOptionalDate(input.approved_at, 'Approved at'),
    approver_label: normalizeOptionalText(input.approver_label),
    changes_requested_at: status === CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED
      ? normalizeOptionalDate(input.changes_requested_at, 'Changes requested at') ?? timestamp
      : normalizeOptionalDate(input.changes_requested_at, 'Changes requested at'),
    client_id: clientId,
    decision_comment: normalizeOptionalText(input.decision_comment),
    due_date: normalizeOptionalDate(input.due_date, 'Approval due date'),
    history: Array.isArray(input.history) ? input.history : [],
    id,
    instructions: normalizeOptionalText(input.instructions),
    last_updated_at: timestamp,
    location_id: locationId,
    requested_by_label: normalizeOptionalText(input.requested_by_label),
    service_line_id: serviceLineId,
    status,
    title: requireText(input.title, 'Medical approval title'),
    version: normalizeOptionalText(input.version),
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

function getEditableMedicalApproval({ approvalId, clientId, repositories, viewer }) {
  getEditableClinicClient({ clientId, repositories, viewer })

  const approval = repositories.medicalApprovals.findById(approvalId)

  if (!approval || approval.client_id !== clientId) {
    throw new Error('Medical approval was not found.')
  }

  return normalizeMedicalApproval(approval)
}

function getActorLabel(viewer) {
  return normalizeOptionalText(viewer?.name)
    || normalizeOptionalText(viewer?.email)
    || normalizeOptionalText(viewer?.userId)
    || 'Agency admin'
}

function requireOpenApproval(approval, nextStatus) {
  if (TERMINAL_APPROVAL_STATUSES.has(approval.status)) {
    throw new Error('Medical approval decision is already final.')
  }

  if (!APPROVAL_TRANSITIONS[nextStatus]?.has(approval.status)) {
    throw new Error('Medical approval transition is not allowed.')
  }
}

function normalizeDecisionInput(input = {}, { requiresComment = false } = {}) {
  assertClinicAggregateRecord(input, 'Medical approval decision')

  const comment = normalizeOptionalText(input.comment ?? input.decision_comment)

  if (requiresComment && !comment) {
    throw new Error('Decision comment is required.')
  }

  return {
    comment,
    version: normalizeOptionalText(input.version),
  }
}

function transitionMedicalApproval({
  approvalId,
  clientId,
  input,
  nextStatus,
  now = () => new Date().toISOString(),
  repositories,
  requiresComment = false,
  viewer,
}) {
  const approval = getEditableMedicalApproval({
    approvalId,
    clientId,
    repositories,
    viewer,
  })
  const decision = normalizeDecisionInput(input, { requiresComment })
  const timestamp = now()

  requireOpenApproval(approval, nextStatus)

  const version = decision.version || approval.version
  const history = [
    ...approval.history,
    {
      actor_label: getActorLabel(viewer),
      comment: decision.comment,
      decision: nextStatus,
      decided_at: timestamp,
      version,
    },
  ]

  repositories.medicalApprovals.upsert(normalizeMedicalApproval({
    ...approval,
    approved_at: nextStatus === CLINIC_APPROVAL_STATUSES.APPROVED ? timestamp : approval.approved_at,
    changes_requested_at: nextStatus === CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED
      ? timestamp
      : approval.changes_requested_at,
    decision_comment: decision.comment,
    history,
    last_updated_at: timestamp,
    status: nextStatus,
    updated_at: timestamp,
  }))

  return getAdminClinicCompliancePage({ clientId, repositories, viewer })
}

export function getMedicalApprovalDecisionCapabilities(approval) {
  const normalizedApproval = normalizeMedicalApproval(approval)

  return {
    canApprove: APPROVAL_TRANSITIONS[CLINIC_APPROVAL_STATUSES.APPROVED].has(normalizedApproval.status),
    canExpire: APPROVAL_TRANSITIONS[CLINIC_APPROVAL_STATUSES.EXPIRED].has(normalizedApproval.status),
    canReject: APPROVAL_TRANSITIONS[CLINIC_APPROVAL_STATUSES.REJECTED].has(normalizedApproval.status),
    canRequestChanges: APPROVAL_TRANSITIONS[CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED].has(normalizedApproval.status),
    isFinal: TERMINAL_APPROVAL_STATUSES.has(normalizedApproval.status),
  }
}

export function getAdminClinicCompliancePage({ clientId, repositories, viewer }) {
  const client = getEditableClinicClient({ clientId, repositories, viewer })
  const foundation = getClinicFoundation({ clientId, repositories })

  return {
    approvalStatusMeta: CLINIC_APPROVAL_STATUS_META,
    approvalTypeMeta: CLINIC_APPROVAL_TYPE_META,
    client: mapClient(client),
    complianceReviews: repositories.complianceReviews
      .listByClientId(clientId)
      .map(normalizeComplianceReview)
      .sort(sortReviews),
    complianceStatusMeta: CLINIC_COMPLIANCE_STATUS_META,
    locations: foundation.locations,
    medicalApprovals: repositories.medicalApprovals
      .listByClientId(clientId)
      .map(normalizeMedicalApproval)
      .sort(sortApprovals),
    serviceLines: foundation.serviceLines,
    status: 'ready',
  }
}

export function saveAdminClinicCompliance({
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
  const complianceReviews = filterMeaningfulReviews(input?.complianceReviews)
  const medicalApprovals = filterMeaningfulApprovals(input?.medicalApprovals)
  const existingReviewsById = new Map(
    repositories.complianceReviews.listByClientId(clientId).map((record) => [record.id, record]),
  )
  const existingApprovalsById = new Map(
    repositories.medicalApprovals.listByClientId(clientId).map((record) => [record.id, record]),
  )

  deleteRemovedRecords({
    clientId,
    inputRecords: complianceReviews,
    repository: repositories.complianceReviews,
  })
  deleteRemovedRecords({
    clientId,
    inputRecords: medicalApprovals,
    repository: repositories.medicalApprovals,
  })

  complianceReviews.forEach((review) => {
    const id = review.id || idGenerator()

    repositories.complianceReviews.upsert(buildComplianceReviewRecord({
      clientId,
      existingRecord: existingReviewsById.get(id),
      foundation,
      id,
      input: review,
      timestamp,
    }))
  })

  medicalApprovals.forEach((approval) => {
    const id = approval.id || idGenerator()

    repositories.medicalApprovals.upsert(buildMedicalApprovalRecord({
      clientId,
      existingRecord: existingApprovalsById.get(id),
      foundation,
      id,
      input: approval,
      timestamp,
    }))
  })

  return getAdminClinicCompliancePage({ clientId, repositories, viewer })
}

export function approveMedicalApproval(args) {
  return transitionMedicalApproval({
    ...args,
    nextStatus: CLINIC_APPROVAL_STATUSES.APPROVED,
  })
}

export function requestChangesForMedicalApproval(args) {
  return transitionMedicalApproval({
    ...args,
    nextStatus: CLINIC_APPROVAL_STATUSES.CHANGES_REQUESTED,
    requiresComment: true,
  })
}

export function rejectMedicalApproval(args) {
  return transitionMedicalApproval({
    ...args,
    nextStatus: CLINIC_APPROVAL_STATUSES.REJECTED,
    requiresComment: true,
  })
}

export function expireMedicalApproval(args) {
  return transitionMedicalApproval({
    ...args,
    nextStatus: CLINIC_APPROVAL_STATUSES.EXPIRED,
  })
}
