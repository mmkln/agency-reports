import { CLIENT_TYPES } from '../../entities/client'
import { REPORT_STATUSES, REPORT_STATUS_META } from '../../entities/report'
import { canAccessClient } from '../policies/accessPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'
import {
  mapClinicReportSections,
  normalizeClinicReportSections,
} from './clinicReportTemplateService'

const VALID_REPORT_STATUSES = new Set(Object.values(REPORT_STATUSES))

function assertAgencyAdmin(viewer) {
  if (!hasAgencyAdminMembership(viewer)) {
    throw new Error('Only admins can manage reports.')
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

function normalizeOptionalUrl(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

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

function normalizeRequiredDate(value, fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  const timestamp = new Date(normalizedValue).getTime()

  if (Number.isNaN(timestamp)) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function normalizeStatus(value, fallback = REPORT_STATUSES.DRAFT) {
  const normalizedValue = value || fallback

  if (!VALID_REPORT_STATUSES.has(normalizedValue)) {
    throw new Error('Report status is invalid.')
  }

  return normalizedValue
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessClient(viewer, client.id)) {
    throw new Error('Account was not found.')
  }

  return client
}

function getEditableReport({ reportId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const report = repositories.reports.findById(reportId)

  if (!report) {
    throw new Error('Report was not found.')
  }

  getAdminClient({
    clientId: report.client_id,
    repositories,
    viewer,
  })

  return report
}

function mapReport({ client, report }) {
  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    clientDecisionsNeeded: report.client_decisions_needed ?? '',
    clientId: report.client_id,
    clinicSections: client.type === CLIENT_TYPES.CLINIC ? mapClinicReportSections(report.clinic_sections) : null,
    createdAt: report.created_at,
    dashboardUrl: report.dashboard_url ?? '',
    id: report.id,
    internalNotes: report.internal_notes ?? '',
    nextActions: report.next_actions ?? '',
    pdfUrl: report.pdf_url ?? '',
    periodEnd: report.period_end,
    periodStart: report.period_start,
    problems: report.problems ?? '',
    publishedAt: report.published_at ?? null,
    results: report.results ?? '',
    reviewedBy: report.reviewed_by ?? null,
    status: report.status,
    statusMeta: REPORT_STATUS_META[report.status] ?? {
      label: report.status,
      tone: 'neutral',
    },
    summary: report.summary ?? '',
    template: client.type === CLIENT_TYPES.CLINIC && report.clinic_sections ? CLIENT_TYPES.CLINIC : CLIENT_TYPES.GENERIC,
    title: report.title,
    updatedAt: report.updated_at,
    whatWeDid: report.what_we_did ?? '',
    wins: report.wins ?? '',
  }
}

function sortReports(a, b) {
  return a.client.name.localeCompare(b.client.name)
    || new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
    || a.title.localeCompare(b.title)
}

export function listAdminReports({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const clientsById = new Map(
    repositories.workspaces
      .list()
      .filter((client) => canAccessClient(viewer, client.id))
      .map((client) => [client.id, client]),
  )

  return repositories.reports
    .list()
    .filter((report) => clientsById.has(report.client_id))
    .map((report) => mapReport({
      client: clientsById.get(report.client_id),
      report,
    }))
    .sort(sortReports)
}

export function getAdminReport({ reportId, repositories, viewer }) {
  const report = getEditableReport({ reportId, repositories, viewer })
  const client = getAdminClient({
    clientId: report.client_id,
    repositories,
    viewer,
  })

  return mapReport({ client, report })
}

export function saveAdminReport({
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const existingReport = input.id
    ? getEditableReport({
        reportId: input.id,
        repositories,
        viewer,
      })
    : null
  const clientId = input.clientId || input.client_id || existingReport?.client_id
  const client = getAdminClient({ clientId, repositories, viewer })
  const title = normalizeText(input.title)
  const status = normalizeStatus(input.status, existingReport?.status || REPORT_STATUSES.DRAFT)
  const periodStart = normalizeRequiredDate(input.periodStart ?? input.period_start, 'Period start')
  const periodEnd = normalizeRequiredDate(input.periodEnd ?? input.period_end, 'Period end')
  const timestamp = now()

  if (!title) {
    throw new Error('Report title is required.')
  }

  if (new Date(periodEnd).getTime() < new Date(periodStart).getTime()) {
    throw new Error('Period end must be after period start.')
  }

  const report = {
    client_decisions_needed: normalizeText(input.clientDecisionsNeeded ?? input.client_decisions_needed),
    client_id: client.id,
    clinic_sections: client.type === CLIENT_TYPES.CLINIC
      ? normalizeClinicReportSections(input.clinicSections ?? input.clinic_sections)
      : null,
    created_at: existingReport?.created_at || timestamp,
    created_by: existingReport?.created_by || viewer.userId,
    dashboard_url: normalizeOptionalUrl(input.dashboardUrl ?? input.dashboard_url, 'Report dashboard URL'),
    id: existingReport?.id || idGenerator(),
    internal_notes: normalizeText(input.internalNotes ?? input.internal_notes),
    next_actions: normalizeText(input.nextActions ?? input.next_actions),
    pdf_url: normalizeOptionalUrl(input.pdfUrl ?? input.pdf_url, 'Report PDF URL'),
    period_end: periodEnd,
    period_start: periodStart,
    problems: normalizeText(input.problems),
    published_at: status === REPORT_STATUSES.PUBLISHED
      ? (input.publishedAt ?? input.published_at ?? existingReport?.published_at ?? timestamp)
      : (input.publishedAt ?? input.published_at ?? existingReport?.published_at ?? null),
    results: normalizeText(input.results),
    reviewed_by: input.reviewedBy ?? input.reviewed_by ?? existingReport?.reviewed_by ?? null,
    status,
    summary: normalizeText(input.summary),
    title,
    updated_at: timestamp,
    updated_by: viewer.userId,
    what_we_did: normalizeText(input.whatWeDid ?? input.what_we_did),
    wins: normalizeText(input.wins),
  }

  repositories.reports.upsert(report)

  return mapReport({ client, report })
}

export function updateAdminReportStatus({
  now = () => new Date().toISOString(),
  reportId,
  repositories,
  status,
  viewer,
}) {
  const report = getEditableReport({ reportId, repositories, viewer })

  return saveAdminReport({
    idGenerator: () => report.id,
    input: {
      ...report,
      status,
    },
    now,
    repositories,
    viewer,
  })
}

export function duplicateAdminReport({
  idGenerator,
  now = () => new Date().toISOString(),
  reportId,
  repositories,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const sourceReport = getEditableReport({ reportId, repositories, viewer })

  return saveAdminReport({
    idGenerator,
    input: {
      client_id: sourceReport.client_id,
      client_decisions_needed: sourceReport.client_decisions_needed,
      dashboard_url: sourceReport.dashboard_url,
      internal_notes: sourceReport.internal_notes,
      next_actions: sourceReport.next_actions,
      pdf_url: sourceReport.pdf_url,
      period_end: sourceReport.period_end,
      period_start: sourceReport.period_start,
      problems: sourceReport.problems,
      results: sourceReport.results,
      status: REPORT_STATUSES.DRAFT,
      summary: sourceReport.summary,
      title: `Copy of ${sourceReport.title}`,
      what_we_did: sourceReport.what_we_did,
      wins: sourceReport.wins,
      clinic_sections: sourceReport.clinic_sections,
    },
    now,
    repositories,
    viewer,
  })
}

export function deleteAdminReport({ reportId, repositories, viewer }) {
  getEditableReport({ reportId, repositories, viewer })

  return repositories.reports.deleteById(reportId)
}
