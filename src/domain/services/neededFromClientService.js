import {
  CLINIC_RECORD_PUBLISH_STATES,
  normalizeCallBookingMetric,
  normalizeComplianceReview,
  normalizeMedicalApproval,
  normalizeReputationSnapshot,
} from '../../entities/clinic'
import {
  CLIENT_TYPES,
} from '../../entities/client'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_STATUS_META,
  NEEDED_ACTION_TYPES,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import { TASK_STATUSES } from '../../entities/task'
import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from './activityTrackingService'
import { canAccessClient } from '../policies/accessPolicy'
import {
  canAgencyProcessNeededAction,
  canClientRespondToNeededAction,
} from '../policies/neededActionPolicy'
import {
  hasAgencyAdminMembership,
  hasWorkspaceMembership,
} from '../policies/routeAccessPolicy'
import { isNeededActionVisibleToClient } from '../policies/visibilityPolicy'

const VALID_NEEDED_ACTION_STATUSES = new Set(Object.values(NEEDED_ACTION_STATUSES))
const VALID_NEEDED_ACTION_PRIORITIES = new Set(Object.values(NEEDED_ACTION_PRIORITIES))
const VALID_NEEDED_ACTION_TYPES = new Set(Object.values(NEEDED_ACTION_TYPES))
const VALID_CLINIC_BOOKING_SUGGESTION_TYPES = new Set([
  CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
  CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
  CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
])
const VALID_CLINIC_REPUTATION_SUGGESTION_TYPES = new Set([
  CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
  CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
])
const VALID_CLINIC_COMPLIANCE_SUGGESTION_TYPES = new Set([
  CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
  CLINIC_NEEDED_ACTION_TYPES.APPROVE_LANDING_PAGE,
  CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM,
  CLINIC_NEEDED_ACTION_TYPES.CONFIRM_SERVICE_PRICING,
  CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING,
  CLINIC_NEEDED_ACTION_TYPES.SEND_DOCTOR_BIO,
])
const VALID_CLIENT_RESPONSE_STATUSES = new Set([
  NEEDED_ACTION_STATUSES.ANSWERED,
  NEEDED_ACTION_STATUSES.APPROVED,
  NEEDED_ACTION_STATUSES.CHANGES_REQUESTED,
])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function recordNeededActionActivity({
  action,
  activityIdGenerator,
  eventType,
  now,
  repositories,
  viewer,
}) {
  if (!activityIdGenerator || !repositories.activityEvents) {
    return null
  }

  return recordActivityEvent({
    clientId: action.client_id,
    eventType,
    idGenerator: activityIdGenerator,
    metadata: {
      actionId: action.id,
      relatedTaskId: action.related_task_id,
      relatedWorkItemId: action.related_work_item_id,
      status: action.status,
      title: action.title,
      type: action.type,
    },
    now,
    repositories,
    viewer,
  })
}

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function getAction({ actionId, repositories, viewer }) {
  const action = repositories.neededFromClient.findById(actionId)

  if (!action || !canAccessClient(viewer, action.client_id)) {
    throw new Error('Needed action was not found.')
  }

  return action
}

function getViewerActorRole(viewer) {
  return viewer?.agencyMemberships?.[0]?.role
    ?? viewer?.workspaceMemberships?.[0]?.role
    ?? null
}

function createHistoryEvent({ metadata = {}, now, type, viewer }) {
  return {
    created_at: now(),
    created_by: viewer?.userId ?? null,
    metadata: {
      actor_role: getViewerActorRole(viewer),
      ...metadata,
    },
    type,
  }
}

function appendHistory(action, event) {
  return [
    ...(Array.isArray(action.response_history) ? action.response_history : []),
    event,
  ]
}

function assertAgencyAdmin(viewer) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can process needed actions.')
  }
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function createNeededActionId(idGenerator) {
  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Needed action id must be a string uuid.')
  }

  return id
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeOptionalDate(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function normalizeOptionalUrl(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol.')
    }
  } catch {
    throw new Error(`${fieldName} must be a valid http(s) URL.`)
  }

  return normalizedValue
}

