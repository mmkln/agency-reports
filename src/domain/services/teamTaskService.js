import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUS_META, TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'
import { canTransitionTaskStatus } from '../policies/taskPolicy'

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

function getAvailableTransitions(status) {
  return Object.values(TASK_STATUSES).filter((nextStatus) => canTransitionTaskStatus(status, nextStatus))
}

function matchesFilter(value, filterValue) {
  return !filterValue || filterValue === 'all' || value === filterValue
}

function mapTask({ clientsById, projectsById, task, viewer }) {
  const isAssignedToViewer = task.assignee_name === viewer.name

  return {
    assigneeName: task.assignee_name,
    availableTransitions: getAvailableTransitions(task.status),
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
    .map((task) => mapTask({ clientsById, projectsById, task, viewer }))

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
