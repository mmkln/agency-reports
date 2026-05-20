import {
  CLIENT_FILE_LINK_STATUSES,
  CLIENT_FILE_LINK_STATUS_META,
  CLIENT_FILE_LINK_TYPE_META,
  CLIENT_FILE_LINK_TYPES,
  normalizeClientFileLink,
} from '../../entities/client-file-link'
import { USER_ROLES } from '../../entities/profile'
import { VISIBILITY } from '../../entities/update'
import { canAccessClient } from '../policies/accessPolicy'
import {
  isClientFileLinkArchivedVisibleToClient,
  isClientFileLinkVisibleToClient,
} from '../policies/visibilityPolicy'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const TYPE_ORDER = Object.freeze([
  CLIENT_FILE_LINK_TYPES.DELIVERABLE,
  CLIENT_FILE_LINK_TYPES.CLIENT_UPLOAD,
  CLIENT_FILE_LINK_TYPES.REPORT,
  CLIENT_FILE_LINK_TYPES.BRAND_ASSET,
  CLIENT_FILE_LINK_TYPES.SHARED_LINK,
  CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN,
])

function getStatusMeta(status) {
  return CLIENT_FILE_LINK_STATUS_META[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function getTypeMeta(type) {
  return CLIENT_FILE_LINK_TYPE_META[type] ?? {
    label: type,
    tone: 'neutral',
  }
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function requireText(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeOptionalId(value = '') {
  return normalizeText(value) || null
}

function normalizeUrl(value = '', fieldName = 'URL') {
  const normalizedValue = requireText(value, fieldName)

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

function normalizeOptionalUrl(value = '', fieldName = 'URL') {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  return normalizeUrl(normalizedValue, fieldName)
}

function normalizeDisplayOrder(value) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeType(type) {
  return Object.values(CLIENT_FILE_LINK_TYPES).includes(type)
    ? type
    : CLIENT_FILE_LINK_TYPES.SHARED_LINK
}

function normalizeStatus(status) {
  return Object.values(CLIENT_FILE_LINK_STATUSES).includes(status)
    ? status
    : CLIENT_FILE_LINK_STATUSES.ACTIVE
}

function normalizeVisibility(visibility) {
  return visibility === VISIBILITY.INTERNAL ? VISIBILITY.INTERNAL : VISIBILITY.CLIENT_VISIBLE
}

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN) {
    throw new Error('Only admins can manage files and links.')
  }
}

function getAdminClient({ clientId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const client = repositories.clients.findById(clientId)

  if (!client) {
    throw new Error('Client was not found.')
  }

  return client
}

function createClientFileLinkId(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Client file link id must be a string uuid.')
  }

  return id
}

function getProjectMap(repositories) {
  return new Map((repositories.projects?.list() ?? []).map((project) => [project.id, project]))
}

function getReportMap(repositories) {
  return new Map((repositories.reports?.list() ?? []).map((report) => [report.id, report]))
}

function mapClientFileLink({ fileLink, projectsById, reportsById }) {
  const normalizedFileLink = normalizeClientFileLink(fileLink)
  const project = normalizedFileLink.project_id
    ? projectsById.get(normalizedFileLink.project_id)
    : null
  const report = normalizedFileLink.related_report_id
    ? reportsById.get(normalizedFileLink.related_report_id)
    : null

  return {
    clientId: normalizedFileLink.client_id,
    createdAt: normalizedFileLink.created_at,
    description: normalizedFileLink.description,
    displayOrder: normalizedFileLink.display_order,
    fileName: normalizedFileLink.file_name,
    id: normalizedFileLink.id,
    mimeType: normalizedFileLink.mime_type,
    projectId: normalizedFileLink.project_id,
    projectName: project?.name ?? '',
    relatedReportId: normalizedFileLink.related_report_id,
    relatedReportTitle: report?.title ?? '',
    relatedWorkItemId: normalizedFileLink.related_work_item_id,
    status: normalizedFileLink.status,
    statusMeta: getStatusMeta(normalizedFileLink.status),
    title: normalizedFileLink.title,
    type: normalizedFileLink.type,
    typeMeta: getTypeMeta(normalizedFileLink.type),
    updatedAt: normalizedFileLink.updated_at,
    uploadedByName: normalizedFileLink.uploaded_by_name,
    url: normalizedFileLink.url,
    visibility: normalizedFileLink.visibility,
  }
}

function sortFileLinks(a, b) {
  return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
    || (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    || new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    || a.title.localeCompare(b.title)
}

function groupByType(fileLinks) {
  return TYPE_ORDER.map((type) => ({
    count: fileLinks.filter((fileLink) => fileLink.type === type).length,
    items: fileLinks.filter((fileLink) => fileLink.type === type),
    label: CLIENT_FILE_LINK_TYPE_META[type].label,
    type,
  }))
}

function isArchivedFileLink(fileLink) {
  return fileLink.status === CLIENT_FILE_LINK_STATUSES.ARCHIVED
}

function getActiveFileLinks(fileLinks) {
  return fileLinks.filter((fileLink) => !isArchivedFileLink(fileLink))
}

function countFileLinksByType(fileLinks, type) {
  return fileLinks.filter((fileLink) => fileLink.type === type).length
}

function createClientFileLinkCounts(fileLinks) {
  const activeFileLinks = getActiveFileLinks(fileLinks)

  return {
    all: activeFileLinks.length,
    archived: fileLinks.filter(isArchivedFileLink).length,
    brandAssets: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.BRAND_ASSET),
    clientUploads: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.CLIENT_UPLOAD),
    contractsAdmin: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.CONTRACT_ADMIN),
    deliverables: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.DELIVERABLE),
    reports: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.REPORT),
    sharedLinks: countFileLinksByType(activeFileLinks, CLIENT_FILE_LINK_TYPES.SHARED_LINK),
  }
}

