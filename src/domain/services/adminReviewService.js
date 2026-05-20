import {
  CLIENT_WORK_ITEM_PUBLISH_STATE_META,
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUS_META,
  normalizeClientWorkItem,
} from '../../entities/client-work-item'
import {
  NEEDED_ACTION_STATUS_META,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUS_META, TASK_STATUSES } from '../../entities/task'

const DEFAULT_STALE_DAYS = 14
const RECENT_DAYS = 7

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only admins can review published work.')
  }
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function getStatusMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getAgencyClients({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  return repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId)
}

function getClientIds(clients) {
  return new Set(clients.map((client) => client.id))
}

function getProjectMap({ clientIds, repositories }) {
  return new Map(
    repositories.projects
      .list()
      .filter((project) => clientIds.has(project.client_id))
      .map((project) => [project.id, project]),
  )
}

function getTaskMap({ clientIds, repositories }) {
  return new Map(
    repositories.tasks
      .list()
      .filter((task) => clientIds.has(task.client_id))
      .map((task) => [task.id, task]),
  )
}

function getClientWorkItems({ clientIds, repositories }) {
  return repositories.clientWorkItems
    .list()
    .filter((item) => clientIds.has(item.client_id))
    .map(normalizeClientWorkItem)
}

function getNeededActions({ clientIds, repositories }) {
  return repositories.neededFromClient
    .list()
    .filter((action) => clientIds.has(action.client_id))
    .map(normalizeNeededAction)
}

function getTimestamp(value) {
  const timestamp = new Date(value ?? 0).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getDaysSince(value, now) {
  const timestamp = getTimestamp(value)

  if (!timestamp) {
    return Number.POSITIVE_INFINITY
  }

  return Math.floor((new Date(now).getTime() - timestamp) / 86_400_000)
}

function getWorkItemsBySourceTask(workItems) {
  const workItemsByTaskId = new Map()

  for (const item of workItems) {
    if (!item.source_task_id) {
      continue
    }

    const existingItems = workItemsByTaskId.get(item.source_task_id) ?? []
    existingItems.push(item)
    workItemsByTaskId.set(item.source_task_id, existingItems)
  }

  return workItemsByTaskId
}

function getOpenRequestKeys(actions) {
  return new Set(
    actions
      .filter((action) => !['cancelled', 'resolved'].includes(action.status))
      .flatMap((action) => [
        action.related_task_id ? `task:${action.related_task_id}` : null,
        action.related_work_item_id ? `work:${action.related_work_item_id}` : null,
      ].filter(Boolean)),
  )
}

function isOpenNeededAction(action) {
  return !['cancelled', 'resolved'].includes(action.status)
}

function mapLinkedRequest(action) {
  return {
    dueDate: action.due_date,
    id: action.id,
    relatedTaskId: action.related_task_id,
    relatedWorkItemId: action.related_work_item_id,
    status: action.status,
    statusMeta: getStatusMeta(action.status, NEEDED_ACTION_STATUS_META),
    title: action.title,
    updatedAt: action.updated_at,
  }
}

function getLinkedRequests({ actions, sourceTaskId, workItemId }) {
  return actions
    .filter(isOpenNeededAction)
    .filter((action) => {
      const matchesTask = sourceTaskId && action.related_task_id === sourceTaskId
      const matchesWorkItem = workItemId && action.related_work_item_id === workItemId

      return matchesTask || matchesWorkItem
    })
    .map(mapLinkedRequest)
}

function getSummaryStatus(item) {
  return normalizeText(item.summary) ? 'ready' : 'missing'
}

function mapClient(client) {
  return client
    ? {
        id: client.id,
        name: client.name,
        portalSlug: client.portal_slug,
      }
    : null
}

function mapProject(project) {
  return project
    ? {
        id: project.id,
        name: project.name,
      }
    : null
}

function mapTask(task) {
  return task
    ? {
        blockerNote: task.blocker_note ?? '',
        clientSafeSummary: task.client_safe_summary ?? '',
        dueDate: task.due_date ?? '',
        id: task.id,
        internalNote: task.internal_note ?? '',
        status: task.status,
        statusMeta: getStatusMeta(task.status, TASK_STATUS_META),
        title: task.title,
        updatedAt: task.updated_at,
      }
    : null
}

function mapWorkReviewItem({
  client,
  item,
  linkedRequests = [],
  project,
  recommendedAction,
  sourceTask,
}) {
  return {
    client: mapClient(client),
    clientFacingStatus: item.status,
    clientFacingStatusMeta: getStatusMeta(item.status, CLIENT_WORK_ITEM_STATUS_META),
    id: item.id,
    lastPublishedAt: item.published_at,
    lastReviewedAt: item.last_reviewed_at,
    linkedRequests,
    project: mapProject(project),
    publishState: item.publish_state,
    publishStateMeta: getStatusMeta(item.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATE_META),
    recommendedAction,
    sortOrder: item.sort_order,
    sourceTask: mapTask(sourceTask),
    summary: item.summary,
    summaryStatus: getSummaryStatus(item),
    targetDate: item.target_date,
    title: item.title,
    updatedAt: item.updated_at,
    workItemId: item.id,
  }
}

function mapTaskReviewItem({
  client,
  linkedRequests = [],
  project,
  recommendedAction,
  task,
}) {
  return {
    client: mapClient(client),
    currentInternalStatus: task.status,
    currentInternalStatusMeta: getStatusMeta(task.status, TASK_STATUS_META),
    linkedRequests,
    project: mapProject(project),
    recommendedAction,
    sourceTask: mapTask(task),
    summary: task.client_safe_summary ?? '',
    summaryStatus: normalizeText(task.client_safe_summary) ? 'ready' : 'missing',
    targetDate: task.due_date ?? '',
    taskId: task.id,
    title: task.title,
    updatedAt: task.updated_at,
  }
}

function sortReviewItems(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    || getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt)
    || (a.title ?? '').localeCompare(b.title ?? '')
}

