import { CLIENT_STATUSES } from '../../entities/client'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../entities/dashboard-link'
import { REPORT_STATUSES } from '../../entities/report'
import { VISIBILITY } from '../../entities/update'
import { canAccessClient } from '../policies/accessPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'

const VALID_CLIENT_STATUSES = new Set(Object.values(CLIENT_STATUSES))
const VALID_DASHBOARD_PROVIDERS = new Set(Object.values(DASHBOARD_PROVIDERS))
const VALID_DASHBOARD_STATUSES = new Set(Object.values(DASHBOARD_LINK_STATUSES))
const VALID_REPORT_STATUSES = new Set(Object.values(REPORT_STATUSES))
const VALID_VISIBILITY = new Set(Object.values(VISIBILITY))

function assertAgencyAdmin(viewer) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can edit workspace overviews.')
  }
}

function getEditableClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessClient(viewer, client.id)) {
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

function normalizeOptionalDate(value = '', fieldName) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return ''
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function normalizeOptionalUrl(value = '', fieldName) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol.')
    }
  } catch {
    throw new Error(`${fieldName} must be a valid http(s) URL.`)
  }

  return normalizedValue
}

function normalizeSortOrder(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback
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
    throw new Error('Project progress must be a number from 0 to 100.')
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

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getClientWorkItems({ clientId, repositories }) {
  return repositories.clientWorkItems?.listByClientId?.(clientId)
    ?.sort(sortByUpdatedDesc) ?? []
}

function readPublishedAdminClientOverviewEditor({ client, clientId, repositories }) {
  return {
    client: {
      id: client.id,
      name: client.name,
      hasDraft: Boolean(client.overview_draft),
      overviewDraftSavedAt: client.overview_draft_saved_at ?? client.overview_draft?.saved_at ?? null,
      overviewDraftSavedBy: client.overview_draft_saved_by ?? client.overview_draft?.saved_by ?? null,
      overviewPublishedAt: client.overview_published_at ?? null,
      overviewPublishedBy: client.overview_published_by ?? null,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      status: client.status,
      updatedAt: client.updated_at,
    },
    clientWorkItems: getClientWorkItems({ clientId, repositories }),
    currentFocus: client.current_focus ?? [],
    dashboardLinks: repositories.dashboardLinks
      .listByClientId(clientId)
      .sort(sortByUpdatedDesc),
    neededActions: repositories.neededFromClient
      .listByClientId(clientId)
      .sort((a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()),
    projects: repositories.projects
      .listByClientId(clientId)
      .sort(sortByOrderThenDate),
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

function readDraftAdminClientOverviewEditor({ client, clientId, draft, repositories }) {
  return {
    client: {
      id: client.id,
      name: client.name,
      hasDraft: true,
      overviewDraftSavedAt: client.overview_draft_saved_at ?? draft.saved_at ?? null,
      overviewDraftSavedBy: client.overview_draft_saved_by ?? draft.saved_by ?? null,
      overviewPublishedAt: client.overview_published_at ?? null,
      overviewPublishedBy: client.overview_published_by ?? null,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      status: draft.client?.status ?? client.status,
      updatedAt: client.updated_at,
    },
    clientWorkItems: getClientWorkItems({ clientId, repositories }),
    currentFocus: clone(draft.currentFocus ?? []),
    dashboardLinks: clone(draft.dashboardLinks ?? []).sort(sortByUpdatedDesc),
    neededActions: repositories.neededFromClient
      .listByClientId(clientId)
      .sort((a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()),
    projects: clone(draft.projects ?? []).sort(sortByOrderThenDate),
    reports: clone(draft.reports ?? []).sort(sortReports),
    status: 'ready',
    tasks: repositories.tasks
      .listByClientId(clientId)
      .sort(sortByOrderThenDate),
    updates: clone(draft.updates ?? []).sort(sortByUpdatedDesc),
  }
}

export function getAdminClientOverviewEditor({ clientId, repositories, viewer }) {
  const client = getEditableClient({ clientId, repositories, viewer })

  if (client.overview_draft) {
    return readDraftAdminClientOverviewEditor({
      client,
      clientId,
      draft: client.overview_draft,
      repositories,
    })
  }

  return readPublishedAdminClientOverviewEditor({ client, clientId, repositories })
}

function upsertProjects({ clientId, idGenerator, projects = [], repositories, timestamp }) {
  projects
    .filter((project) => normalizeText(project.name))
    .forEach((project) => {
      const id = project.id || idGenerator()

      repositories.projects.upsert({
        client_id: clientId,
        description: normalizeOptionalText(project.description),
        end_date: normalizeOptionalDate(project.end_date, 'Project end date'),
        id,
        name: normalizeText(project.name),
        progress_percent: normalizeProgress(project.progress_percent),
        sort_order: normalizeSortOrder(project.sort_order, (projects.indexOf(project) + 1) * 10),
        start_date: normalizeOptionalDate(project.start_date, 'Project start date'),
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

function upsertUpdates({ clientId, idGenerator, repositories, timestamp, updates = [], viewer }) {
  updates
    .forEach((update) => {
      const title = normalizeText(update.title)
      const body = normalizeOptionalText(update.body)
      const visibility = normalizeStatus(update.visibility, VALID_VISIBILITY, VISIBILITY.CLIENT_VISIBLE, 'Update visibility')

      if (!title && !body) {
        return
      }

      if (visibility === VISIBILITY.CLIENT_VISIBLE && !body) {
        throw new Error('Client-visible updates must include update body text.')
      }

      const id = update.id || idGenerator()

      repositories.updates.upsert({
        body,
        client_id: clientId,
        created_by: update.created_by || viewer.userId,
        id,
        project_id: normalizeOptionalText(update.project_id),
        title: title || 'Client update',
        visibility,
        ...(update.id ? timestamped({}, timestamp) : createTimestamped({}, timestamp)),
      })
    })
}

function upsertDashboardLinks({ clientId, dashboardLinks = [], idGenerator, repositories, timestamp }) {
  dashboardLinks
    .filter((dashboardLink) => (
      normalizeText(dashboardLink.name)
      || normalizeText(dashboardLink.public_url)
      || normalizeText(dashboardLink.embed_url)
    ))
    .forEach((dashboardLink) => {
      const id = dashboardLink.id || idGenerator()
      const embedUrl = normalizeOptionalUrl(dashboardLink.embed_url, 'Dashboard embed URL')
      const publicUrl = normalizeOptionalUrl(dashboardLink.public_url, 'Dashboard public URL')
      const status = normalizeStatus(
        dashboardLink.status,
        VALID_DASHBOARD_STATUSES,
        DASHBOARD_LINK_STATUSES.DRAFT,
        'Dashboard status',
      )

      if (
        [DASHBOARD_LINK_STATUSES.ACTIVE, DASHBOARD_LINK_STATUSES.UNAVAILABLE].includes(status)
        && !embedUrl
        && !publicUrl
      ) {
        throw new Error('Active or unavailable dashboards must include a public or embed URL.')
      }

      repositories.dashboardLinks.upsert({
        client_id: clientId,
        description: normalizeOptionalText(dashboardLink.description),
        display_order: normalizeSortOrder(dashboardLink.display_order, 0),
        embed_url: embedUrl,
        fallback_message: normalizeOptionalText(dashboardLink.fallback_message) || 'Dashboard is being prepared.',
        id,
        last_checked_at: dashboardLink.last_checked_at || null,
        name: normalizeText(dashboardLink.name) || 'Marketing Dashboard',
        provider: normalizeStatus(
          dashboardLink.provider,
          VALID_DASHBOARD_PROVIDERS,
          DASHBOARD_PROVIDERS.LOOKER_STUDIO,
          'Dashboard provider',
        ),
        public_url: publicUrl,
        show_on_overview: Boolean(dashboardLink.show_on_overview),
        status,
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
        dashboard_url: normalizeOptionalUrl(report.dashboard_url, 'Report dashboard URL'),
        id,
        next_actions: normalizeOptionalText(report.next_actions),
        pdf_url: normalizeOptionalUrl(report.pdf_url, 'Report PDF URL'),
        period_end: normalizeOptionalDate(report.period_end, 'Report period end'),
        period_start: normalizeOptionalDate(report.period_start, 'Report period start'),
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

  const validationRepositories = createMemoryRepositoriesFrom(repositories)
  const timestamp = now()
  const draftEditor = materializeAdminClientOverview({
    clientId,
    idGenerator,
    input,
    repositories: validationRepositories,
    timestamp,
    viewer,
  })
  const client = getEditableClient({ clientId, repositories, viewer })

  repositories.workspaces.upsert({
    ...client,
    overview_draft: createOverviewDraftSnapshot({
      editor: draftEditor,
      savedAt: timestamp,
      savedBy: viewer.userId,
    }),
    overview_draft_saved_at: timestamp,
    overview_draft_saved_by: viewer.userId,
    updated_at: timestamp,
  })

  return getAdminClientOverviewEditor({ clientId, repositories, viewer })
}

function materializeAdminClientOverview({
  clientId,
  idGenerator,
  input,
  repositories,
  timestamp,
  viewer,
}) {
  const client = getEditableClient({ clientId, repositories, viewer })
  const status = normalizeStatus(
    input.client?.status,
    VALID_CLIENT_STATUSES,
    client.status || CLIENT_STATUSES.ON_TRACK,
    'Client status',
  )

  repositories.workspaces.upsert({
    ...client,
    current_focus: normalizeFocusItems(input.currentFocus),
    status,
    updated_at: timestamp,
  })

  deleteRemovedClientRecords({ clientId, inputRecords: input.projects, repository: repositories.projects })
  deleteRemovedClientRecords({ clientId, inputRecords: input.updates, repository: repositories.updates })
  deleteRemovedClientRecords({ clientId, inputRecords: input.dashboardLinks, repository: repositories.dashboardLinks })
  deleteRemovedClientRecords({ clientId, inputRecords: input.reports, repository: repositories.reports })

  upsertProjects({ clientId, idGenerator, projects: input.projects, repositories, timestamp })
  upsertUpdates({ clientId, idGenerator, repositories, timestamp, updates: input.updates, viewer })
  upsertDashboardLinks({ clientId, dashboardLinks: input.dashboardLinks, idGenerator, repositories, timestamp })
  upsertReports({ clientId, idGenerator, reports: input.reports, repositories, timestamp })

  return readPublishedAdminClientOverviewEditor({
    client: repositories.workspaces.findById(clientId),
    clientId,
    repositories,
  })
}

function createOverviewDraftSnapshot({ editor, savedAt, savedBy }) {
  return {
    client: {
      status: editor.client.status,
    },
    currentFocus: clone(editor.currentFocus),
    dashboardLinks: clone(editor.dashboardLinks),
    projects: clone(editor.projects),
    reports: clone(editor.reports),
    saved_at: savedAt,
    saved_by: savedBy,
    updates: clone(editor.updates),
  }
}

function createMemoryEntityRepository(initialRecords = []) {
  const records = clone(initialRecords)

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

      return record
    },
    deleteById(id) {
      const index = records.findIndex((record) => record.id === id)

      if (index < 0) {
        return false
      }

      records.splice(index, 1)
      return true
    },
  }
}

function createMemoryRepositoriesFrom(repositories) {
  const clients = createMemoryEntityRepository(repositories.workspaces.list())

  return {
    clients,
    workspaces: clients,
    dashboardLinks: createMemoryEntityRepository(repositories.dashboardLinks.list()),
    neededFromClient: createMemoryEntityRepository(repositories.neededFromClient.list()),
    projects: createMemoryEntityRepository(repositories.projects.list()),
    reports: createMemoryEntityRepository(repositories.reports.list()),
    tasks: createMemoryEntityRepository(repositories.tasks.list()),
    updates: createMemoryEntityRepository(repositories.updates.list()),
  }
}

export function publishAdminClientOverview({
  clientId,
  idGenerator = () => {
    throw new Error('idGenerator is required.')
  },
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const client = getEditableClient({ clientId, repositories, viewer })
  const timestamp = now()
  const draft = client.overview_draft ?? createOverviewDraftSnapshot({
    editor: readPublishedAdminClientOverviewEditor({ client, clientId, repositories }),
    savedAt: timestamp,
    savedBy: viewer.userId,
  })

  materializeAdminClientOverview({
    clientId,
    idGenerator,
    input: draft,
    repositories,
    timestamp,
    viewer,
  })

  const publishedClient = repositories.workspaces.findById(clientId)

  repositories.workspaces.upsert({
    ...publishedClient,
    overview_draft: null,
    overview_draft_saved_at: null,
    overview_draft_saved_by: null,
    overview_published_at: timestamp,
    overview_published_by: viewer.userId,
    overview_published_snapshot: {
      ...draft,
      published_at: timestamp,
      published_by: viewer.userId,
    },
    updated_at: timestamp,
  })

  return getAdminClientOverviewEditor({ clientId, repositories, viewer })
}

export function discardAdminClientOverviewDraft({
  clientId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const client = getEditableClient({ clientId, repositories, viewer })
  const timestamp = now()

  repositories.workspaces.upsert({
    ...client,
    overview_draft: null,
    overview_draft_saved_at: null,
    overview_draft_saved_by: null,
    updated_at: timestamp,
  })

  return getAdminClientOverviewEditor({ clientId, repositories, viewer })
}

export const restoreAdminClientOverviewFromPublished = discardAdminClientOverviewDraft
