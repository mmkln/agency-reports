import {
  CLIENT_WORK_ITEM_PUBLISH_STATE_META,
  CLIENT_WORK_ITEM_PUBLISH_STATES,
  CLIENT_WORK_ITEM_STATUS_META,
  normalizeClientWorkItem,
} from '../../entities/client-work-item'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUS_META, TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { canTransitionTaskStatus, getTaskStatusTransitionTargets } from '../policies/taskPolicy'

const VALID_TASK_STATUSES = new Set(Object.values(TASK_STATUSES))
const VALID_VISIBILITY = new Set(Object.values(VISIBILITY))

function assertAgencyTeam(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_TEAM || !viewer.agencyId) {
    throw new Error('Only agency team members can update assigned tasks.')
  }
}

function getAssignedClientIds(viewer) {
  return viewer.clientIds ?? []
}

function canTeamAccessTask(viewer, task) {
  return getAssignedClientIds(viewer).includes(task.client_id)
}

function normalizeText(value = '') {
  return String(value).trim()
}

function getStatusMeta(status) {
  return TASK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getClientWorkItemsBySourceTaskId({ clientIds, repositories }) {
  if (!repositories.clientWorkItems?.list) {
    return new Map()
  }

  const clientIdSet = new Set(clientIds)
  const priority = {
    [CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED]: 0,
    [CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW]: 1,
    [CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT]: 2,
    [CLIENT_WORK_ITEM_PUBLISH_STATES.ARCHIVED]: 3,
  }
  const workItemsByTaskId = new Map()

  repositories.clientWorkItems
    .list()
    .filter((item) => clientIdSet.has(item.client_id))
    .map(normalizeClientWorkItem)
    .filter((item) => item.source_task_id)
    .sort((a, b) => (priority[a.publish_state] ?? 4) - (priority[b.publish_state] ?? 4))
    .forEach((item) => {
      if (!workItemsByTaskId.has(item.source_task_id)) {
        workItemsByTaskId.set(item.source_task_id, item)
      }
    })

  return workItemsByTaskId
}

function mapClientWorkItemState(workItem) {
  if (!workItem) {
    return {
      clientWorkItem: null,
      hasClientWorkItem: false,
      isMissingClientSummary: false,
      isPublishedToClient: false,
      isReadyForClientReview: false,
    }
  }

  const summaryStatus = workItem.summary ? 'ready' : 'missing'

  return {
    clientWorkItem: {
      id: workItem.id,
      publishState: workItem.publish_state,
      publishStateMeta: getMeta(workItem.publish_state, CLIENT_WORK_ITEM_PUBLISH_STATE_META),
      status: workItem.status,
      statusMeta: getMeta(workItem.status, CLIENT_WORK_ITEM_STATUS_META),
      summaryStatus,
      title: workItem.title,
      updatedAt: workItem.updated_at,
    },
    hasClientWorkItem: true,
    isMissingClientSummary: summaryStatus === 'missing',
    isPublishedToClient: workItem.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    isReadyForClientReview: workItem.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
  }
}

function matchesFilter(value, filterValue) {
  return !filterValue || filterValue === 'all' || value === filterValue
}

function mapTask({ clientWorkItemsByTaskId, clientsById, projectsById, task, viewer }) {
  const isAssignedToViewer = task.assignee_name === viewer.name
  const clientWorkItemState = mapClientWorkItemState(clientWorkItemsByTaskId.get(task.id))

  return {
    assigneeName: task.assignee_name,
    availableTransitions: getTaskStatusTransitionTargets(task.status),
    blockerNote: task.blocker_note ?? '',
    clientId: task.client_id,
    clientName: clientsById.get(task.client_id)?.name ?? 'Unknown client',
    clientSafeSummary: task.client_safe_summary ?? '',
    description: task.description,
    dueDate: task.due_date,
    id: task.id,
    internalNote: task.internal_note ?? '',
    isAssignedToViewer,
    projectId: task.project_id,
    projectName: projectsById.get(task.project_id)?.name ?? 'General',
    status: task.status,
    statusMeta: getStatusMeta(task.status),
    title: task.title,
    updatedAt: task.updated_at,
    visibility: task.visibility,
    ...clientWorkItemState,
  }
}

export function listTeamTasks({
  filters = {},
  repositories,
  viewer,
}) {
  assertAgencyTeam(viewer)

  const clientIds = getAssignedClientIds(viewer)
  const clients = repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId && clientIds.includes(client.id))
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const projectsById = new Map(
    repositories.projects
      .list()
      .filter((project) => clientIds.includes(project.client_id))
      .map((project) => [project.id, project]),
  )
  const clientWorkItemsByTaskId = getClientWorkItemsBySourceTaskId({
    clientIds,
    repositories,
  })

  const tasks = repositories.tasks
    .list()
    .filter((task) => clientIds.includes(task.client_id))
    .filter((task) => matchesFilter(task.client_id, filters.clientId))
    .filter((task) => matchesFilter(task.project_id, filters.projectId))
    .filter((task) => matchesFilter(task.status, filters.status))
    .filter((task) => matchesFilter(task.visibility, filters.visibility))
    .filter((task) => filters.scope !== 'mine' || task.assignee_name === viewer.name)
    .sort((a, b) => {
      const dateA = new Date(a.due_date ?? '9999-12-31').getTime()
      const dateB = new Date(b.due_date ?? '9999-12-31').getTime()

      if (dateA !== dateB) {
        return dateA - dateB
      }

      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })
    .map((task) => mapTask({
      clientWorkItemsByTaskId,
      clientsById,
      projectsById,
      task,
      viewer,
    }))

  return {
    clients,
    filters: {
      clientId: filters.clientId ?? 'all',
      projectId: filters.projectId ?? 'all',
      scope: filters.scope ?? 'all',
      status: filters.status ?? 'all',
      visibility: filters.visibility ?? 'all',
    },
    projects: [...projectsById.values()],
    status: 'ready',
    tasks,
  }
}

function getEditableTask({ repositories, taskId, viewer }) {
  assertAgencyTeam(viewer)

  const task = repositories.tasks.findById(taskId)

  if (!task || !canTeamAccessTask(viewer, task)) {
    throw new Error('Task is not available for this team member.')
  }

  return task
}

export function updateAssignedTask({
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  const task = getEditableTask({ repositories, taskId, viewer })
  const nextStatus = input.status ?? task.status
  const nextVisibility = input.visibility ?? task.visibility

  if (!VALID_TASK_STATUSES.has(nextStatus)) {
    throw new Error('Task status is invalid.')
  }

  if (nextStatus !== task.status && !canTransitionTaskStatus(task.status, nextStatus)) {
    throw new Error('This status change is not allowed from the current task state.')
  }

  if (!VALID_VISIBILITY.has(nextVisibility)) {
    throw new Error('Task visibility is invalid.')
  }

  const updatedTask = {
    ...task,
    blocker_note: nextStatus === TASK_STATUSES.BLOCKED
      ? normalizeText(input.blockerNote ?? task.blocker_note)
      : normalizeText(input.blockerNote ?? task.blocker_note),
    client_safe_summary: normalizeText(input.clientSafeSummary ?? task.client_safe_summary),
    client_visible: nextVisibility === VISIBILITY.CLIENT_VISIBLE,
    internal_note: normalizeText(input.internalNote ?? task.internal_note),
    status: nextStatus,
    updated_at: now(),
    visibility: nextVisibility,
  }

  repositories.tasks.upsert(updatedTask)

  return updatedTask
}