export function getAdminReviewQueues({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  staleAfterDays = DEFAULT_STALE_DAYS,
  viewer,
}) {
  const clients = getAgencyClients({ repositories, viewer })
    .filter((client) => !clientId || client.id === clientId)
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const clientIds = getClientIds(clients)
  const projectsById = getProjectMap({ clientIds, repositories })
  const tasksById = getTaskMap({ clientIds, repositories })
  const workItems = getClientWorkItems({ clientIds, repositories })
  const neededActions = getNeededActions({ clientIds, repositories })
  const openRequestKeys = getOpenRequestKeys(neededActions)
  const workItemsBySourceTask = getWorkItemsBySourceTask(workItems)
  const nowValue = now()

  const readyForReview = workItems
    .filter((item) => item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW)
    .map((item) => mapWorkReviewItem({
      client: clientsById.get(item.client_id),
      item,
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: item.source_task_id,
        workItemId: item.id,
      }),
      project: projectsById.get(item.project_id),
      recommendedAction: 'review_and_publish',
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortReviewItems)

  const missingClientSummary = workItems
    .filter((item) => [
      CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
      CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    ].includes(item.publish_state))
    .filter((item) => !normalizeText(item.summary))
    .map((item) => mapWorkReviewItem({
      client: clientsById.get(item.client_id),
      item,
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: item.source_task_id,
        workItemId: item.id,
      }),
      project: projectsById.get(item.project_id),
      recommendedAction: 'write_client_summary',
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortReviewItems)

  const stalePublished = workItems
    .filter((item) => item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)
    .filter((item) => getDaysSince(item.updated_at ?? item.published_at, nowValue) >= staleAfterDays)
    .map((item) => mapWorkReviewItem({
      client: clientsById.get(item.client_id),
      item,
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: item.source_task_id,
        workItemId: item.id,
      }),
      project: projectsById.get(item.project_id),
      recommendedAction: 'review_stale_published_work',
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortReviewItems)

  const recentlyPublished = workItems
    .filter((item) => item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)
    .filter((item) => getDaysSince(item.published_at, nowValue) <= RECENT_DAYS)
    .map((item) => mapWorkReviewItem({
      client: clientsById.get(item.client_id),
      item,
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: item.source_task_id,
        workItemId: item.id,
      }),
      project: projectsById.get(item.project_id),
      recommendedAction: 'monitor_recent_publish',
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortReviewItems)

  const archived = workItems
    .filter((item) => item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED)
    .map((item) => mapWorkReviewItem({
      client: clientsById.get(item.client_id),
      item,
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: item.source_task_id,
        workItemId: item.id,
      }),
      project: projectsById.get(item.project_id),
      recommendedAction: 'keep_archived',
      sourceTask: tasksById.get(item.source_task_id),
    }))
    .sort(sortReviewItems)

  const tasks = [...tasksById.values()]

  const waitingClientWithoutRequest = tasks
    .filter((task) => task.status === TASK_STATUSES.WAITING_CLIENT)
    .filter((task) => {
      const linkedWorkItems = workItemsBySourceTask.get(task.id) ?? []
      return !openRequestKeys.has(`task:${task.id}`)
        && !linkedWorkItems.some((item) => openRequestKeys.has(`work:${item.id}`))
    })
    .map((task) => mapTaskReviewItem({
      client: clientsById.get(task.client_id),
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: task.id,
      }),
      project: projectsById.get(task.project_id),
      recommendedAction: 'create_client_request',
      task,
    }))
    .sort(sortReviewItems)

  const blockedWithoutClientExplanation = tasks
    .filter((task) => task.status === TASK_STATUSES.BLOCKED)
    .filter((task) => {
      const linkedWorkItems = workItemsBySourceTask.get(task.id) ?? []
      const hasClientSummary = normalizeText(task.client_safe_summary)
        || linkedWorkItems.some((item) => normalizeText(item.summary))

      return !hasClientSummary
    })
    .map((task) => mapTaskReviewItem({
      client: clientsById.get(task.client_id),
      linkedRequests: getLinkedRequests({
        actions: neededActions,
        sourceTaskId: task.id,
      }),
      project: projectsById.get(task.project_id),
      recommendedAction: 'write_client_safe_explanation',
      task,
    }))
    .sort(sortReviewItems)

  return {
    clients,
    queues: {
      archived,
      blockedWithoutClientExplanation,
      missingClientSummary,
      readyForReview,
      recentlyPublished,
      stalePublished,
      waitingClientWithoutRequest,
    },
    status: 'ready',
    staleAfterDays,
  }
}