export function listClientVisibleFileLinks({
  clientId,
  includeArchived = false,
  projectId,
  repositories,
  viewer,
}) {
  const normalizedClientId = String(clientId || viewer?.clientId || '').trim()
  const client = repositories.clients.findById(normalizedClientId)

  if (!client || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projectsById = getProjectMap(repositories)
  const reportsById = getReportMap(repositories)
  const fileLinks = (repositories.clientFileLinks?.listByClientId(normalizedClientId) ?? [])
    .filter((fileLink) => isClientFileLinkVisibleToClient(fileLink)
      || (includeArchived && isClientFileLinkArchivedVisibleToClient(fileLink)))
    .map((fileLink) => mapClientFileLink({
      fileLink,
      projectsById,
      reportsById,
    }))
    .filter((fileLink) => !projectId || fileLink.projectId === projectId)
    .sort(sortFileLinks)

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    fileLinks,
    status: 'ready',
  }
}

export function getClientFilesLinksPage({
  clientId,
  projectId,
  repositories,
  viewer,
}) {
  const result = listClientVisibleFileLinks({
    clientId,
    includeArchived: true,
    projectId,
    repositories,
    viewer,
  })

  if (result.status === 'error') {
    return result
  }

  const activeFileLinks = getActiveFileLinks(result.fileLinks)

  return {
    ...result,
    counts: createClientFileLinkCounts(result.fileLinks),
    groups: groupByType(activeFileLinks),
    selectedProjectId: projectId ?? null,
  }
}

