import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { REPORT_STATUSES } from '../../entities/report'
import { TASK_STATUSES } from '../../entities/task'
import { VISIBILITY } from '../../entities/update'

const VALID_CLIENT_STATUSES = new Set(Object.values(CLIENT_STATUSES))
const VALID_DASHBOARD_PROVIDERS = new Set(Object.values(DASHBOARD_PROVIDERS))
const VALID_DASHBOARD_STATUSES = new Set(Object.values(DASHBOARD_LINK_STATUSES))
const VALID_NEEDED_ACTION_STATUSES = new Set(Object.values(NEEDED_ACTION_STATUSES))
const VALID_REPORT_STATUSES = new Set(Object.values(REPORT_STATUSES))
const VALID_TASK_STATUSES = new Set(Object.values(TASK_STATUSES))
const VALID_VISIBILITY = new Set(Object.values(VISIBILITY))

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can edit client overviews.')
  }
}

function getEditableClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client overview is not available for this admin.')
  }

  return client
}

function normalizeText(value = '') {
  return String(value).trim()
}

function normalizeOptionalText(value = '') {
  return normalizeText(value)
}

function normalizeStatus(value, allowedStatuses, fallback, fieldName) {
  const status = value || fallback

  if (!allowedStatuses.has(status)) {
    throw new Error(`${fieldName} is invalid.`)
  }

  return status
}

function normalizeProgress(value) {
  const parsedValue = Number(value)

  if (Number.isNaN(parsedValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(parsedValue)))
}

