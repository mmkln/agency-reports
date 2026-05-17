export const CLIENT_REQUEST_TYPES = Object.freeze({
  CHANGE_REQUEST: 'change_request',
  FILE_SHARE: 'file_share',
  NEW_WORK: 'new_work',
  QUESTION: 'question',
  SUPPORT: 'support',
})

export const CLIENT_REQUEST_STATUSES = Object.freeze({
  ACCEPTED: 'accepted',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
  CONVERTED: 'converted',
  DECLINED: 'declined',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  WAITING_ON_AGENCY: 'waiting_on_agency',
  WAITING_ON_CLIENT: 'waiting_on_client',
})

export const CLIENT_REQUEST_TYPE_META = Object.freeze({
  [CLIENT_REQUEST_TYPES.NEW_WORK]: {
    icon: 'plus',
    label: 'New work',
    tone: 'blue',
  },
  [CLIENT_REQUEST_TYPES.CHANGE_REQUEST]: {
    icon: 'pencil',
    label: 'Change request',
    tone: 'amber',
  },
  [CLIENT_REQUEST_TYPES.QUESTION]: {
    icon: 'helpCircle',
    label: 'Question',
    tone: 'neutral',
  },
  [CLIENT_REQUEST_TYPES.SUPPORT]: {
    icon: 'messageSquare',
    label: 'Support',
    tone: 'blue',
  },
  [CLIENT_REQUEST_TYPES.FILE_SHARE]: {
    icon: 'fileText',
    label: 'File share',
    tone: 'green',
  },
})

export const CLIENT_REQUEST_STATUS_META = Object.freeze({
  [CLIENT_REQUEST_STATUSES.SUBMITTED]: {
    icon: 'clock',
    label: 'Submitted',
    tone: 'blue',
  },
  [CLIENT_REQUEST_STATUSES.UNDER_REVIEW]: {
    icon: 'search',
    label: 'Under review',
    tone: 'amber',
  },
  [CLIENT_REQUEST_STATUSES.WAITING_ON_AGENCY]: {
    icon: 'clock',
    label: 'Waiting on agency',
    tone: 'amber',
  },
  [CLIENT_REQUEST_STATUSES.WAITING_ON_CLIENT]: {
    icon: 'bell',
    label: 'Waiting on you',
    tone: 'amber',
  },
  [CLIENT_REQUEST_STATUSES.ACCEPTED]: {
    icon: 'checkCircle2',
    label: 'Accepted',
    tone: 'green',
  },
  [CLIENT_REQUEST_STATUSES.DECLINED]: {
    icon: 'circleX',
    label: 'Declined',
    tone: 'rose',
  },
  [CLIENT_REQUEST_STATUSES.CONVERTED]: {
    icon: 'gitMerge',
    label: 'Converted',
    tone: 'green',
  },
  [CLIENT_REQUEST_STATUSES.COMPLETED]: {
    icon: 'checkCircle2',
    label: 'Completed',
    tone: 'green',
  },
  [CLIENT_REQUEST_STATUSES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})

const validTypes = new Set(Object.values(CLIENT_REQUEST_TYPES))
const validStatuses = new Set(Object.values(CLIENT_REQUEST_STATUSES))

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeType(type) {
  return validTypes.has(type) ? type : CLIENT_REQUEST_TYPES.NEW_WORK
}

function normalizeStatus(status) {
  return validStatuses.has(status) ? status : CLIENT_REQUEST_STATUSES.SUBMITTED
}

export function normalizeClientRequest(request = {}) {
  return {
    agency_response: normalizeText(request.agency_response),
    client_id: normalizeText(request.client_id),
    created_at: request.created_at ?? null,
    description: normalizeText(request.description),
    desired_due_date: normalizeText(request.desired_due_date),
    id: normalizeText(request.id),
    project_id: normalizeText(request.project_id),
    reference_link: normalizeText(request.reference_link),
    related_needed_action_id: normalizeText(request.related_needed_action_id),
    request_type: normalizeType(request.request_type),
    response_history: Array.isArray(request.response_history) ? request.response_history : [],
    status: normalizeStatus(request.status),
    submitted_by: normalizeText(request.submitted_by),
    submitted_by_name: normalizeText(request.submitted_by_name),
    title: normalizeText(request.title),
    updated_at: request.updated_at ?? request.created_at ?? null,
  }
}
