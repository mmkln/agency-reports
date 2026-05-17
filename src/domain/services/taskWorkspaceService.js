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

function assertTaskWorkspaceViewer(viewer) {
  if (
    ![USER_ROLES.AGENCY_ADMIN, USER_ROLES.AGENCY_TEAM].includes(viewer?.role)
    || !viewer.agencyId
  ) {
    throw new Error('Only agency users can manage tasks.')
  }
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function normalizeText(value = '') {
  return String(value).trim()
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

function getWorkspaceClients({ repositories, viewer }) {
  assertTaskWorkspaceViewer(viewer)

  const agencyClients = repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId)

  if (viewer.role === USER_ROLES.AGENCY_ADMIN) {
    return agencyClients
  }

  const assignedClientIds = new Set(viewer.clientIds ?? [])
  return agencyClients.filter((client) => assignedClientIds.has(client.id))
}

function getWorkspaceClientIds({ repositories, viewer }) {
  return getWorkspaceClients({ repositories, viewer }).map((client) => client.id)
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

function matchesSearch(task, clientsById, projectsById, searchValue) {
  const normalizedSearch = normalizeText(searchValue).toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [
    task.title,
    task.description,
    task.assignee_name,
    clientsById.get(task.client_id)?.name,
    projectsById.get(task.project_id)?.name,
  ].some((value) => normalizeText(value).toLowerCase().includes(normalizedSearch))
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

export function listTaskWorkspace({
  filters = {},
  repositories,
  viewer,
}) {
  const clients = getWorkspaceClients({ repositories, viewer })
  const clientIds = clients.map((client) => client.id)
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const projects = repositories.projects
    .list()
    .filter((project) => clientIds.includes(project.client_id))
  const projectsById = new Map(projects.map((project) => [project.id, project]))
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
    .filter((task) => matchesSearch(task, clientsById, projectsById, filters.search))
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
    canCreateClientVisibleTasks: viewer.role === USER_ROLES.AGENCY_ADMIN,
    canCreateClientWorkItems: viewer.role === USER_ROLES.AGENCY_ADMIN,
    canUseMineFilter: viewer.role === USER_ROLES.AGENCY_TEAM,
    clients,
    filters: {
      clientId: filters.clientId ?? 'all',
      projectId: filters.projectId ?? 'all',
      search: filters.search ?? '',
      scope: filters.scope ?? 'all',
      status: filters.status ?? 'all',
      visibility: filters.visibility ?? 'all',
    },
    projects,
    status: 'ready',
    tasks,
  }
}

function getWorkspaceClient({ clientId, repositories, viewer }) {
  const client = getWorkspaceClients({ repositories, viewer })
    .find((workspaceClient) => workspaceClient.id === clientId)

  if (!client) {
    throw new Error('Client is not available for this task workspace.')
  }

  return client
}

function getWorkspaceProject({ clientId, projectId, repositories }) {
  const normalizedProjectId = normalizeText(projectId)

  if (!normalizedProjectId) {
    return ''
  }

  const project = repositories.projects.findById(normalizedProjectId)

  if (!project || project.client_id !== clientId) {
    throw new Error('Project is not available for this client.')
  }

  return project.id
}

function getNextTaskSortOrder({ clientId, repositories }) {
  const highestSortOrder = repositories.tasks
    .listByClientId(clientId)
    .reduce((highest, task) => Math.max(highest, Number(task.sort_order) || 0), 0)

  return highestSortOrder + 10
}

export function createTask({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertTaskWorkspaceViewer(viewer)
  assertUuidGenerator(idGenerator)

  const client = getWorkspaceClient({
    clientId: normalizeText(input.clientId),
    repositories,
    viewer,
  })
  const title = normalizeText(input.title)

  if (!title) {
    throw new Error('Task title is required.')
  }

  const requestedVisibility = input.visibility ?? VISIBILITY.INTERNAL

  if (!VALID_VISIBILITY.has(requestedVisibility)) {
    throw new Error('Task visibility is invalid.')
  }

  if (viewer.role === USER_ROLES.AGENCY_TEAM && requestedVisibility !== VISIBILITY.INTERNAL) {
    throw new Error('Team-created tasks must stay internal until an admin publishes them.')
  }

  const status = input.status ?? TASK_STATUSES.TODO

  if (!VALID_TASK_STATUSES.has(status)) {
    throw new Error('Task status is invalid.')
  }

  const timestamp = now()
  const visibility = viewer.role === USER_ROLES.AGENCY_TEAM ? VISIBILITY.INTERNAL : requestedVisibility
  const assigneeName = viewer.role === USER_ROLES.AGENCY_TEAM
    ? viewer.name
    : normalizeText(input.assigneeName)

  const task = {
    assignee_name: assigneeName,
    blocker_note: normalizeText(input.blockerNote),
    client_id: client.id,
    client_safe_summary: normalizeText(input.clientSafeSummary),
    client_visible: visibility === VISIBILITY.CLIENT_VISIBLE,
    created_at: timestamp,
    description: normalizeText(input.description),
    due_date: normalizeOptionalDate(input.dueDate, 'Task due date'),
    id: idGenerator(),
    internal_note: normalizeText(input.internalNote),
    project_id: getWorkspaceProject({
      clientId: client.id,
      projectId: input.projectId,
      repositories,
    }),
    sort_order: getNextTaskSortOrder({ clientId: client.id, repositories }),
    status,
    title,
    updated_at: timestamp,
    visibility,
  }

  repositories.tasks.upsert(task)

  return task
}

function getEditableWorkspaceTask({ repositories, taskId, viewer }) {
  assertTaskWorkspaceViewer(viewer)

  const task = repositories.tasks.findById(taskId)
  const clientIds = getWorkspaceClientIds({ repositories, viewer })

  if (!task || !clientIds.includes(task.client_id)) {
    throw new Error('Task is not available for this workspace.')
  }

  return task
}

export function updateWorkspaceTask({
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  const task = getEditableWorkspaceTask({ repositories, taskId, viewer })
  const nextStatus = input.status ?? task.status
  const nextVisibility = input.visibility ?? task.visibility

  if (!VALID_TASK_STATUSES.has(nextStatus)) {
    throw new Error('Task status is invalid.')
  }

  if (
    viewer.role === USER_ROLES.AGENCY_TEAM
    && nextStatus !== task.status
    && !canTransitionTaskStatus(task.status, nextStatus)
  ) {
    throw new Error('This status change is not allowed from the current task state.')
  }

  if (!VALID_VISIBILITY.has(nextVisibility)) {
    throw new Error('Task visibility is invalid.')
  }

  if (viewer.role === USER_ROLES.AGENCY_TEAM && nextVisibility !== VISIBILITY.INTERNAL && task.visibility === VISIBILITY.INTERNAL) {
    throw new Error('Only admins can publish internal tasks to clients.')
  }

  const updatedTask = {
    ...task,
    blocker_note: normalizeText(input.blockerNote ?? task.blocker_note),
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
