import { CLIENT_WORK_ITEM_STATUSES } from '../../entities/client-work-item'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { canAccessClient } from '../policies/accessPolicy'
import { getClientDashboardPage } from './clientDashboardService'
import { listClientVisibleFileLinks } from './clientFilesLinksService'
import { getClientReportsPage } from './clientReportsService'
import { listClientVisibleUpdates } from './clientUpdatesService'
import { listPublishedClientWorkItems } from './clientWorkItemService'
import { listClientNeededActions } from './neededFromClientService'

export const CLIENT_PROJECT_FILTERS = Object.freeze({
  ACTIVE: 'active',
  ALL: 'all',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
  WAITING_ON_ME: 'waiting_on_me',
})

const VALID_PROJECT_FILTERS = new Set(Object.values(CLIENT_PROJECT_FILTERS))

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

function getProjectClientState({ clientActions, project, workItems }) {
  if (project.status === 'archived') {
    return CLIENT_PROJECT_FILTERS.ARCHIVED
  }

  if (clientActions.some((action) => action.status === NEEDED_ACTION_STATUSES.PENDING)) {
    return CLIENT_PROJECT_FILTERS.WAITING_ON_ME
  }

  if (workItems.length && workItems.every((item) => item.status === CLIENT_WORK_ITEM_STATUSES.DELIVERED)) {
    return CLIENT_PROJECT_FILTERS.COMPLETED
  }

  return CLIENT_PROJECT_FILTERS.ACTIVE
}

function createProjectTimeline({ project, workItems }) {
  const hasWorkItems = workItems.length > 0
  const deliveredCount = workItems.filter((item) => item.status === CLIENT_WORK_ITEM_STATUSES.DELIVERED).length
  const inProgressCount = workItems.filter((item) => [
    CLIENT_WORK_ITEM_STATUSES.IN_PROGRESS,
    CLIENT_WORK_ITEM_STATUSES.NEEDS_ATTENTION,
    CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT,
  ].includes(item.status)).length
  const hasDelivered = deliveredCount > 0
  const allDelivered = hasWorkItems && deliveredCount === workItems.length

  return [
    {
      date: project.start_date ?? '',
      id: 'kickoff',
      label: 'Kickoff',
      status: hasWorkItems ? 'completed' : 'planned',
    },
    {
      date: '',
      id: 'research',
      label: 'Research',
      status: hasWorkItems ? 'completed' : 'planned',
    },
    {
      date: '',
      id: 'production',
      label: 'Production',
      status: inProgressCount || hasDelivered ? 'in_progress' : 'planned',
    },
    {
      date: '',
      id: 'review',
      label: 'Review',
      status: workItems.some((item) => item.status === CLIENT_WORK_ITEM_STATUSES.WAITING_CLIENT) ? 'in_progress' : hasDelivered ? 'completed' : 'planned',
    },
    {
      date: project.end_date ?? '',
      id: 'launch',
      label: 'Launch / Reporting',
      status: allDelivered ? 'completed' : 'planned',
    },
  ]
}

function createClientRelevantBlockers(actions) {
  return actions
    .filter((action) => action.status === NEEDED_ACTION_STATUSES.PENDING)
    .map((action) => ({
      dueDate: action.dueDate,
      id: action.id,
      impactIfDelayed: action.impactIfDelayed || 'This may delay project progress.',
      title: action.title,
      whyNeeded: action.whyNeeded || action.description,
    }))
}

