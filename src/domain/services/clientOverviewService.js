import { CLIENT_STATUS_META } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUS_META } from '../../entities/needed-from-client'
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
  return {
    clientResponse: action.client_response,
    description: action.description,
    dueDate: action.due_date,
    id: action.id,
    relatedLink: action.related_link,
    respondedAt: action.responded_at,
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

export function getClientOverview({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || !canAccessClient(viewer, clientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projects = repositories.projects
    .listByClientId(clientId)
    .map(mapProject)
    .sort((a, b) => b.progressPercent - a.progressPercent)

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const activeTasks = repositories.tasks
    .listByClientId(clientId)
    .filter(isActiveClientTask)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((task) => mapTask(task, projectsById.get(task.project_id)))

  const latestUpdate = repositories.updates
    .listByClientId(clientId)
    .filter(isUpdateVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'created_at'))[0] ?? null

  const neededActions = repositories.neededFromClient
    .listByClientId(clientId)
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map(mapNeededAction)

  const dashboard = repositories.dashboardLinks
    .listByClientId(clientId)
    .filter(isDashboardVisibleToClient)
    .sort((a, b) => Number(b.show_on_overview) - Number(a.show_on_overview))[0] ?? null

  const latestReport = repositories.reports
    .listByClientId(clientId)
    .filter(isReportVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'period_end'))[0] ?? null
  const currentFocus = client.current_focus ?? []
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
      status: client.status,
      statusMeta: getStatusMeta(client.status, CLIENT_STATUS_META),
    },
    currentFocus,
    dashboard: dashboard
      ? {
          embedUrl: dashboard.embed_url,
          fallbackMessage: dashboard.fallback_message,
          id: dashboard.id,
          isAvailable: dashboard.status === DASHBOARD_LINK_STATUSES.ACTIVE,
          name: dashboard.name,
          provider: dashboard.provider,
          publicUrl: dashboard.public_url,
          status: dashboard.status,
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