function getAdminClients({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  return repositories.workspaces
    .list()
    .filter((client) => canAccessClient(viewer, client.id))
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = getAdminClients({ repositories, viewer })
    .find((item) => item.id === clientId)

  if (!client) {
    throw new Error('Client is not available for requests.')
  }

  return client
}

function getNeededActionStatusMeta(status) {
  return VALID_NEEDED_ACTION_STATUSES.has(status) ? status : NEEDED_ACTION_STATUSES.PENDING
}

function normalizePriority(priority) {
  return VALID_NEEDED_ACTION_PRIORITIES.has(priority) ? priority : NEEDED_ACTION_PRIORITIES.MEDIUM
}

function normalizeType(type) {
  return VALID_NEEDED_ACTION_TYPES.has(type) ? type : NEEDED_ACTION_TYPES.OTHER
}

function normalizeOptionalId(value = '') {
  const normalizedValue = normalizeText(value)
  return normalizedValue || null
}

function normalizeEditableActionFields(input = {}) {
  const ownerName = normalizeText(input.ownerName ?? input.owner_name)

  return {
    agency_owner: normalizeText(input.agencyOwner ?? input.agency_owner ?? ownerName),
    client_owner: normalizeText(input.clientOwner ?? input.client_owner),
    description: normalizeText(input.description),
    due_date: normalizeOptionalDate(input.dueDate, 'Request due date'),
    impact_if_delayed: normalizeText(input.impactIfDelayed ?? input.impact_if_delayed),
    internal_notes: normalizeText(input.internalNotes),
    clinic_action_type: normalizeText(input.clinicActionType ?? input.clinic_action_type) || null,
    compliance_risk: normalizeText(input.complianceRisk ?? input.compliance_risk),
    last_reminded_at: input.lastRemindedAt ?? input.last_reminded_at ?? null,
    owner_name: ownerName,
    priority: normalizePriority(input.priority),
    related_link: normalizeOptionalUrl(input.relatedLink, 'Request related link'),
    related_call_booking_metric_id: normalizeOptionalId(
      input.relatedCallBookingMetricId ?? input.related_call_booking_metric_id,
    ),
    related_campaign_name: normalizeText(input.relatedCampaignName ?? input.related_campaign_name),
    related_compliance_review_id: normalizeOptionalId(
      input.relatedComplianceReviewId ?? input.related_compliance_review_id,
    ),
    related_location_id: normalizeOptionalId(input.relatedLocationId ?? input.related_location_id),
    related_medical_approval_id: normalizeOptionalId(input.relatedMedicalApprovalId ?? input.related_medical_approval_id),
    related_reputation_snapshot_id: normalizeOptionalId(
      input.relatedReputationSnapshotId ?? input.related_reputation_snapshot_id,
    ),
    related_request_id: normalizeOptionalId(input.relatedRequestId ?? input.related_request_id),
    related_service_line_id: normalizeOptionalId(input.relatedServiceLineId ?? input.related_service_line_id),
    related_task_id: normalizeOptionalId(input.relatedTaskId ?? input.related_task_id),
    related_work_item_id: normalizeOptionalId(input.relatedWorkItemId ?? input.related_work_item_id),
    patient_impact: normalizeText(input.patientImpact ?? input.patient_impact),
    title: requireText(input.title, 'Request title'),
    type: normalizeType(input.type),
    why_needed: normalizeText(input.whyNeeded ?? input.why_needed),
  }
}

function mapNeededAction({ action, client }) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    agencyOwner: normalizedAction.agency_owner,
    cancellationNote: normalizedAction.cancellation_note ?? '',
    cancelledAt: normalizedAction.cancelled_at,
    clientId: normalizedAction.client_id,
    clientName: client?.name ?? 'Unknown client',
    clientOwner: normalizedAction.client_owner,
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    impactIfDelayed: normalizedAction.impact_if_delayed,
    internalNotes: normalizedAction.internal_notes,
    clinicActionType: normalizedAction.clinic_action_type,
    complianceRisk: normalizedAction.compliance_risk,
    lastRemindedAt: normalizedAction.last_reminded_at,
    ownerName: normalizedAction.owner_name,
    priority: normalizedAction.priority,
    relatedLink: normalizedAction.related_link,
    relatedCallBookingMetricId: normalizedAction.related_call_booking_metric_id,
    relatedCampaignName: normalizedAction.related_campaign_name,
    relatedComplianceReviewId: normalizedAction.related_compliance_review_id,
    relatedLocationId: normalizedAction.related_location_id,
    relatedMedicalApprovalId: normalizedAction.related_medical_approval_id,
    relatedReputationSnapshotId: normalizedAction.related_reputation_snapshot_id,
    relatedRequestId: normalizedAction.related_request_id,
    relatedServiceLineId: normalizedAction.related_service_line_id,
    relatedTaskId: normalizedAction.related_task_id,
    relatedWorkItemId: normalizedAction.related_work_item_id,
    respondedAt: normalizedAction.client_responded_at,
    respondedBy: normalizedAction.client_responded_by,
    resolutionNote: normalizedAction.resolution_note ?? '',
    resolvedAt: normalizedAction.resolved_at,
    resolvedBy: normalizedAction.resolved_by,
    responseHistory: normalizedAction.response_history,
    status: getNeededActionStatusMeta(normalizedAction.status),
    patientImpact: normalizedAction.patient_impact,
    title: normalizedAction.title,
    type: normalizedAction.type,
    updatedAt: normalizedAction.updated_at,
    whyNeeded: normalizedAction.why_needed,
  }
}

