import {
  CLIENT_WORK_ITEM_PUBLISH_STATE_META,
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUS_META,
  CLIENT_WORK_ITEM_STATUSES,
  mapTaskStatusToClientWorkStatus,
  normalizeClientWorkItem,
} from '../../entities/client-work-item'
import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from './activityTrackingService'
import {
  canAgencyViewClientWorkItem,
  canClientViewClientWorkItem,
  canManageClientWorkItem,
  canPublishClientWorkItem,
  canTeamPrepareClientWorkItem,
  canTransitionClientWorkItemPublishState,
  isClientWorkItemPublished,
} from '../policies/clientWorkItemPolicy'
import { canAccessWorkspaceResource } from '../policies/accessPolicy'
import {
  hasAgencyAdminMembership,
  hasAgencyMembership,
  hasWorkspaceMembership,
} from '../policies/routeAccessPolicy'

const VALID_STATUSES = new Set(Object.values(CLIENT_WORK_ITEM_STATUSES))
const VALID_PUBLISH_STATES = new Set(Object.values(CLIENT_WORK_ITEM_PUBLISH_STATES))
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function recordClientWorkItemActivity({
  activityIdGenerator,
  eventType,
  item,
  now,
  repositories,
  viewer,
}) {
  if (!activityIdGenerator || !repositories.activityEvents) {
    return null
  }

  return recordActivityEvent({
    clientId: item.client_id,
    eventType,
    idGenerator: activityIdGenerator,
    metadata: {
      publishState: item.publish_state,
      sourceTaskId: item.source_task_id,
      title: item.title,
      workItemId: item.id,
    },
    now,
    repositories,
    viewer,
  })
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function createClientWorkItemId(idGenerator) {
  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Client work item id must be a string uuid.')
  }

  return id
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function requireText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
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

function normalizeStatus(value, fallback = CLIENT_WORK_ITEM_STATUSES.PLANNED) {
  const nextStatus = value || fallback

  if (!VALID_STATUSES.has(nextStatus)) {
    throw new Error('Client work item status is invalid.')
  }

  return nextStatus
}

function normalizePublishState(value, fallback = CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT) {
  const nextPublishState = value || fallback

  if (!VALID_PUBLISH_STATES.has(nextPublishState)) {
    throw new Error('Client work item publish state is invalid.')
  }

  return nextPublishState
}

function getStatusMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getAdminClient({ clientId, repositories, viewer }) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can manage published work.')
  }

  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessWorkspaceResource(viewer, client.id)) {
    throw new Error('Account was not found.')
  }

  return client
}

function getClientWorkItem({ repositories, workItemId }) {
  const item = repositories.clientWorkItems.findById(workItemId)

  if (!item) {
    throw new Error('Client work item was not found.')
  }

  return item
}

function getEditableClientWorkItem({ repositories, viewer, workItemId }) {
  const item = getClientWorkItem({ repositories, workItemId })
  const client = repositories.workspaces.findById(item.client_id)

  if (!canManageClientWorkItem({ client, item, viewer })) {
    throw new Error('Client work item was not found.')
  }

  return {
    client,
    item,
  }
}

function canPrepareClientWorkItemFromTask({ client, task, viewer }) {
  if (!client || !task || task.client_id !== client.id) {
    return false
  }

  return hasAgencyMembership(viewer) && canAccessWorkspaceResource(viewer, task.client_id)
}

function findActiveClientWorkItemBySourceTaskId({ repositories, taskId }) {
  return repositories.clientWorkItems
    .list()
    .map(normalizeClientWorkItem)
    .find((item) => (
      item.source_task_id === taskId
      && item.publish_state !== CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED
    )) ?? null
}

function validateRelatedProject({ clientId, projectId, repositories }) {
  const normalizedProjectId = normalizeText(projectId)

  if (!normalizedProjectId) {
    return ''
  }

  const project = repositories.projects.findById(normalizedProjectId)

  if (!project || project.client_id !== clientId) {
    throw new Error('Project is not available for this client.')
  }

  return normalizedProjectId
}

function validateSourceTask({ clientId, repositories, sourceTaskId }) {
  const normalizedSourceTaskId = normalizeText(sourceTaskId)

  if (!normalizedSourceTaskId) {
    return ''
  }

  const task = repositories.tasks.findById(normalizedSourceTaskId)

  if (!task || task.client_id !== clientId) {
    throw new Error('Source task is not available for this client.')
  }

  return normalizedSourceTaskId
}