function normalizeFocusItems(items = []) {
  return items
    .map(normalizeText)
    .filter(Boolean)
    .slice(0, 3)
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function timestamped(record, timestamp) {
  return {
    ...record,
    updated_at: timestamp,
  }
}

function createTimestamped(record, timestamp) {
  return {
    created_at: timestamp,
    ...timestamped(record, timestamp),
  }
}

function sortByOrderThenDate(a, b) {
  const orderA = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 0
  const orderB = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0

  if (orderA !== orderB) {
    return orderA - orderB
  }

  return new Date(b.updated_at ?? b.created_at ?? 0).getTime() - new Date(a.updated_at ?? a.created_at ?? 0).getTime()
}

function sortByUpdatedDesc(a, b) {
  return new Date(b.updated_at ?? b.created_at ?? 0).getTime() - new Date(a.updated_at ?? a.created_at ?? 0).getTime()
}

function sortReports(a, b) {
  return new Date(b.period_end ?? 0).getTime() - new Date(a.period_end ?? 0).getTime()
}

export function getAdminClientOverviewEditor({ clientId, repositories, viewer }) {
  const client = getEditableClient({ clientId, repositories, viewer })

  return {
    client: {
      id: client.id,
      name: client.name,
      overviewPublishedAt: client.overview_published_at ?? null,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      status: client.status,
      updatedAt: client.updated_at,
    },
    currentFocus: client.current_focus ?? [],
    dashboardLinks: repositories.dashboardLinks
      .listByClientId(clientId)
      .sort(sortByUpdatedDesc),
    neededActions: repositories.neededFromClient
      .listByClientId(clientId)
      .sort((a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()),
    projects: repositories.projects
      .listByClientId(clientId)
      .sort(sortByUpdatedDesc),
    reports: repositories.reports
      .listByClientId(clientId)
      .sort(sortReports),
    status: 'ready',
    tasks: repositories.tasks
      .listByClientId(clientId)
      .sort(sortByOrderThenDate),
    updates: repositories.updates
      .listByClientId(clientId)
      .sort(sortByUpdatedDesc),
  }
}

function upsertProjects({ clientId, idGenerator, projects = [], repositories, timestamp }) {
  projects
    .filter((project) => normalizeText(project.name))
    .forEach((project) => {
      const id = project.id || idGenerator()

      repositories.projects.upsert({
        client_id: clientId,
        description: normalizeOptionalText(project.description),
        end_date: normalizeOptionalText(project.end_date),
        id,
        name: normalizeText(project.name),
        progress_percent: normalizeProgress(project.progress_percent),
        start_date: normalizeOptionalText(project.start_date),
        status: normalizeOptionalText(project.status) || 'in_progress',
        ...(project.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function deleteRemovedClientRecords({ clientId, inputRecords = [], repository }) {
  const retainedIds = new Set(inputRecords.map((record) => record.id).filter(Boolean))

  repository
    .listByClientId(clientId)
    .forEach((record) => {
      if (!retainedIds.has(record.id)) {
        repository.deleteById(record.id)
      }
    })
}

function upsertTasks({ clientId, idGenerator, repositories, tasks = [], timestamp }) {
  tasks
    .filter((task) => normalizeText(task.title))
    .forEach((task, index) => {
      const visibility = normalizeStatus(
        task.visibility,
        VALID_VISIBILITY,
        task.client_visible ? VISIBILITY.CLIENT_VISIBLE : VISIBILITY.INTERNAL,
        'Task visibility',
      )
      const id = task.id || idGenerator()

      repositories.tasks.upsert({
        assignee_name: normalizeOptionalText(task.assignee_name),
        client_id: clientId,
        client_visible: visibility === VISIBILITY.CLIENT_VISIBLE,
        description: normalizeOptionalText(task.description),
        due_date: normalizeOptionalText(task.due_date),
        id,
        project_id: normalizeOptionalText(task.project_id),
        sort_order: Number.isFinite(Number(task.sort_order)) ? Number(task.sort_order) : (index + 1) * 10,
        status: normalizeStatus(task.status, VALID_TASK_STATUSES, TASK_STATUSES.TODO, 'Task status'),
        title: normalizeText(task.title),
        visibility,
        ...(task.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function upsertUpdates({ clientId, idGenerator, repositories, timestamp, updates = [], viewer }) {
  updates
    .filter((update) => normalizeText(update.title) || normalizeText(update.body))
    .forEach((update) => {
      const id = update.id || idGenerator()

      repositories.updates.upsert({
        body: normalizeOptionalText(update.body),
        client_id: clientId,
        created_by: update.created_by || viewer.userId,
        id,
        project_id: normalizeOptionalText(update.project_id),
        title: normalizeText(update.title) || 'Client update',
        visibility: normalizeStatus(update.visibility, VALID_VISIBILITY, VISIBILITY.CLIENT_VISIBLE, 'Update visibility'),
        ...(update.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function upsertNeededActions({ clientId, idGenerator, neededActions = [], repositories, timestamp }) {
  neededActions
    .filter((action) => normalizeText(action.title))
    .forEach((action) => {
      const id = action.id || idGenerator()

      repositories.neededFromClient.upsert({
        client_id: clientId,
        description: normalizeOptionalText(action.description),
        due_date: normalizeOptionalText(action.due_date),
        id,
        related_link: normalizeOptionalText(action.related_link),
        status: normalizeStatus(
          action.status,
          VALID_NEEDED_ACTION_STATUSES,
          NEEDED_ACTION_STATUSES.PENDING,
          'Needed action status',
        ),
        title: normalizeText(action.title),
        ...(action.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function upsertDashboardLinks({ clientId, dashboardLinks = [], idGenerator, repositories, timestamp }) {
  dashboardLinks
    .filter((dashboardLink) => normalizeText(dashboardLink.name) || normalizeText(dashboardLink.public_url))
    .forEach((dashboardLink) => {
      const id = dashboardLink.id || idGenerator()

      repositories.dashboardLinks.upsert({
        client_id: clientId,
        embed_url: normalizeOptionalText(dashboardLink.embed_url),
        fallback_message: normalizeOptionalText(dashboardLink.fallback_message) || 'Dashboard is being prepared.',
        id,
        name: normalizeText(dashboardLink.name) || 'Marketing Dashboard',
        provider: normalizeStatus(
          dashboardLink.provider,
          VALID_DASHBOARD_PROVIDERS,
          DASHBOARD_PROVIDERS.LOOKER_STUDIO,
          'Dashboard provider',
        ),
        public_url: normalizeOptionalText(dashboardLink.public_url),
        show_on_overview: Boolean(dashboardLink.show_on_overview),
        status: normalizeStatus(
          dashboardLink.status,
          VALID_DASHBOARD_STATUSES,
          DASHBOARD_LINK_STATUSES.DRAFT,
          'Dashboard status',
        ),
        visibility: normalizeStatus(dashboardLink.visibility, VALID_VISIBILITY, VISIBILITY.CLIENT_VISIBLE, 'Dashboard visibility'),
        ...(dashboardLink.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function upsertReports({ clientId, idGenerator, reports = [], repositories, timestamp }) {
  reports
    .filter((report) => normalizeText(report.title) || normalizeText(report.summary))
    .forEach((report) => {
      const id = report.id || idGenerator()
      const status = normalizeStatus(report.status, VALID_REPORT_STATUSES, REPORT_STATUSES.DRAFT, 'Report status')

      repositories.reports.upsert({
        client_decisions_needed: normalizeOptionalText(report.client_decisions_needed),
        client_id: clientId,
        dashboard_url: normalizeOptionalText(report.dashboard_url),
        id,
        next_actions: normalizeOptionalText(report.next_actions),
        pdf_url: normalizeOptionalText(report.pdf_url),
        period_end: normalizeOptionalText(report.period_end),
        period_start: normalizeOptionalText(report.period_start),
        problems: normalizeOptionalText(report.problems),
        published_at: status === REPORT_STATUSES.PUBLISHED ? (report.published_at || timestamp) : (report.published_at || null),
        status,
        summary: normalizeOptionalText(report.summary),
        title: normalizeText(report.title) || 'Monthly Summary',
        wins: normalizeOptionalText(report.wins),
        ...(report.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

export function saveAdminClientOverview({
  clientId,
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const client = getEditableClient({ clientId, repositories, viewer })
  const timestamp = now()
  const status = normalizeStatus(
    input.client?.status,
    VALID_CLIENT_STATUSES,
    client.status || CLIENT_STATUSES.ON_TRACK,
    'Client status',
  )

  repositories.clients.upsert({
    ...client,
    current_focus: normalizeFocusItems(input.currentFocus),
    status,
    updated_at: timestamp,
  })

  deleteRemovedClientRecords({ clientId, inputRecords: input.projects, repository: repositories.projects })
  deleteRemovedClientRecords({ clientId, inputRecords: input.tasks, repository: repositories.tasks })
  deleteRemovedClientRecords({ clientId, inputRecords: input.updates, repository: repositories.updates })
  deleteRemovedClientRecords({ clientId, inputRecords: input.neededActions, repository: repositories.neededFromClient })
  deleteRemovedClientRecords({ clientId, inputRecords: input.dashboardLinks, repository: repositories.dashboardLinks })
  deleteRemovedClientRecords({ clientId, inputRecords: input.reports, repository: repositories.reports })

  upsertProjects({ clientId, idGenerator, projects: input.projects, repositories, timestamp })
  upsertTasks({ clientId, idGenerator, repositories, tasks: input.tasks, timestamp })
  upsertUpdates({ clientId, idGenerator, repositories, timestamp, updates: input.updates, viewer })
  upsertNeededActions({ clientId, idGenerator, neededActions: input.neededActions, repositories, timestamp })
  upsertDashboardLinks({ clientId, dashboardLinks: input.dashboardLinks, idGenerator, repositories, timestamp })
  upsertReports({ clientId, idGenerator, reports: input.reports, repositories, timestamp })

  return getAdminClientOverviewEditor({ clientId, repositories, viewer })
}

export function publishAdminClientOverview({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const client = getEditableClient({ clientId, repositories, viewer })
  const timestamp = now()

  repositories.clients.upsert({
    ...client,
    overview_published_at: timestamp,
    updated_at: timestamp,
  })

  return getAdminClientOverviewEditor({ clientId, repositories, viewer })
}