function createRelatedResultLinks({ clientId, dashboardPage, reportsPage }) {
  const links = []

  if (dashboardPage?.dashboard) {
    links.push({
      href: `/client/reports-dashboards?clientId=${clientId}&dashboardId=${dashboardPage.dashboard.id}#source-dashboard`,
      id: `dashboard-${dashboardPage.dashboard.id}`,
      label: dashboardPage.dashboard.name,
      type: 'Source dashboard',
    })
  }

  if (reportsPage?.latestReport) {
    links.push({
      href: `/client/reports-dashboards?clientId=${clientId}&reportId=${reportsPage.latestReport.id}#report-archive`,
      id: `report-${reportsPage.latestReport.id}`,
      label: reportsPage.latestReport.title,
      type: 'Latest report',
    })
  }

  return links
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

function groupPendingActionsByWorkItem(actions) {
  const actionsByWorkItemId = new Map()

  actions
    .filter((action) => (
      action.relatedWorkItemId
      && action.status === NEEDED_ACTION_STATUSES.PENDING
    ))
    .forEach((action) => {
      actionsByWorkItemId.set(action.relatedWorkItemId, [
        ...(actionsByWorkItemId.get(action.relatedWorkItemId) ?? []),
        action,
      ])
    })

  return actionsByWorkItemId
}

function attachWorkItemActions({ actionsByWorkItemId, workItems }) {
  return workItems.map((item) => ({
    ...item,
    clientActions: actionsByWorkItemId.get(item.id) ?? [],
  }))
}

function createProjectViewModel({
  actionsByProjectId,
  actionsByWorkItemId,
  clientId,
  dashboardPage,
  fileLinksByProjectId,
  project,
  projectUpdatesByProjectId,
  reportsPage,
  workItems,
}) {
  const openActions = actionsByProjectId.get(project.id) ?? []
  const workItemsWithActions = attachWorkItemActions({
    actionsByWorkItemId,
    workItems,
  })
  const status = getProjectStatus(workItems)
  const clientState = getProjectClientState({
    clientActions: openActions,
    project,
    workItems,
  })

  return {
    activeWorkItems: workItemsWithActions.filter((item) => item.status !== CLIENT_WORK_ITEM_STATUSES.DELIVERED),
    blockers: createClientRelevantBlockers(openActions),
    clientActions: openActions,
    clientState,
    description: project.description ?? '',
    fileLinks: fileLinksByProjectId.get(project.id) ?? [],
    id: project.id,
    lastUpdatedAt: getLatestUpdatedAt(workItems),
    name: project.name,
    objective: project.description ?? 'Client-visible workstream',
    progressPercent: getProjectProgress(project, workItems),
    relatedResultLinks: createRelatedResultLinks({
      clientId,
      dashboardPage,
      reportsPage,
    }),
    status,
    targetDate: project.end_date ?? '',
    timeline: createProjectTimeline({
      project,
      workItems,
    }),
    updates: projectUpdatesByProjectId.get(project.id) ?? [],
    workItems: workItemsWithActions,
  }
}

function sortProjects(a, b) {
  return getStatusPriority(a.status) - getStatusPriority(b.status)
    || new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime()
    || a.name.localeCompare(b.name)
}

function normalizeFilter(filter) {
  return VALID_PROJECT_FILTERS.has(filter) ? filter : CLIENT_PROJECT_FILTERS.ALL
}

function filterProjects(projects, activeFilter) {
  if (activeFilter === CLIENT_PROJECT_FILTERS.ALL) {
    return projects
  }

  return projects.filter((project) => project.clientState === activeFilter)
}

function countProjects(projects) {
  return {
    active: projects.filter((project) => project.clientState === CLIENT_PROJECT_FILTERS.ACTIVE).length,
    all: projects.length,
    archived: projects.filter((project) => project.clientState === CLIENT_PROJECT_FILTERS.ARCHIVED).length,
    completed: projects.filter((project) => project.clientState === CLIENT_PROJECT_FILTERS.COMPLETED).length,
    waitingOnMe: projects.filter((project) => project.clientState === CLIENT_PROJECT_FILTERS.WAITING_ON_ME).length,
  }
}

export function getClientProjectsPage({
  clientId,
  filter,
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
  const actionsByWorkItemId = groupPendingActionsByWorkItem(
    actionsResult.status === 'ready' ? actionsResult.actions : [],
  )
  const updatesResult = listClientVisibleUpdates({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const projectUpdatesByProjectId = new Map()

  if (updatesResult.status === 'ready') {
    updatesResult.updates.forEach((update) => {
      if (!update.projectId) {
        return
      }

      projectUpdatesByProjectId.set(update.projectId, [
        ...(projectUpdatesByProjectId.get(update.projectId) ?? []),
        update,
      ])
    })
  }
  const dashboardPage = getClientDashboardPage({
    clientId: normalizedClientId,
    repositories,
    viewer,
  })
  const reportsPage = getClientReportsPage({
    clientId: normalizedClientId,
    repositories,
    viewer,
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
        actionsByWorkItemId,
        clientId: normalizedClientId,
        dashboardPage: dashboardPage.status === 'ready' ? dashboardPage : null,
        fileLinksByProjectId,
        project,
        projectUpdatesByProjectId,
        reportsPage: reportsPage.status === 'ready' ? reportsPage : null,
        workItems,
      })
    })
    .sort(sortProjects)
  const activeFilter = normalizeFilter(filter)
  const filteredProjects = filterProjects(projects, activeFilter)
  const selectedProject = projectId
    ? projects.find((project) => project.id === projectId) ?? null
    : filteredProjects[0] ?? projects[0] ?? null

  return {
    client: workItemsResult.client,
    counts: countProjects(projects),
    filter: activeFilter,
    projects: filteredProjects,
    reason: projectId && !selectedProject ? 'project_not_found' : null,
    selectedProject,
    status: 'ready',
  }
}