export function listAdminClientFileLinksWorkspace({
  clientId,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const normalizedClientId = normalizeText(clientId)
  const clients = repositories.clients.list()
  const client = normalizedClientId
    ? getAdminClient({ clientId: normalizedClientId, repositories, viewer })
    : clients[0] ?? null
  const selectedClientId = normalizedClientId || client?.id || ''
  const projectsById = getProjectMap(repositories)
  const reportsById = getReportMap(repositories)
  const fileLinks = (selectedClientId
    ? repositories.clientFileLinks?.listByClientId(selectedClientId) ?? []
    : repositories.clientFileLinks?.list() ?? [])
    .map((fileLink) => mapClientFileLink({
      fileLink,
      projectsById,
      reportsById,
    }))
    .sort(sortFileLinks)

  return {
    client,
    clients: clients.map((item) => ({
      id: item.id,
      name: item.name,
      portalSlug: item.portal_slug,
      status: item.status,
    })),
    counts: {
      all: fileLinks.length,
      archived: fileLinks.filter((fileLink) => fileLink.status === CLIENT_FILE_LINK_STATUSES.ARCHIVED).length,
      clientVisible: fileLinks.filter((fileLink) => fileLink.visibility === VISIBILITY.CLIENT_VISIBLE).length,
      internal: fileLinks.filter((fileLink) => fileLink.visibility === VISIBILITY.INTERNAL).length,
      unavailable: fileLinks.filter((fileLink) => fileLink.status === CLIENT_FILE_LINK_STATUSES.UNAVAILABLE).length,
    },
    fileLinks,
    status: 'ready',
  }
}

export function createClientFileLink({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const clientId = requireText(input.clientId, 'Client')
  const client = getAdminClient({ clientId, repositories, viewer })
  const timestamp = now()
  const fileLink = {
    client_id: client.id,
    created_at: timestamp,
    description: normalizeText(input.description),
    display_order: normalizeDisplayOrder(input.displayOrder),
    file_name: normalizeText(input.fileName),
    id: createClientFileLinkId(idGenerator),
    mime_type: normalizeText(input.mimeType),
    project_id: normalizeOptionalId(input.projectId),
    related_report_id: normalizeOptionalId(input.relatedReportId),
    related_work_item_id: normalizeOptionalId(input.relatedWorkItemId),
    status: normalizeStatus(input.status),
    title: requireText(input.title, 'Title'),
    type: normalizeType(input.type),
    updated_at: timestamp,
    uploaded_by_name: normalizeText(input.uploadedByName || viewer?.name),
    url: normalizeUrl(input.url, 'URL'),
    visibility: normalizeVisibility(input.visibility),
  }

  repositories.clientFileLinks.upsert(fileLink)

  return mapClientFileLink({
    fileLink,
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
  })
}

export function updateClientFileLink({
  fileLinkId,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const existingFileLink = repositories.clientFileLinks.findById(fileLinkId)

  if (!existingFileLink) {
    throw new Error('File or link was not found.')
  }

  getAdminClient({
    clientId: existingFileLink.client_id,
    repositories,
    viewer,
  })

  const updatedFileLink = {
    ...existingFileLink,
    description: normalizeText(input.description),
    display_order: normalizeDisplayOrder(input.displayOrder),
    file_name: normalizeText(input.fileName),
    mime_type: normalizeText(input.mimeType),
    project_id: normalizeOptionalId(input.projectId),
    related_report_id: normalizeOptionalId(input.relatedReportId),
    related_work_item_id: normalizeOptionalId(input.relatedWorkItemId),
    status: normalizeStatus(input.status),
    title: requireText(input.title, 'Title'),
    type: normalizeType(input.type),
    updated_at: now(),
    uploaded_by_name: normalizeText(input.uploadedByName),
    url: normalizeOptionalUrl(input.url, 'URL'),
    visibility: normalizeVisibility(input.visibility),
  }

  repositories.clientFileLinks.upsert(updatedFileLink)

  return mapClientFileLink({
    fileLink: updatedFileLink,
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
  })
}

export function archiveClientFileLink({
  fileLinkId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const existingFileLink = repositories.clientFileLinks.findById(fileLinkId)

  if (!existingFileLink) {
    throw new Error('File or link was not found.')
  }

  getAdminClient({
    clientId: existingFileLink.client_id,
    repositories,
    viewer,
  })

  const archivedFileLink = {
    ...existingFileLink,
    status: CLIENT_FILE_LINK_STATUSES.ARCHIVED,
    updated_at: now(),
  }

  repositories.clientFileLinks.upsert(archivedFileLink)

  return mapClientFileLink({
    fileLink: archivedFileLink,
    projectsById: getProjectMap(repositories),
    reportsById: getReportMap(repositories),
  })
}