function mapClientNeededAction(action) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    clientOwner: normalizedAction.client_owner,
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    impactIfDelayed: normalizedAction.impact_if_delayed,
    clinicActionType: normalizedAction.clinic_action_type,
    complianceRisk: normalizedAction.compliance_risk,
    priority: normalizedAction.priority,
    priorityMeta: NEEDED_ACTION_PRIORITY_META[normalizedAction.priority],
    relatedLink: normalizedAction.related_link,
    relatedCallBookingMetricId: normalizedAction.related_call_booking_metric_id,
    relatedCampaignName: normalizedAction.related_campaign_name,
    relatedComplianceReviewId: normalizedAction.related_compliance_review_id,
    relatedLocationId: normalizedAction.related_location_id,
    relatedMedicalApprovalId: normalizedAction.related_medical_approval_id,
    relatedReputationSnapshotId: normalizedAction.related_reputation_snapshot_id,
    relatedRequestId: normalizedAction.related_request_id,
    relatedServiceLineId: normalizedAction.related_service_line_id,
    relatedTaskId: normalizedAction.related_task_id,
    relatedWorkItemId: normalizedAction.related_work_item_id,
    respondedAt: normalizedAction.client_responded_at,
    responseHistory: normalizedAction.response_history,
    status: normalizedAction.status,
    statusMeta: NEEDED_ACTION_STATUS_META[normalizedAction.status],
    patientImpact: normalizedAction.patient_impact,
    title: normalizedAction.title,
    type: normalizedAction.type,
    updatedAt: normalizedAction.updated_at,
    whyNeeded: normalizedAction.why_needed,
  }
}

function matchesFilter(value, filterValue) {
  return !filterValue || filterValue === 'all' || value === filterValue
}

function getAdminTask({ repositories, taskId, viewer }) {
  assertAgencyAdmin(viewer)

  const task = repositories.tasks?.findById(taskId)

  if (!task) {
    throw new Error('Source task was not found.')
  }

  getAdminClient({
    clientId: task.client_id,
    repositories,
    viewer,
  })

  return task
}

function getAdminWorkItem({ repositories, viewer, workItemId }) {
  assertAgencyAdmin(viewer)

  const workItem = repositories.clientWorkItems?.findById(workItemId)

  if (!workItem) {
    throw new Error('Client work item was not found.')
  }

  getAdminClient({
    clientId: workItem.client_id,
    repositories,
    viewer,
  })

  return workItem
}

function isOpenNeededAction(action) {
  return ![
    NEEDED_ACTION_STATUSES.CANCELLED,
    NEEDED_ACTION_STATUSES.RESOLVED,
  ].includes(action.status)
}

function getAdminCallBookingMetric({ callBookingMetricId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const metric = repositories.callBookingMetrics?.findById?.(callBookingMetricId)

  if (!metric) {
    throw new Error('Clinic booking metric was not found.')
  }

  const normalizedMetric = normalizeCallBookingMetric(metric)
  const client = getAdminClient({
    clientId: normalizedMetric.client_id,
    repositories,
    viewer,
  })

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic booking suggestions are only available for clinic clients.')
  }

  if (normalizedMetric.publish_state !== CLINIC_RECORD_PUBLISH_STATES.PUBLISHED) {
    throw new Error('Clinic booking suggestions can only be created from published metrics.')
  }

  return normalizedMetric
}

function getAdminReputationSnapshot({ repositories, reputationSnapshotId, viewer }) {
  assertAgencyAdmin(viewer)

  const snapshot = repositories.reputationSnapshots?.findById?.(reputationSnapshotId)

  if (!snapshot) {
    throw new Error('Clinic reputation snapshot was not found.')
  }

  const normalizedSnapshot = normalizeReputationSnapshot(snapshot)
  const client = getAdminClient({
    clientId: normalizedSnapshot.client_id,
    repositories,
    viewer,
  })

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic reputation suggestions are only available for clinic clients.')
  }

  if (normalizedSnapshot.publish_state !== CLINIC_RECORD_PUBLISH_STATES.PUBLISHED) {
    throw new Error('Clinic reputation suggestions can only be created from published snapshots.')
  }

  return normalizedSnapshot
}

function getAdminComplianceReview({ complianceReviewId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const review = repositories.complianceReviews?.findById?.(complianceReviewId)

  if (!review) {
    throw new Error('Clinic compliance review was not found.')
  }

  const normalizedReview = normalizeComplianceReview(review)
  const client = getAdminClient({
    clientId: normalizedReview.client_id,
    repositories,
    viewer,
  })

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic compliance suggestions are only available for clinic clients.')
  }

  if (normalizedReview.publish_state !== CLINIC_RECORD_PUBLISH_STATES.PUBLISHED) {
    throw new Error('Clinic compliance suggestions can only be created from published reviews.')
  }

  return normalizedReview
}

