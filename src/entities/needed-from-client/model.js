export const NEEDED_ACTION_STATUSES = Object.freeze({
  ANSWERED: 'answered',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
  CHANGES_REQUESTED: 'changes_requested',
  PENDING: 'pending',
  RESOLVED: 'resolved',
})

export const NEEDED_ACTION_PRIORITIES = Object.freeze({
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
})

export const NEEDED_ACTION_TYPES = Object.freeze({
  ACCESS: 'access',
  APPROVAL: 'approval',
  ASSET: 'asset',
  DECISION: 'decision',
  FEEDBACK: 'feedback',
  OTHER: 'other',
})

export const CLINIC_NEEDED_ACTION_TYPES = Object.freeze({
  APPROVE_AD_COPY: 'approve_ad_copy',
  APPROVE_CALL_SCRIPT: 'approve_call_script',
  APPROVE_LANDING_PAGE: 'approve_landing_page',
  APPROVE_MEDICAL_CLAIM: 'approve_medical_claim',
  APPROVE_REVIEW_RESPONSE: 'approve_review_response',
  CONFIRM_APPOINTMENT_AVAILABILITY: 'confirm_appointment_availability',
  CONFIRM_SERVICE_PRICING: 'confirm_service_pricing',
  CONFIRM_TREATMENT_CAPACITY: 'confirm_treatment_capacity',
  CONNECT_CALL_TRACKING: 'connect_call_tracking',
  FIX_MISSED_CALL_FOLLOW_UP: 'fix_missed_call_follow_up',
  PROVIDE_GBP_ACCESS: 'provide_gbp_access',
  RESPOND_TO_NEGATIVE_REVIEW: 'respond_to_negative_review',
  SEND_CREDENTIALS: 'send_credentials',
  SEND_DOCTOR_BIO: 'send_doctor_bio',
  SEND_DOCTOR_PHOTOS: 'send_doctor_photos',
})

export const CLINIC_NEEDED_ACTION_TYPE_META = Object.freeze({
  [CLINIC_NEEDED_ACTION_TYPES.APPROVE_MEDICAL_CLAIM]: {
    icon: 'shieldCheck',
    label: 'Approve medical claim',
  },
  [CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY]: {
    icon: 'checkCircle2',
    label: 'Approve ad copy',
  },
  [CLINIC_NEEDED_ACTION_TYPES.APPROVE_LANDING_PAGE]: {
    icon: 'checkCircle2',
    label: 'Approve landing page',
  },
  [CLINIC_NEEDED_ACTION_TYPES.SEND_DOCTOR_PHOTOS]: {
    icon: 'fileText',
    label: 'Send doctor photos',
  },
  [CLINIC_NEEDED_ACTION_TYPES.SEND_DOCTOR_BIO]: {
    icon: 'fileText',
    label: 'Send doctor bio',
  },
  [CLINIC_NEEDED_ACTION_TYPES.SEND_CREDENTIALS]: {
    icon: 'fileText',
    label: 'Send credentials',
  },
  [CLINIC_NEEDED_ACTION_TYPES.CONFIRM_SERVICE_PRICING]: {
    icon: 'messageSquare',
    label: 'Confirm pricing',
  },
  [CLINIC_NEEDED_ACTION_TYPES.CONFIRM_TREATMENT_CAPACITY]: {
    icon: 'stethoscope',
    label: 'Confirm capacity',
  },
  [CLINIC_NEEDED_ACTION_TYPES.PROVIDE_GBP_ACCESS]: {
    icon: 'lock',
    label: 'Provide GBP access',
  },
  [CLINIC_NEEDED_ACTION_TYPES.CONNECT_CALL_TRACKING]: {
    icon: 'phone',
    label: 'Connect call tracking',
  },
  [CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP]: {
    icon: 'phone',
    label: 'Fix missed-call follow-up',
  },
  [CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT]: {
    icon: 'phone',
    label: 'Approve call script',
  },
  [CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW]: {
    icon: 'messageSquare',
    label: 'Respond to negative review',
  },
  [CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE]: {
    icon: 'messageSquare',
    label: 'Approve review response',
  },
  [CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY]: {
    icon: 'clock',
    label: 'Confirm availability',
  },
})

export const NEEDED_ACTION_STATUS_META = Object.freeze({
  [NEEDED_ACTION_STATUSES.PENDING]: {
    icon: 'clock',
    label: 'Pending',
    tone: 'amber',
  },
  [NEEDED_ACTION_STATUSES.ANSWERED]: {
    icon: 'messageSquare',
    label: 'Answered',
    tone: 'blue',
  },
  [NEEDED_ACTION_STATUSES.APPROVED]: {
    icon: 'checkCircle2',
    label: 'Approved',
    tone: 'green',
  },
  [NEEDED_ACTION_STATUSES.CHANGES_REQUESTED]: {
    icon: 'messageSquare',
    label: 'Changes requested',
    tone: 'amber',
  },
  [NEEDED_ACTION_STATUSES.RESOLVED]: {
    icon: 'checkCircle2',
    label: 'Resolved',
    tone: 'green',
  },
  [NEEDED_ACTION_STATUSES.CANCELLED]: {
    icon: 'circleX',
    label: 'Cancelled',
    tone: 'neutral',
  },
})

