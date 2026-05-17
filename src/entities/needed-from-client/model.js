export const NEEDED_ACTION_STATUSES = Object.freeze({
  ANSWERED: 'answered',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  RESOLVED: 'resolved',
})

export const NEEDED_ACTION_PRIORITIES = Object.freeze({
  HIGH: 'high',
  LOW: 'low',
  MEDIUM: 'medium',
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

export function normalizeNeededAction(action = {}) {
  const clientRespondedAt = action.client_responded_at ?? action.responded_at ?? null
  const clientRespondedBy = action.client_responded_by ?? action.responded_by ?? null

  return {
    cancelled_at: action.cancelled_at ?? null,
    cancelled_by: action.cancelled_by ?? null,
    client_id: normalizeText(action.client_id),
    client_response: normalizeText(action.client_response),
    client_responded_at: clientRespondedAt,
    client_responded_by: clientRespondedBy,
    created_at: action.created_at ?? null,
    description: normalizeText(action.description),
    due_date: normalizeText(action.due_date),
    id: normalizeText(action.id),
    internal_notes: normalizeText(action.internal_notes),
    owner_name: normalizeText(action.owner_name),
    priority: normalizePriority(action.priority),
    related_link: normalizeText(action.related_link),
    related_task_id: normalizeNullableText(action.related_task_id),
    related_work_item_id: normalizeNullableText(action.related_work_item_id),
    resolved_at: action.resolved_at ?? null,
    resolved_by: action.resolved_by ?? null,
    response_history: Array.isArray(action.response_history) ? action.response_history : [],
    status: normalizeStatus(action.status),
    title: normalizeText(action.title),
    updated_at: action.updated_at ?? action.created_at ?? null,

    // Legacy aliases kept while existing UI/tests migrate to canonical UC-005 names.
    responded_at: clientRespondedAt,
    responded_by: clientRespondedBy,
    cancellation_note: normalizeNullableText(action.cancellation_note),
    resolution_note: normalizeNullableText(action.resolution_note),
  }
}