function getAdminMedicalApproval({ medicalApprovalId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const approval = repositories.medicalApprovals?.findById?.(medicalApprovalId)

  if (!approval) {
    throw new Error('Clinic medical approval was not found.')
  }

  const normalizedApproval = normalizeMedicalApproval(approval)
  const client = getAdminClient({
    clientId: normalizedApproval.client_id,
    repositories,
    viewer,
  })

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic medical approval suggestions are only available for clinic clients.')
  }

  if (normalizedApproval.publish_state !== CLINIC_RECORD_PUBLISH_STATES.PUBLISHED) {
    throw new Error('Clinic medical approval suggestions can only be created from published approvals.')
  }

  return normalizedApproval
}

function getClinicBookingSuggestionDefaults({ metric, suggestionType }) {
  const periodLabel = metric.period_label || 'the selected period'

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP) {
    const missedRate = metric.total_calls > 0 ? metric.missed_calls / metric.total_calls : 0

    return {
      complianceRisk: 'Do not send patient names, phone numbers, call recordings, or patient-level attribution through the portal.',
      description: 'Confirm who calls back missed patient inquiries, how quickly same-day follow-up happens, and how follow-up is tracked.',
      impactIfDelayed: 'New patient demand may continue leaking after marketing generates calls.',
      patientImpact: 'Missed calls can become lost booked appointments.',
      priority: missedRate >= 0.15 ? NEEDED_ACTION_PRIORITIES.HIGH : NEEDED_ACTION_PRIORITIES.MEDIUM,
      title: 'Fix missed-call follow-up',
      type: NEEDED_ACTION_TYPES.DECISION,
      whyNeeded: `${metric.missed_calls} tracked calls were missed in ${periodLabel}.`,
    }
  }

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT) {
    return {
      complianceRisk: 'Call guidance should avoid unsupported medical claims and should not include patient-level examples in the portal.',
      description: 'Approve the front-desk call handling script or coverage plan for high-intent patient inquiries.',
      impactIfDelayed: 'Slow or inconsistent call handling can reduce booking conversion from active campaigns.',
      patientImpact: 'Clearer call handling helps patients understand the next step and book faster.',
      priority: metric.average_response_seconds >= 180
        ? NEEDED_ACTION_PRIORITIES.HIGH
        : NEEDED_ACTION_PRIORITIES.MEDIUM,
      title: 'Approve call handling script',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      whyNeeded: `Average response time was ${Math.round(metric.average_response_seconds)} seconds in ${periodLabel}.`,
    }
  }

  return {
    complianceRisk: 'Keep appointment availability and follow-up notes aggregate-only; do not include patient names or appointment details.',
    description: 'Confirm who owns follow-up, when unresolved inquiries are escalated, and whether the clinic has appointment availability for campaign demand.',
    impactIfDelayed: 'Unanswered forms and delayed follow-up can waste acquisition spend and reduce booked appointments.',
    patientImpact: 'Patients may not book if the clinic does not respond quickly or if appointment availability is unclear.',
    priority: (metric.no_response_leads + metric.follow_up_needed_count) >= 5
      ? NEEDED_ACTION_PRIORITIES.HIGH
      : NEEDED_ACTION_PRIORITIES.MEDIUM,
    title: 'Confirm follow-up owner and appointment availability',
    type: NEEDED_ACTION_TYPES.DECISION,
    whyNeeded: `${metric.no_response_leads} form leads had no response and ${metric.follow_up_needed_count} inquiries still needed follow-up in ${periodLabel}.`,
  }
}

function assertNoOpenClinicBookingSuggestionDuplicate({ metric, repositories, suggestionType }) {
  const duplicate = repositories.neededFromClient
    .listByClientId(metric.client_id)
    .some((action) => isOpenNeededAction(action)
      && action.clinic_action_type === suggestionType
      && action.related_call_booking_metric_id === metric.id)

  if (duplicate) {
    throw new Error('An open clinic booking action already exists for this suggestion.')
  }
}

