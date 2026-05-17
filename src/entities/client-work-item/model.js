import { TASK_STATUSES } from '../task'

export const CLIENT_WORK_ITEM_STATUSES = Object.freeze({
  DELIVERED: 'delivered',
  IN_PROGRESS: 'in_progress',
  NEEDS_ATTENTION: 'needs_attention',
  PLANNED: 'planned',
  WAITING_CLIENT: 'waiting_client',
})

export const CLIENT_WORK_ITEM_PUBLISH_STATES = Object.freeze({
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  READY_FOR_REVIEW: 'ready_for_review',
})

export const CLIENT_WORK_ITEM_STATUS_META = Object.freeze({
  [CLIENT_WORK_ITEM_STATUSES.PLANNED]: {
    icon: 'circle',
    label: 'Planned',
    tone: 'neutral',
  },
  [CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS]: {
    icon: 'clock',
    label: 'In Progress',
    tone: 'blue',
  },
  [CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT]: {
    icon: 'clock',
    label: 'Waiting on You',
    tone: 'purple',
  },
  [CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION]: {
    icon: 'triangleAlert',
    label: 'Needs Attention',
    tone: 'rose',
  },
  [CLIENT_WORK_ITEM_STATUSES.DELIVERED]: {
    icon: 'checkCircle2',
    label: 'Delivered',
    tone: 'green',
  },
})

export const CLIENT_WORK_ITEM_PUBLISH_STATE_META = Object.freeze({
  [CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT]: {
    icon: 'fileText',
    label: 'Draft',
    tone: 'neutral',
  },
  [CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW]: {
    icon: 'clock',
    label: 'Ready for Review',
    tone: 'amber',
  },
  [CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED]: {
    icon: 'checkCircle2',
    label: 'Published',
    tone: 'green',
  },
  [CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})

const validStatuses = new Set(Object.values(CLIENT_WORK_ITEM_STATUSES))
const validPublishStates = new Set(Object.values(CLIENT_WORK_ITEM_PUBLISH_STATES))

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue || null
}

function normalizeStatus(status) {
  return validStatuses.has(status) ? status : CLIENT_WORK_ITEM_STATUSES.PLANNED
}

function normalizePublishState(publishState) {
  return validPublishStates.has(publishState) ? publishState : CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT
}

export function mapTaskStatusToClientWorkStatus(taskStatus) {
  if (taskStatus === TASK_STATUSES.DONE) {
    return CLIENT_WORK_ITEM_STATUSES.DELIVERED
  }

  if (taskStatus === TASK_STATUSES.IN_PROGRESS) {
    return CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS
  }

  if (taskStatus === TASK_STATUSES.WAITING_CLIENT) {
    return CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT
  }

  if (taskStatus === TASK_STATUSES.BLOCKED) {
    return CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION
  }

  return CLIENT_WORK_ITEM_STATUSES.PLANNED
}

export function normalizeClientWorkItem(item = {}) {
  return {
    client_id: normalizeText(item.client_id),
    created_at: item.created_at ?? null,
    id: normalizeText(item.id),
    last_reviewed_at: item.last_reviewed_at ?? null,
    project_id: normalizeNullableText(item.project_id),
    publish_state: normalizePublishState(item.publish_state),
    published_at: item.published_at ?? null,
    published_by: normalizeNullableText(item.published_by),
    sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : 0,
    source_task_id: normalizeNullableText(item.source_task_id),
    status: normalizeStatus(item.status),
    summary: normalizeText(item.summary),
    target_date: normalizeText(item.target_date),
    title: normalizeText(item.title),
    updated_at: item.updated_at ?? item.created_at ?? null,
  }
}
