import { CLIENT_STATUS_META } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUS_META } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUS_META } from '../../entities/task'
import { canAccessClient } from '../policies/accessPolicy'
import {
  isActiveClientTask,
  isDashboardVisibleToClient,
  isNeededActionVisibleToClient,
  isReportVisibleToClient,
  isUpdateVisibleToClient,
} from '../policies/visibilityPolicy'

function sortByDateDesc(a, b, fieldName) {
  return new Date(b[fieldName]).getTime() - new Date(a[fieldName]).getTime()
}

function getStatusMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function mapTask(task, project) {
  return {
    assigneeName: task.assignee_name,
    dueDate: task.due_date,
    id: task.id,
    projectName: project?.name ?? 'General',
    status: task.status,
    statusMeta: getStatusMeta(task.status, TASK_STATUS_META),
    title: task.title,
  }
}

function mapNeededAction(action) {
  const dueTime = action.due_date ? new Date(action.due_date).getTime() : null
  const now = new Date().getTime()

  return {
    clientResponse: action.client_response,
    description: action.description,
    dueDate: action.due_date,
    id: action.id,
    isOverdue: action.status === 'pending' && Boolean(dueTime) && dueTime < now,
    relatedLink: action.related_link,
    responseHistory: Array.isArray(action.response_history) ? action.response_history : [],
    respondedAt: action.responded_at,
    respondedBy: action.responded_by,
    resolvedAt: action.resolved_at,
    status: action.status,
    statusMeta: getStatusMeta(action.status, NEEDED_ACTION_STATUS_META),
    title: action.title,
  }
}

function mapProject(project) {
  return {
    description: project.description,
    id: project.id,
    name: project.name,
    progressPercent: project.progress_percent,
    status: project.status,
  }
}

function getSnapshotOverviewCollections({ client, snapshot }) {
  return {
    clientStatus: snapshot.client?.status ?? client.status,
    currentFocus: snapshot.currentFocus ?? [],
    dashboardLinks: snapshot.dashboardLinks ?? [],
    neededActions: snapshot.neededActions ?? [],
    projects: snapshot.projects ?? [],
    reports: snapshot.reports ?? [],
    tasks: snapshot.tasks ?? [],
    updates: snapshot.updates ?? [],
  }
}

function getOverviewCollections({ client, clientId, repositories, source, viewer }) {
  if (source === 'draft') {
    if (viewer?.role !== USER_ROLES.AGENCY_ADMIN) {
      return null
    }

    if (client.overview_draft) {
      return {
        clientStatus: client.overview_draft.client?.status ?? client.status,
        currentFocus: client.overview_draft.currentFocus ?? [],
        dashboardLinks: client.overview_draft.dashboardLinks ?? [],
        neededActions: client.overview_draft.neededActions ?? [],
        projects: client.overview_draft.projects ?? [],
        reports: client.overview_draft.reports ?? [],
        tasks: client.overview_draft.tasks ?? [],
        updates: client.overview_draft.updates ?? [],
      }
    }
  }

  if (client.overview_published_snapshot) {
    return getSnapshotOverviewCollections({
      client,
      snapshot: client.overview_published_snapshot,
    })
  }

  return {
    clientStatus: client.status,
    currentFocus: client.current_focus ?? [],
    dashboardLinks: repositories.dashboardLinks.listByClientId(clientId),
    neededActions: repositories.neededFromClient.listByClientId(clientId),
    projects: repositories.projects.listByClientId(clientId),
    reports: repositories.reports.listByClientId(clientId),
    tasks: repositories.tasks.listByClientId(clientId),
    updates: repositories.updates.listByClientId(clientId),
  }
}

export function getClientOverview({ clientId, repositories, source = 'published', viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const collections = getOverviewCollections({
    client,
    clientId,
    repositories,
    source,
    viewer,
  })

  if (!collections) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projects = collections.projects
    .map(mapProject)
    .sort((a, b) => b.progressPercent - a.progressPercent)

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const activeTasks = collections.tasks
    .filter(isActiveClientTask)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((task) => mapTask(task, projectsById.get(task.project_id)))

  const latestUpdate = collections.updates
    .filter(isUpdateVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'created_at'))[0] ?? null

  const neededActions = collections.neededActions
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => {
      const priority = {
        pending: 0,
        answered: 1,
        resolved: 2,
      }

      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        || new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()
    })
    .map(mapNeededAction)

  const dashboard = collections.dashboardLinks
    .filter(isDashboardVisibleToClient)
    .sort((a, b) => Number(b.show_on_overview) - Number(a.show_on_overview))[0] ?? null

  const latestReport = collections.reports
    .filter(isReportVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'period_end'))[0] ?? null
  const currentFocus = collections.currentFocus
  const isEmpty = currentFocus.length === 0
    && projects.length === 0
    && activeTasks.length === 0
    && !latestUpdate
    && neededActions.length === 0
    && !dashboard
    && !latestReport

  return {
    activeTasks,
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      status: collections.clientStatus,
      statusMeta: getStatusMeta(collections.clientStatus, CLIENT_STATUS_META),
    },
    currentFocus,
    dashboard: dashboard
      ? {
          description: dashboard.description ?? '',
          embedUrl: dashboard.embed_url,
          fallbackMessage: dashboard.fallback_message,
          id: dashboard.id,
          isAvailable: dashboard.status === DASHBOARD_LINK_STATUSES.ACTIVE,
          name: dashboard.name,
          provider: dashboard.provider,
          publicUrl: dashboard.public_url,
          status: dashboard.status,
          statusMeta: getStatusMeta(dashboard.status, DASHBOARD_LINK_STATUS_META),
        }
      : null,
    isEmpty,
    latestReport: latestReport
      ? {
          dashboardUrl: latestReport.dashboard_url,
          id: latestReport.id,
          pdfUrl: latestReport.pdf_url,
          periodEnd: latestReport.period_end,
          periodStart: latestReport.period_start,
          summary: latestReport.summary,
          title: latestReport.title,
        }
      : null,
    latestUpdate: latestUpdate
      ? {
          body: latestUpdate.body,
          id: latestUpdate.id,
          title: latestUpdate.title,
          updatedAt: latestUpdate.updated_at,
        }
      : null,
    neededActions,
    progressSummary: projects,
    status: 'ready',
  }
}