function getClinicReputationSuggestionDefaults({ snapshot, suggestionType }) {
  const periodLabel = snapshot.period_label || 'the selected period'

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW) {
    return {
      complianceRisk: 'Do not include reviewer names, patient names, appointment details, or medical context in the portal response workflow.',
      description: 'Confirm who should respond to negative or unanswered reviews and what tone or escalation rule should be used.',
      impactIfDelayed: 'Unanswered negative reviews can weaken local trust and reduce new patient conversion.',
      patientImpact: 'Patients may avoid booking if reputation concerns appear unresolved.',
      priority: snapshot.negative_reviews > 0
        ? NEEDED_ACTION_PRIORITIES.HIGH
        : NEEDED_ACTION_PRIORITIES.MEDIUM,
      title: 'Respond to negative or unanswered reviews',
      type: NEEDED_ACTION_TYPES.FEEDBACK,
      whyNeeded: `${snapshot.negative_reviews} negative reviews and ${snapshot.unanswered_reviews} unanswered reviews were tracked in ${periodLabel}.`,
    }
  }

  return {
    complianceRisk: 'Review responses must stay general, avoid confirming patient status, and avoid unsupported medical claims.',
    description: 'Approve the prepared review response drafts before they are published on public profiles.',
    impactIfDelayed: 'Response drafts may stay unpublished, leaving review follow-up visibly incomplete.',
    patientImpact: 'Clear, compliant responses help prospective patients see that the clinic handles concerns responsibly.',
    priority: snapshot.review_response_drafts >= 3
      ? NEEDED_ACTION_PRIORITIES.HIGH
      : NEEDED_ACTION_PRIORITIES.MEDIUM,
    title: 'Approve review response drafts',
    type: NEEDED_ACTION_TYPES.APPROVAL,
    whyNeeded: `${snapshot.review_response_drafts} review response drafts are waiting for approval from ${periodLabel}.`,
  }
}

function assertNoOpenClinicReputationSuggestionDuplicate({ repositories, snapshot, suggestionType }) {
  const duplicate = repositories.neededFromClient
    .listByClientId(snapshot.client_id)
    .some((action) => isOpenNeededAction(action)
      && action.clinic_action_type === suggestionType
      && action.related_reputation_snapshot_id === snapshot.id)

  if (duplicate) {
    throw new Error('An open clinic reputation action already exists for this suggestion.')
  }
}

function getClinicComplianceSuggestionDefaults({ review, suggestionType }) {
  const areaLabel = review.platform || review.title || 'the compliance review'
  const openIssueCount = review.open_issues + review.blocked_items + review.limited_ads

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING) {
    return {
      complianceRisk: 'Tracking and privacy changes must avoid sending patient-level health data or PHI into analytics/ad platforms.',
      description: 'Confirm the privacy/tracking setup, consent language, and whether the current configuration is approved for clinic marketing.',
      impactIfDelayed: 'Campaign tracking or retargeting may remain paused or limited until privacy risk is resolved.',
      patientImpact: 'Safer tracking keeps patient privacy protected while preserving aggregate reporting.',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      title: 'Confirm privacy and tracking setup',
      type: NEEDED_ACTION_TYPES.DECISION,
      whyNeeded: `${areaLabel} has ${openIssueCount} open, blocked, or limited compliance items.`,
    }
  }

  return {
    complianceRisk: 'Do not include patient examples, unsupported treatment claims, or patient identifiers in the portal workflow.',
    description: 'Review the compliance issue, confirm what can be published, and provide the safest approved direction.',
    impactIfDelayed: 'Ads, landing pages, or clinic growth campaigns may remain limited until the compliance issue is resolved.',
    patientImpact: 'Clear compliant messaging helps prospective patients understand services without misleading claims.',
    priority: review.blocked_items > 0 || review.open_issues >= 2
      ? NEEDED_ACTION_PRIORITIES.HIGH
      : NEEDED_ACTION_PRIORITIES.MEDIUM,
    title: 'Resolve compliance review issue',
    type: NEEDED_ACTION_TYPES.DECISION,
    whyNeeded: `${areaLabel} has ${openIssueCount} open, blocked, or limited compliance items.`,
  }
}

function getClinicMedicalApprovalSuggestionDefaults({ approval, suggestionType }) {
  const dueText = approval.due_date ? ` by ${approval.due_date}` : ''
  const base = {
    complianceRisk: 'The approval response must avoid patient identifiers and should only approve portal-ready claim, copy, pricing, or policy language.',
    description: approval.instructions || 'Review the pending medical approval and approve, request changes, or reject it with a portal-ready comment.',
    impactIfDelayed: 'Campaigns, landing pages, or medical claims may stay blocked until the clinic approves the item.',
    patientImpact: 'Approved, accurate information helps patients understand the service and next step.',
    priority: approval.due_date ? NEEDED_ACTION_PRIORITIES.HIGH : NEEDED_ACTION_PRIORITIES.MEDIUM,
    title: approval.title ? `Approve: ${approval.title}` : 'Approve medical content',
    type: NEEDED_ACTION_TYPES.APPROVAL,
    whyNeeded: `Approval is pending${dueText}.`,
  }

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING) {
    return {
      ...base,
      description: approval.instructions || 'Approve the privacy, consent, or tracking language before it is used.',
      title: approval.title ? `Approve privacy/tracking: ${approval.title}` : 'Approve privacy and tracking setup',
    }
  }

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.CONFIRM_SERVICE_PRICING) {
    return {
      ...base,
      title: approval.title ? `Confirm pricing: ${approval.title}` : 'Confirm treatment pricing',
    }
  }

  if (suggestionType === CLINIC_NEEDED_ACTION_TYPES.SEND_DOCTOR_BIO) {
    return {
      ...base,
      title: approval.title ? `Approve provider content: ${approval.title}` : 'Approve provider content',
    }
  }

  return base
}