function normalizeEditableFields({
  clientId,
  fallback = {},
  input = {},
  repositories,
}) {
  const projectId = input.projectId ?? input.project_id ?? fallback.project_id
  const sourceTaskId = input.sourceTaskId ?? input.source_task_id ?? fallback.source_task_id

  return {
    project_id: validateRelatedProject({ clientId, projectId, repositories }),
    sort_order: Number.isFinite(Number(input.sortOrder ?? input.sort_order ?? fallback.sort_order))
      ? Number(input.sortOrder ?? input.sort_order ?? fallback.sort_order)
      : 0,
    source_task_id: validateSourceTask({ clientId, repositories, sourceTaskId }),
    status: normalizeStatus(input.status, fallback.status),
    summary: normalizeText(input.summary ?? fallback.summary),
    target_date: normalizeOptionalDate(input.targetDate ?? input.target_date ?? fallback.target_date, 'Target date'),
    title: requireText(input.title ?? fallback.title, 'Client work item title'),
  }
}

function mapAdminWorkItem({ client, item, project, sourceTask }) {
  const normalizedItem = normalizeClientWorkItem(item)

  return {
    client: client
      ? {
          id: client.id,
          name: client.name,
          portalSlug: client.portal_slug,
        }
      : null,
    clientId: normalizedItem.client_id,
    createdAt: normalizedItem.created_at,
    id: normalizedItem.id,
    lastReviewedAt: normalizedItem.last_reviewed_at,
    projectId: normalizedItem.project_id,
    projectName: project?.name ?? 'General',
    publishState: normalizedItem.publish_state,
    publishStateMeta: getStatusMeta(normalizedItem.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATE_META),
    publishedAt: normalizedItem.published_at,
    publishedBy: normalizedItem.published_by,
    sortOrder: normalizedItem.sort_order,
    sourceTask: sourceTask
      ? {
          id: sourceTask.id,
          status: sourceTask.status,
          title: sourceTask.title,
        }
      : null,
    sourceTaskId: normalizedItem.source_task_id,
    status: normalizedItem.status,
    statusMeta: getStatusMeta(normalizedItem.status, CLIENT_WORK_ITEM_STATUS_META),
    summary: normalizedItem.summary,
    targetDate: normalizedItem.target_date,
    title: normalizedItem.title,
    updatedAt: normalizedItem.updated_at,
  }
}

function mapClientWorkItem({ item, project }) {
  const normalizedItem = normalizeClientWorkItem(item)

  return {
    id: normalizedItem.id,
    lastUpdatedAt: normalizedItem.updated_at,
    projectId: normalizedItem.project_id,
    projectName: project?.name ?? 'General',
    sortOrder: normalizedItem.sort_order,
    status: normalizedItem.status,
    statusMeta: getStatusMeta(normalizedItem.status, CLIENT_WORK_ITEM_STATUS_META),
    summary: normalizedItem.summary,
    targetDate: normalizedItem.target_date,
    title: normalizedItem.title,
  }
}

function getProjectMap(repositories) {
  return new Map(repositories.projects.list().map((project) => [project.id, project]))
}

function getTaskMap(repositories) {
  return new Map(repositories.tasks.list().map((task) => [task.id, task]))
}

function sortWorkItems(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    || new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
    || a.title.localeCompare(b.title)
}

