import { CLIENT_WORK_ITEM_STATUSES } from '../../entities/client-work-item'
import { canAccessClient } from '../policies/accessPolicy'
import { listClientVisibleFileLinks } from './clientFilesLinksService'
import { listPublishedClientWorkItems } from './clientWorkItemService'
import { listClientNeededActions } from './neededFromClientService'

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function getStatusPriority(status) {
  const priority = {
    [CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT]: 0,
    [CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION]: 1,
    [CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS]: 2,
    [CLIENT_WORK_ITEM_STATUSES.PLANNED]: 3,
    [CLIENT_WORK_ITEM_STATUSES.DELIVERED]: 4,
  }

  return priority[status] ?? 5
}

function getProjectStatus(workItems) {
  return [...workItems].sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))[0]?.status
    ?? CLIENT_WORK_ITEM_STATUSES.PLANNED
}

function getLatestUpdatedAt(items) {
  const timestamp = items
    .map((item) => new Date(item.lastUpdatedAt ?? 0).getTime())
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => b - a)[0]

  return timestamp ? new Date(timestamp).toISOString() : ''
}

function getProjectProgress(project, workItems) {
  if (typeof project?.progress_percent === 'number') {
    return project.progress_percent
  }

  if (!workItems.length) {
    return 0
  }

  const deliveredCount = workItems.filter((item) => item.status === CLIENT_WORK_ITEM_STATUSES.DELIVERED).length

  return Math.round((deliveredCount / workItems.length) * 100)
}

function groupActionsByProject({ actions, workItemProjectIds }) {
  const actionsByProjectId = new Map()

  actions.forEach((action) => {
    const projectId = normalizeText(
      action.projectId
        ?? action.project_id
        ?? workItemProjectIds.get(action.relatedWorkItemId),
    )

    if (!projectId) {
      return
    }

    actionsByProjectId.set(projectId, [
      ...(actionsByProjectId.get(projectId) ?? []),
      action,
    ])
  })

  return actionsByProjectId
}

function createProjectViewModel({
  actionsByProjectId,
  fileLinksByProjectId,
  project,
  workItems,
}) {
  const openActions = actionsByProjectId.get(project.id) ?? []
  const status = getProjectStatus(workItems)

  return {
    activeWorkItems: workItems.filter((item) => item.status !== CLIENT_WORK_ITEM_STATUSES.DELIVERED),
    clientActions: openActions,
    description: project.description ?? '',
    fileLinks: fileLinksByProjectId.get(project.id) ?? [],
    id: project.id,
    lastUpdatedAt: getLatestUpdatedAt(workItems),
    name: project.name,
    objective: project.description ?? 'Client-visible workstream',
    progressPercent: getProjectProgress(project, workItems),
    status,
    targetDate: project.end_date ?? '',
    workItems,
  }
}

function sortProjects(a, b) {
  return getStatusPriority(a.status) - getStatusPriority(b.status)
    || new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime()
    || a.name.localeCompare(b.name)
}

export function getClientProjectsPage({
  clientId,
  projectId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const workItemsResult = listPublishedClientWorkItems({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })

  if (workItemsResult.status === 'error') {
    return workItemsResult
  }

  const actionsResult = listClientNeededActions({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const fileLinksResult = listClientVisibleFileLinks({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const fileLinksByProjectId = new Map()

  if (fileLinksResult.status === 'ready') {
    fileLinksResult.fileLinks.forEach((fileLink) => {
      if (!fileLink.projectId) {
        return
      }

      fileLinksByProjectId.set(fileLink.projectId, [
        ...(fileLinksByProjectId.get(fileLink.projectId) ?? []),
        fileLink,
      ])
    })
  }

  const projectsById = new Map(
    repositories.projects
      .listByClientId(normalizedClientId)
      .map((project) => [project.id, project]),
  )
  const workItemProjectIds = new Map(
    workItemsResult.workItems.map((workItem) => [workItem.id, workItem.projectId]),
  )
  const actionsByProjectId = groupActionsByProject({
    actions: actionsResult.status === 'ready' ? actionsResult.actions : [],
    workItemProjectIds,
  })
  const workItemsByProjectId = new Map()

  workItemsResult.workItems.forEach((workItem) => {
    const resolvedProjectId = workItem.projectId || 'general'

    workItemsByProjectId.set(resolvedProjectId, [
      ...(workItemsByProjectId.get(resolvedProjectId) ?? []),
      workItem,
    ])
  })

  const projects = [...workItemsByProjectId.entries()]
    .map(([resolvedProjectId, workItems]) => {
      const project = projectsById.get(resolvedProjectId) ?? {
        description: 'General client-visible work.',
        id: resolvedProjectId,
        name: 'General Work',
      }

      return createProjectViewModel({
        actionsByProjectId,
        fileLinksByProjectId,
        project,
        workItems,
      })
    })
    .sort(sortProjects)
  const selectedProject = projectId
    ? projects.find((project) => project.id === projectId) ?? null
    : projects[0] ?? null

  return {
    client: workItemsResult.client,
    projects,
    reason: projectId && !selectedProject ? 'project_not_found' : null,
    selectedProject,
    status: 'ready',
  }
}