export const NEEDED_ACTION_PRIORITY_META = Object.freeze({
  [NEEDED_ACTION_PRIORITIES.LOW]: {
    icon: 'circle',
    label: 'Low',
    tone: 'neutral',
  },
  [NEEDED_ACTION_PRIORITIES.MEDIUM]: {
    icon: 'triangleAlert',
    label: 'Medium',
    tone: 'amber',
  },
  [NEEDED_ACTION_PRIORITIES.HIGH]: {
    icon: 'triangleAlert',
    label: 'High',
    tone: 'rose',
  },
})

const validStatuses = new Set(Object.values(NEEDED_ACTION_STATUSES))
const validPriorities = new Set(Object.values(NEEDED_ACTION_PRIORITIES))
const validTypes = new Set(Object.values(NEEDED_ACTION_TYPES))
const validClinicTypes = new Set(Object.values(CLINIC_NEEDED_ACTION_TYPES))

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value)
  return normalized || null
}

function normalizeStatus(status) {
  return validStatuses.has(status) ? status : NEEDED_ACTION_STATUSES.PENDING
}

function normalizePriority(priority) {
  return validPriorities.has(priority) ? priority : NEEDED_ACTION_PRIORITIES.MEDIUM
}

function normalizeType(type) {
  return validTypes.has(type) ? type : NEEDED_ACTION_TYPES.OTHER
}

function normalizeClinicActionType(type) {
  return validClinicTypes.has(type) ? type : null
}

export function normalizeNeededAction(action = {}) {
  const clientRespondedAt = action.client_responded_at ?? action.responded_at ?? null
  const clientRespondedBy = action.client_responded_by ?? action.responded_by ?? null

  return {
    cancelled_at: action.cancelled_at ?? null,
    cancelled_by: action.cancelled_by ?? null,
    client_id: normalizeText(action.client_id),
    client_owner: normalizeText(action.client_owner),
    client_response: normalizeText(action.client_response),
    client_responded_at: clientRespondedAt,
    client_responded_by: clientRespondedBy,
    created_at: action.created_at ?? null,
    description: normalizeText(action.description),
    due_date: normalizeText(action.due_date),
    id: normalizeText(action.id),
    impact_if_delayed: normalizeText(action.impact_if_delayed),
    internal_notes: normalizeText(action.internal_notes),
    clinic_action_type: normalizeClinicActionType(action.clinic_action_type),
    compliance_risk: normalizeText(action.compliance_risk),
    last_reminded_at: action.last_reminded_at ?? null,
    owner_name: normalizeText(action.owner_name),
    priority: normalizePriority(action.priority),
    related_link: normalizeText(action.related_link),
    related_request_id: normalizeNullableText(action.related_request_id),
    related_call_booking_metric_id: normalizeNullableText(action.related_call_booking_metric_id),
    related_campaign_name: normalizeText(action.related_campaign_name),
    related_compliance_review_id: normalizeNullableText(action.related_compliance_review_id),
    related_location_id: normalizeNullableText(action.related_location_id),
    related_medical_approval_id: normalizeNullableText(action.related_medical_approval_id),
    related_reputation_snapshot_id: normalizeNullableText(action.related_reputation_snapshot_id),
    related_service_line_id: normalizeNullableText(action.related_service_line_id),
    related_task_id: normalizeNullableText(action.related_task_id),
    related_work_item_id: normalizeNullableText(action.related_work_item_id),
    resolved_at: action.resolved_at ?? null,
    resolved_by: action.resolved_by ?? null,
    response_history: Array.isArray(action.response_history) ? action.response_history : [],
    status: normalizeStatus(action.status),
    patient_impact: normalizeText(action.patient_impact),
    title: normalizeText(action.title),
    type: normalizeType(action.type),
    updated_at: action.updated_at ?? action.created_at ?? null,
    why_needed: normalizeText(action.why_needed),

    // Legacy aliases kept while existing UI/tests migrate to canonical UC-005 names.
    agency_owner: normalizeText(action.agency_owner ?? action.owner_name),
    responded_at: clientRespondedAt,
    responded_by: clientRespondedBy,
    cancellation_note: normalizeNullableText(action.cancellation_note),
    resolution_note: normalizeNullableText(action.resolution_note),
  }
}