export function listAdminClientWorkItems({
  clientId,
  repositories,
  viewer,
}) {
  const client = getAdminClient({
    clientId: normalizeText(clientId),
    repositories,
    viewer,
  })
  const projectsById = getProjectMap(repositories)
  const tasksById = getTaskMap(repositories)
  const workItems = repositories.clientWorkItems
    .listByWorkspaceId(client.id)
    .filter((item) => canAgencyViewClientWorkItem({ item, viewer }))
    .map((item) => mapAdminWorkItem({
      client,
      item,
      project: projectsById.get(item.project_id),
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortWorkItems)

  return {
    client,
    status: 'ready',
    workItems,
  }
}

export function getAdminClientWorkItemDetail({
  repositories,
  viewer,
  workItemId,
}) {
  const item = getClientWorkItem({ repositories, workItemId })
  const client = repositories.workspaces.findById(item.client_id)

  if (!canAgencyViewClientWorkItem({ item, viewer })) {
    throw new Error('Client work item was not found.')
  }

  return {
    client,
    status: 'ready',
    workItem: mapAdminWorkItem({
      client,
      item,
      project: item.project_id ? repositories.projects.findById(item.project_id) : null,
      sourceTask: item.source_task_id ? repositories.tasks.findById(item.source_task_id) : null,
    }),
  }
}

export function listPublishedClientWorkItems({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.activeWorkspaceId)
  const client = repositories.workspaces.findById(normalizedClientId)

  if (!client || !canAccessWorkspaceResource(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projectsById = getProjectMap(repositories)
  const workItems = repositories.clientWorkItems
    .listByWorkspaceId(normalizedClientId)
    .filter((item) => {
      if (!isClientWorkItemPublished(item)) {
        return false
      }

      if (hasWorkspaceMembership(viewer)) {
        return canClientViewClientWorkItem({ item, viewer })
      }

      return canAgencyViewClientWorkItem({ item, viewer })
    })
    .map((item) => mapClientWorkItem({
      item,
      project: projectsById.get(item.project_id),
    }))
    .sort(sortWorkItems)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    status: 'ready',
    workItems,
  }
}

export function getPublishedClientWorkItemDetail({
  clientId,
  repositories,
  viewer,
  workItemId,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.activeWorkspaceId)
  const client = repositories.workspaces.findById(normalizedClientId)
  const item = repositories.clientWorkItems.findById(workItemId)

  if (!client || !item || item.client_id !== normalizedClientId || !isClientWorkItemPublished(item)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const canView = hasWorkspaceMembership(viewer)
    ? canClientViewClientWorkItem({ item, viewer })
    : canAgencyViewClientWorkItem({ item, viewer })

  if (!canView) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    status: 'ready',
    workItem: mapClientWorkItem({
      item,
      project: item.project_id ? repositories.projects.findById(item.project_id) : null,
    }),
  }
}

export function createClientWorkItem({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const client = getAdminClient({
    clientId: normalizeText(input.clientId ?? input.client_id),
    repositories,
    viewer,
  })
  const timestamp = now()
  const item = {
    client_id: client.id,
    created_at: timestamp,
    id: createClientWorkItemId(idGenerator),
    last_reviewed_at: null,
    publish_state: normalizePublishState(input.publishState ?? input.publish_state),
    published_at: null,
    published_by: null,
    updated_at: timestamp,
    ...normalizeEditableFields({
      clientId: client.id,
      input,
      repositories,
    }),
  }

  repositories.clientWorkItems.upsert(item)
  recordClientWorkItemActivity({
    activityIdGenerator,
    eventType: item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW
      ? ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_READY_FOR_REVIEW
      : ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_CREATED,
    item,
    now,
    repositories,
    viewer,
  })

  return mapAdminWorkItem({
    client,
    item,
    project: item.project_id ? repositories.projects.findById(item.project_id) : null,
    sourceTask: item.source_task_id ? repositories.tasks.findById(item.source_task_id) : null,
  })
}

export function createClientWorkItemFromTask({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  const task = repositories.tasks.findById(taskId)

  if (!task) {
    throw new Error('Source task was not found.')
  }

  return createClientWorkItem({
    activityIdGenerator,
    idGenerator,
    input: {
      ...input,
      clientId: task.client_id,
      projectId: task.project_id,
      sourceTaskId: task.id,
      status: input.status ?? mapTaskStatusToClientWorkStatus(task.status),
      summary: input.summary ?? task.client_safe_summary ?? '',
      targetDate: input.targetDate ?? task.due_date ?? '',
      title: input.title ?? task.title,
    },
    now,
    repositories,
    viewer,
  })
}

export function suggestClientWorkItemFromTask({
  activityIdGenerator,
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const task = repositories.tasks.findById(taskId)

  if (!task) {
    throw new Error('Source task was not found.')
  }

  const client = repositories.workspaces.findById(task.client_id)

  if (!canPrepareClientWorkItemFromTask({ client, task, viewer })) {
    throw new Error('Source task was not found.')
  }

  const existingWorkItem = findActiveClientWorkItemBySourceTaskId({
    repositories,
    taskId: task.id,
  })

  if (existingWorkItem) {
    throw new Error('Client work item already exists for this task.')
  }

  const summary = normalizeText(input.summary ?? task.client_safe_summary)

  if (!summary) {
    throw new Error('Portal-ready summary is required before sending work for review.')
  }

  const timestamp = now()
  const item = {
    client_id: client.id,
    created_at: timestamp,
    id: createClientWorkItemId(idGenerator),
    last_reviewed_at: timestamp,
    publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    published_at: null,
    published_by: null,
    updated_at: timestamp,
    ...normalizeEditableFields({
      clientId: client.id,
      input: {
        clientId: task.client_id,
        projectId: task.project_id,
        sourceTaskId: task.id,
        status: input.status ?? mapTaskStatusToClientWorkStatus(task.status),
        summary,
        targetDate: input.targetDate ?? task.due_date ?? '',
        title: input.title ?? task.title,
      },
      repositories,
    }),
  }

  repositories.clientWorkItems.upsert(item)
  recordClientWorkItemActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_READY_FOR_REVIEW,
    item,
    now,
    repositories,
    viewer,
  })

  return mapAdminWorkItem({
    client,
    item,
    project: item.project_id ? repositories.projects.findById(item.project_id) : null,
    sourceTask: task,
  })
}

export function updateClientWorkItem({
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const { client, item } = getEditableClientWorkItem({ repositories, viewer, workItemId })
  const timestamp = now()
  const nextPublishState = normalizePublishState(input.publishState ?? input.publish_state, item.publish_state)

  if (nextPublishState !== item.publish_state && !canTransitionClientWorkItemPublishState(item.publish_state, nextPublishState)) {
    throw new Error('Client work item publish state transition is invalid.')
  }

  const updatedItem = {
    ...item,
    ...normalizeEditableFields({
      clientId: client.id,
      fallback: item,
      input,
      repositories,
    }),
    last_reviewed_at: input.lastReviewedAt ?? input.last_reviewed_at ?? item.last_reviewed_at,
    publish_state: nextPublishState,
    updated_at: timestamp,
  }

  repositories.clientWorkItems.upsert(updatedItem)

  return mapAdminWorkItem({
    client,
    item: updatedItem,
    project: updatedItem.project_id ? repositories.projects.findById(updatedItem.project_id) : null,
    sourceTask: updatedItem.source_task_id ? repositories.tasks.findById(updatedItem.source_task_id) : null,
  })
}

export function markClientWorkItemReadyForReview({
  activityIdGenerator,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const item = getClientWorkItem({ repositories, workItemId })

  if (!canManageClientWorkItem({
    client: repositories.workspaces.findById(item.client_id),
    item,
    viewer,
  }) && !canTeamPrepareClientWorkItem({ item, viewer })) {
    throw new Error('Client work item was not found.')
  }

  if (item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW) {
    return normalizeClientWorkItem(item)
  }

  if (!canTransitionClientWorkItemPublishState(item.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW)) {
    throw new Error('Client work item publish state transition is invalid.')
  }

  const timestamp = now()
  const updatedItem = {
    ...item,
    last_reviewed_at: timestamp,
    publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    updated_at: timestamp,
  }

  repositories.clientWorkItems.upsert(updatedItem)
  recordClientWorkItemActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_READY_FOR_REVIEW,
    item: updatedItem,
    now,
    repositories,
    viewer,
  })

  return normalizeClientWorkItem(updatedItem)
}

export function publishClientWorkItem({
  activityIdGenerator,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const { client, item } = getEditableClientWorkItem({ repositories, viewer, workItemId })

  if (!canPublishClientWorkItem({ client, item, viewer })) {
    throw new Error('Only admins can publish work items.')
  }

  if (!normalizeText(item.summary)) {
    throw new Error('Client work item summary is required before publishing.')
  }

  if (item.publish_state !== CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED
    && !canTransitionClientWorkItemPublishState(item.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)) {
    throw new Error('Client work item publish state transition is invalid.')
  }

  const timestamp = now()
  const updatedItem = {
    ...item,
    last_reviewed_at: timestamp,
    publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    published_at: item.published_at ?? timestamp,
    published_by: viewer.userId ?? null,
    updated_at: timestamp,
  }

  repositories.clientWorkItems.upsert(updatedItem)
  recordClientWorkItemActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_PUBLISHED,
    item: updatedItem,
    now,
    repositories,
    viewer,
  })

  return mapAdminWorkItem({
    client,
    item: updatedItem,
    project: updatedItem.project_id ? repositories.projects.findById(updatedItem.project_id) : null,
    sourceTask: updatedItem.source_task_id ? repositories.tasks.findById(updatedItem.source_task_id) : null,
  })
}

export function archiveClientWorkItem({
  activityIdGenerator,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const { client, item } = getEditableClientWorkItem({ repositories, viewer, workItemId })

  if (!canTransitionClientWorkItemPublishState(item.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED)) {
    throw new Error('Client work item publish state transition is invalid.')
  }

  const timestamp = now()
  const updatedItem = {
    ...item,
    publish_state: CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED,
    updated_at: timestamp,
  }

  repositories.clientWorkItems.upsert(updatedItem)
  recordClientWorkItemActivity({
    activityIdGenerator,
    eventType: ACTIVITY_EVENT_TYPES.CLIENT_WORK_ITEM_ARCHIVED,
    item: updatedItem,
    now,
    repositories,
    viewer,
  })

  return mapAdminWorkItem({
    client,
    item: updatedItem,
    project: updatedItem.project_id ? repositories.projects.findById(updatedItem.project_id) : null,
    sourceTask: updatedItem.source_task_id ? repositories.tasks.findById(updatedItem.source_task_id) : null,
  })
}