function assertNoOpenClinicComplianceSuggestionDuplicate({
  complianceReviewId,
  medicalApprovalId,
  repositories,
  suggestionType,
  clientId,
}) {
  const duplicate = repositories.neededFromClient
    .listByClientId(clientId)
    .some((action) => isOpenNeededAction(action)
      && action.clinic_action_type === suggestionType
      && (!complianceReviewId || action.related_compliance_review_id === complianceReviewId)
      && (!medicalApprovalId || action.related_medical_approval_id === medicalApprovalId))

  if (duplicate) {
    throw new Error('An open clinic compliance action already exists for this suggestion.')
  }
}

export function listNeededActionsWorkspace({
  filters = {},
  repositories,
  viewer,
}) {
  const clients = getAdminClients({ repositories, viewer })
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const clientIds = new Set(clients.map((client) => client.id))
  const actions = repositories.neededFromClient
    .list()
    .filter((action) => clientIds.has(action.client_id))
    .filter((action) => matchesFilter(action.client_id, filters.clientId))
    .filter((action) => matchesFilter(action.status, filters.status))
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
        [NEEDED_ACTION_STATUSES.CANCELLED]: 3,
      }

      return (priority[a.status] ?? 4) - (priority[b.status] ?? 4)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map((action) => mapNeededAction({
      action,
      client: clientsById.get(action.client_id),
    }))

  return {
    actions,
    clients,
    filters: {
      clientId: filters.clientId ?? 'all',
      status: filters.status ?? 'all',
    },
    status: 'ready',
  }
}

export function listClientNeededActions({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.activeWorkspaceId)

  if (!normalizedClientId || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const client = repositories.workspaces.findById(normalizedClientId)

  if (!client) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const actions = repositories.neededFromClient
    .listByClientId(normalizedClientId)
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
      }

      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map(mapClientNeededAction)

  return {
    actions,
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      type: client.type,
    },
    status: 'ready',
  }
}

