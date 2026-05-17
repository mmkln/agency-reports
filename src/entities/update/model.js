export const VISIBILITY = Object.freeze({
  CLIENT_VISIBLE: 'client_visible',
  INTERNAL: 'internal',
})

export const CLIENT_UPDATE_TYPES = Object.freeze({
  APPROVAL_COMPLETED: 'approval_completed',
  DECISION_RECORDED: 'decision_recorded',
  ISSUE_UPDATE: 'issue_update',
  LAUNCH_UPDATE: 'launch_update',
  MILESTONE_UPDATE: 'milestone_update',
  REPORT_PUBLISHED: 'report_published',
  WEEKLY_UPDATE: 'weekly_update',
})

export const CLIENT_UPDATE_TYPE_META = Object.freeze({
  [CLIENT_UPDATE_TYPES.WEEKLY_UPDATE]: {
    icon: 'calendar',
    label: 'Weekly update',
    tone: 'blue',
  },
  [CLIENT_UPDATE_TYPES.MILESTONE_UPDATE]: {
    icon: 'checkCircle2',
    label: 'Milestone',
    tone: 'green',
  },
  [CLIENT_UPDATE_TYPES.LAUNCH_UPDATE]: {
    icon: 'zap',
    label: 'Launch',
    tone: 'amber',
  },
  [CLIENT_UPDATE_TYPES.ISSUE_UPDATE]: {
    icon: 'triangleAlert',
    label: 'Issue',
    tone: 'amber',
  },
  [CLIENT_UPDATE_TYPES.REPORT_PUBLISHED]: {
    icon: 'fileText',
    label: 'Report published',
    tone: 'neutral',
  },
  [CLIENT_UPDATE_TYPES.APPROVAL_COMPLETED]: {
    icon: 'checkCircle2',
    label: 'Approval completed',
    tone: 'green',
  },
  [CLIENT_UPDATE_TYPES.DECISION_RECORDED]: {
    icon: 'messageSquare',
    label: 'Decision',
    tone: 'blue',
  },
})

const validClientUpdateTypes = new Set(Object.values(CLIENT_UPDATE_TYPES))

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value)

  return normalizedValue || null
}

function normalizeClientUpdateType(type) {
  return validClientUpdateTypes.has(type) ? type : CLIENT_UPDATE_TYPES.WEEKLY_UPDATE
}

export function normalizeClientUpdate(update = {}) {
  return {
    body: normalizeText(update.body),
    client_action_needed: normalizeText(update.client_action_needed),
    client_id: normalizeText(update.client_id),
    created_at: update.created_at ?? null,
    created_by: normalizeNullableText(update.created_by),
    id: normalizeText(update.id),
    project_id: normalizeNullableText(update.project_id),
    published_at: update.published_at ?? update.updated_at ?? update.created_at ?? null,
    related_file_link_id: normalizeNullableText(update.related_file_link_id),
    related_report_id: normalizeNullableText(update.related_report_id),
    title: normalizeText(update.title),
    type: normalizeClientUpdateType(update.type),
    updated_at: update.updated_at ?? update.created_at ?? null,
    visibility: normalizeText(update.visibility),
    what_changed: normalizeText(update.what_changed),
    what_next: normalizeText(update.what_next),
  }
}