export function createNeededAction({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const client = getAdminClient({
    clientId: normalizeText(input.clientId),
    repositories,
    viewer,
  })
  const title = normalizeText(input.title)

  if (!title) {
    throw new Error('Request title is required.')
  }

  const timestamp = now()
  const actionId = createNeededActionId(idGenerator)
  const action = {
    client_id: client.id,
    created_at: timestamp,
    id: actionId,
    ...normalizeEditableActionFields({
      ...input,
      title,
    }),
    response_history: [
      createHistoryEvent({
        metadata: {
          title,
        },
        now,
        type: 'admin_created',
        viewer,
      }),
    ],
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(action)
  recordNeededActionActivity({
    action,
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_CREATED,
    now,
    repositories,
    viewer,
  })

  return action
}

export function createNeededActionFromTask({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  const task = getAdminTask({ repositories, taskId, viewer })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, input, {
      clientId: task.client_id,
      description: input.description ?? task.client_safe_summary ?? task.blocker_note ?? `Please respond to unblock ${task.title}.`,
      dueDate: input.dueDate ?? task.due_date ?? '',
      impactIfDelayed: input.impactIfDelayed ?? task.blocker_note ?? '',
      priority: input.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
      relatedTaskId: task.id,
      title: input.title ?? `Action needed: ${task.title}`,
      type: input.type ?? NEEDED_ACTION_TYPES.OTHER,
      whyNeeded: input.whyNeeded ?? task.client_safe_summary ?? task.blocker_note ?? '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromWorkItem({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, input, {
      clientId: workItem.client_id,
      description: input.description ?? workItem.summary ?? `Please respond to unblock ${workItem.title}.`,
      dueDate: input.dueDate ?? workItem.target_date ?? '',
      impactIfDelayed: input.impactIfDelayed ?? '',
      priority: input.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
      relatedTaskId: input.relatedTaskId ?? workItem.source_task_id ?? '',
      relatedWorkItemId: workItem.id,
      title: input.title ?? `Action needed: ${workItem.title}`,
      type: input.type ?? NEEDED_ACTION_TYPES.OTHER,
      whyNeeded: input.whyNeeded ?? workItem.summary ?? '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromClinicBookingSuggestion({
  activityIdGenerator,
  callBookingMetricId,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  suggestionType,
  viewer,
}) {
  if (!VALID_CLINIC_BOOKING_SUGGESTION_TYPES.has(suggestionType)) {
    throw new Error('Clinic booking suggestion type is invalid.')
  }

  const metric = getAdminCallBookingMetric({
    callBookingMetricId,
    repositories,
    viewer,
  })

  assertNoOpenClinicBookingSuggestionDuplicate({
    metric,
    repositories,
    suggestionType,
  })

  const defaults = getClinicBookingSuggestionDefaults({
    metric,
    suggestionType,
  })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, defaults, input, {
      clientId: metric.client_id,
      clinicActionType: suggestionType,
      relatedCallBookingMetricId: metric.id,
      relatedCampaignName: metric.campaign_name,
      relatedLocationId: metric.location_id,
      relatedServiceLineId: metric.service_line_id,
      relatedTaskId: '',
      relatedWorkItemId: '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromClinicReputationSuggestion({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  reputationSnapshotId,
  suggestionType,
  viewer,
}) {
  if (!VALID_CLINIC_REPUTATION_SUGGESTION_TYPES.has(suggestionType)) {
    throw new Error('Clinic reputation suggestion type is invalid.')
  }

  const snapshot = getAdminReputationSnapshot({
    repositories,
    reputationSnapshotId,
    viewer,
  })

  assertNoOpenClinicReputationSuggestionDuplicate({
    repositories,
    snapshot,
    suggestionType,
  })

  const defaults = getClinicReputationSuggestionDefaults({
    snapshot,
    suggestionType,
  })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, defaults, input, {
      clientId: snapshot.client_id,
      clinicActionType: suggestionType,
      relatedLocationId: snapshot.location_id,
      relatedReputationSnapshotId: snapshot.id,
      relatedTaskId: '',
      relatedWorkItemId: '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromClinicComplianceSuggestion({
  activityIdGenerator,
  complianceReviewId,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  suggestionType,
  viewer,
}) {
  if (!VALID_CLINIC_COMPLIANCE_SUGGESTION_TYPES.has(suggestionType)) {
    throw new Error('Clinic compliance suggestion type is invalid.')
  }

  const review = getAdminComplianceReview({
    complianceReviewId,
    repositories,
    viewer,
  })

  assertNoOpenClinicComplianceSuggestionDuplicate({
    clientId: review.client_id,
    complianceReviewId: review.id,
    repositories,
    suggestionType,
  })

  const defaults = getClinicComplianceSuggestionDefaults({
    review,
    suggestionType,
  })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, defaults, input, {
      clientId: review.client_id,
      clinicActionType: suggestionType,
      relatedCampaignName: review.platform,
      relatedComplianceReviewId: review.id,
      relatedLocationId: review.location_id,
      relatedServiceLineId: review.service_line_id,
      relatedTaskId: '',
      relatedWorkItemId: '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromClinicMedicalApprovalSuggestion({
  activityIdGenerator,
  idGenerator,
  input = {},
  medicalApprovalId,
  now = () => new Date().toISOString(),
  repositories,
  suggestionType,
  viewer,
}) {
  if (!VALID_CLINIC_COMPLIANCE_SUGGESTION_TYPES.has(suggestionType)) {
    throw new Error('Clinic medical approval suggestion type is invalid.')
  }

  const approval = getAdminMedicalApproval({
    medicalApprovalId,
    repositories,
    viewer,
  })

  assertNoOpenClinicComplianceSuggestionDuplicate({
    clientId: approval.client_id,
    medicalApprovalId: approval.id,
    repositories,
    suggestionType,
  })

  const defaults = getClinicMedicalApprovalSuggestionDefaults({
    approval,
    suggestionType,
  })

  return createNeededAction({
    activityIdGenerator,
    idGenerator,
    input: Object.assign({}, defaults, input, {
      clientId: approval.client_id,
      clinicActionType: suggestionType,
      relatedLocationId: approval.location_id,
      relatedMedicalApprovalId: approval.id,
      relatedServiceLineId: approval.service_line_id,
      relatedTaskId: '',
      relatedWorkItemId: '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function updateNeededAction({
  actionId,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  const timestamp = now()
  const updatedAction = {
    ...action,
    ...normalizeEditableActionFields(input),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        fields: [
          'title',
          'description',
          'due_date',
          'related_link',
          'related_task_id',
          'related_work_item_id',
          'priority',
          'owner_name',
          'internal_notes',
        ],
      },
      now,
      type: 'admin_updated',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function linkNeededActionToTask({
  actionId,
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })
  const task = getAdminTask({ repositories, taskId, viewer })

  if (action.client_id !== task.client_id) {
    throw new Error('Source task is not available for this request.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    related_task_id: task.id,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        related_task_id: task.id,
      },
      now,
      type: 'admin_linked_task',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function linkNeededActionToWorkItem({
  actionId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })

  if (action.client_id !== workItem.client_id) {
    throw new Error('Client work item is not available for this request.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    related_work_item_id: workItem.id,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        related_work_item_id: workItem.id,
      },
      now,
      type: 'admin_linked_work_item',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function listOpenNeededActionsForWorkItem({
  repositories,
  viewer,
  workItemId,
}) {
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })
  const client = repositories.workspaces.findById(workItem.client_id)
  const actions = repositories.neededFromClient
    .listByClientId(workItem.client_id)
    .filter((action) => action.related_work_item_id === workItem.id)
    .filter(isOpenNeededAction)
    .map((action) => mapNeededAction({ action, client }))

  return {
    actions,
    status: 'ready',
  }
}

export function listWaitingClientTasksWithoutRequests({
  clientId = '',
  repositories,
  viewer,
}) {
  const clients = getAdminClients({ repositories, viewer })
    .filter((client) => !clientId || client.id === clientId)
  const clientIds = new Set(clients.map((client) => client.id))
  const openRequestTaskIds = new Set(
    repositories.neededFromClient
      .list()
      .filter((action) => clientIds.has(action.client_id))
      .filter(isOpenNeededAction)
      .map((action) => action.related_task_id)
      .filter(Boolean),
  )
  const openRequestWorkItemIds = new Set(
    repositories.neededFromClient
      .list()
      .filter((action) => clientIds.has(action.client_id))
      .filter(isOpenNeededAction)
      .map((action) => action.related_work_item_id)
      .filter(Boolean),
  )
  const linkedWorkItemsByTaskId = new Map()

  for (const workItem of repositories.clientWorkItems?.list?.() ?? []) {
    if (!clientIds.has(workItem.client_id) || !workItem.source_task_id) {
      continue
    }

    const taskWorkItems = linkedWorkItemsByTaskId.get(workItem.source_task_id) ?? []
    taskWorkItems.push(workItem)
    linkedWorkItemsByTaskId.set(workItem.source_task_id, taskWorkItems)
  }

  const tasks = repositories.tasks
    .list()
    .filter((task) => clientIds.has(task.client_id))
    .filter((task) => task.status === TASK_STATUSES.WAITING_CLIENT)
    .filter((task) => {
      if (openRequestTaskIds.has(task.id)) {
        return false
      }

      return !(linkedWorkItemsByTaskId.get(task.id) ?? [])
        .some((workItem) => openRequestWorkItemIds.has(workItem.id))
    })

  return {
    status: 'ready',
    tasks,
  }
}

export function answerNeededAction({
  activityIdGenerator,
  actionId,
  message = '',
  now = () => new Date().toISOString(),
  repositories,
  responseStatus = NEEDED_ACTION_STATUSES.ANSWERED,
  viewer,
}) {
  const action = getAction({ actionId, repositories, viewer })

  if (!hasWorkspaceMembership(viewer)) {
    throw new Error('Only client users can respond to needed actions.')
  }

  if (!canClientRespondToNeededAction({ action, viewer })) {
    throw new Error('Only pending actions can be answered.')
  }

  if (!VALID_CLIENT_RESPONSE_STATUSES.has(responseStatus)) {
    throw new Error('Client response status is not available.')
  }

  const normalizedAction = normalizeNeededAction(action)

  if (
    [NEEDED_ACTION_STATUSES.APPROVED, NEEDED_ACTION_STATUSES.CHANGES_REQUESTED].includes(responseStatus)
    && normalizedAction.type !== NEEDED_ACTION_TYPES.APPROVAL
  ) {
    throw new Error('Approval decisions are only available for approval actions.')
  }

  const timestamp = now()
  const clientResponse = requireText(message || 'Completed by client', 'Response')
  const updatedAction = {
    ...action,
    client_response: clientResponse,
    client_responded_at: timestamp,
    client_responded_by: viewer.userId,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        response: clientResponse,
      },
      now,
      type: 'client_answered',
      viewer,
    })),
    responded_at: timestamp,
    responded_by: viewer.userId,
    status: responseStatus,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)
  recordNeededActionActivity({
    action: updatedAction,
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_ANSWERED,
    now,
    repositories,
    viewer,
  })

  return updatedAction
}

export function resolveNeededAction({
  activityIdGenerator,
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
    viewer,
  })) {
    throw new Error('Only pending or answered actions can be resolved.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    resolved_at: timestamp,
    resolved_by: viewer.userId,
    resolution_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_resolved',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.RESOLVED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)
  recordNeededActionActivity({
    action: updatedAction,
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_RESOLVED,
    now,
    repositories,
    viewer,
  })

  return updatedAction
}

export function cancelNeededAction({
  activityIdGenerator,
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.CANCELLED,
    viewer,
  })) {
    throw new Error('Action is already cancelled.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: timestamp,
    cancelled_by: viewer.userId,
    cancellation_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_cancelled',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.CANCELLED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)
  recordNeededActionActivity({
    action: updatedAction,
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_REQUEST_CANCELLED,
    now,
    repositories,
    viewer,
  })

  return updatedAction
}

export function reopenNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.PENDING,
    viewer,
  })) {
    throw new Error('Only answered, resolved, or cancelled actions can be reopened.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_note: '',
    resolved_at: null,
    resolved_by: null,
    resolution_note: '',
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_reopened',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}
