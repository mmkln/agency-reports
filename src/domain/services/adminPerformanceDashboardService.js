import {
  createPerformanceDashboardPeriod,
  parsePerformanceDashboardJson,
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_CONFIDENCE_META,
  PERFORMANCE_DATA_MODE_META,
  validatePerformanceDashboardPeriod,
} from '../../entities/performance-dashboard'
import { USER_ROLES } from '../../entities/profile'

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can manage performance dashboards.')
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

function getAdminClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Client was not found for this agency.')
  }

  return client
}

function getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const period = repositories.performanceDashboardPeriods.findById(periodId)

  if (!period) {
    throw new Error('Performance dashboard period was not found.')
  }

  getAdminClient({
    clientId: period.client_id,
    repositories,
    viewer,
  })

  return period
}

function mapPerformanceDashboardPeriod({ client, period }) {
  return {
    accountManager: period.account_manager ?? '',
    agencyContact: period.agency_contact ?? '',
    attributionNote: period.attribution_note ?? '',
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
    },
    clientId: period.client_id,
    content: period.content,
    createdAt: period.created_at,
    createdBy: period.created_by ?? null,
    dataConfidence: period.data_confidence,
    dataConfidenceMeta: PERFORMANCE_DATA_CONFIDENCE_META[period.data_confidence] ?? {
      label: period.data_confidence,
      tone: 'neutral',
    },
    dataMode: period.data_mode,
    dataModeMeta: PERFORMANCE_DATA_MODE_META[period.data_mode] ?? {
      label: period.data_mode,
      tone: 'neutral',
    },
    id: period.id,
    lastUpdatedAt: period.last_updated_at,
    periodEnd: period.period_end,
    periodStart: period.period_start,
    publishedAt: period.published_at ?? null,
    sourceSummary: period.source_summary ?? '',
    status: period.status,
    statusMeta: PERFORMANCE_DASHBOARD_STATUS_META[period.status] ?? {
      label: period.status,
      tone: 'neutral',
    },
    title: period.title,
    updatedAt: period.updated_at,
    updatedBy: period.updated_by ?? null,
  }
}

function sortPeriods(a, b) {
  return a.client.name.localeCompare(b.client.name)
    || new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
    || a.title.localeCompare(b.title)
}

export function listAdminPerformanceDashboardPeriods({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  const clientsById = new Map(
    repositories.clients
      .list()
      .filter((client) => client.agency_id === viewer.agencyId)
      .map((client) => [client.id, client]),
  )

  return repositories.performanceDashboardPeriods
    .list()
    .filter((period) => clientsById.has(period.client_id))
    .map((period) => mapPerformanceDashboardPeriod({
      client: clientsById.get(period.client_id),
      period,
    }))
    .sort(sortPeriods)
}

export function getAdminPerformanceDashboardPeriod({ periodId, repositories, viewer }) {
  const period = getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer })
  const client = getAdminClient({
    clientId: period.client_id,
    repositories,
    viewer,
  })

  return mapPerformanceDashboardPeriod({ client, period })
}

export function saveAdminPerformanceDashboardPeriod({
  idGenerator,
  input,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const existingPeriod = input.id
    ? getEditablePerformanceDashboardPeriod({
        periodId: input.id,
        repositories,
        viewer,
      })
    : null
  const clientId = input.clientId || input.client_id || existingPeriod?.client_id
  const client = getAdminClient({ clientId, repositories, viewer })
  const title = normalizeText(input.title ?? existingPeriod?.title)
  const periodStart = normalizeRequiredDate(
    input.periodStart ?? input.period_start ?? existingPeriod?.period_start,
    'Period start',
  )
  const periodEnd = normalizeRequiredDate(
    input.periodEnd ?? input.period_end ?? existingPeriod?.period_end,
    'Period end',
  )
  const timestamp = now()

  if (!title) {
    throw new Error('Performance dashboard title is required.')
  }

  if (new Date(periodEnd).getTime() < new Date(periodStart).getTime()) {
    throw new Error('Period end must be after period start.')
  }

  const period = createPerformanceDashboardPeriod({
    idGenerator,
    input: {
      ...existingPeriod,
      ...input,
      account_manager: input.accountManager ?? input.account_manager ?? existingPeriod?.account_manager,
      agency_contact: input.agencyContact ?? input.agency_contact ?? existingPeriod?.agency_contact,
      attribution_note: input.attributionNote ?? input.attribution_note ?? existingPeriod?.attribution_note,
      client_id: client.id,
      content: input.content ?? existingPeriod?.content,
      created_at: existingPeriod?.created_at ?? timestamp,
      created_by: existingPeriod?.created_by ?? viewer.userId,
      data_confidence: input.dataConfidence ?? input.data_confidence ?? existingPeriod?.data_confidence,
      data_mode: input.dataMode ?? input.data_mode ?? existingPeriod?.data_mode,
      id: existingPeriod?.id ?? (input.id || undefined),
      last_updated_at: input.lastUpdatedAt ?? input.last_updated_at ?? existingPeriod?.last_updated_at,
      period_end: periodEnd,
      period_start: periodStart,
      published_at: input.publishedAt ?? input.published_at ?? existingPeriod?.published_at ?? null,
      source_summary: input.sourceSummary ?? input.source_summary ?? existingPeriod?.source_summary,
      status: input.status ?? existingPeriod?.status ?? PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title,
      updated_at: timestamp,
      updated_by: viewer.userId,
    },
    now,
  })

  repositories.performanceDashboardPeriods.upsert(period)

  return mapPerformanceDashboardPeriod({ client, period })
}

export function validateAdminPerformanceDashboardPeriod({ periodId, repositories, viewer }) {
  const period = getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer })

  return validatePerformanceDashboardPeriod(period, { mode: 'publish' })
}

export function publishAdminPerformanceDashboardPeriod({
  now = () => new Date().toISOString(),
  periodId,
  repositories,
  viewer,
}) {
  const period = getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer })
  const validation = validatePerformanceDashboardPeriod(period, { mode: 'publish' })

  if (!validation.isValid) {
    const fields = validation.errors.map((error) => error.path).join(', ')
    throw new Error(`Performance dashboard is not publishable: ${fields}`)
  }

  return saveAdminPerformanceDashboardPeriod({
    idGenerator: () => period.id,
    input: {
      ...period,
      published_at: period.published_at ?? now(),
      status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
    },
    now,
    repositories,
    viewer,
  })
}

export function updateAdminPerformanceDashboardPeriodStatus({
  now = () => new Date().toISOString(),
  periodId,
  repositories,
  status,
  viewer,
}) {
  const period = getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer })

  if (status === PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED) {
    return publishAdminPerformanceDashboardPeriod({
      now,
      periodId,
      repositories,
      viewer,
    })
  }

  return saveAdminPerformanceDashboardPeriod({
    idGenerator: () => period.id,
    input: {
      ...period,
      status,
    },
    now,
    repositories,
    viewer,
  })
}

export function duplicateAdminPerformanceDashboardPeriod({
  idGenerator,
  now = () => new Date().toISOString(),
  periodId,
  repositories,
  viewer,
}) {
  assertUuidGenerator(idGenerator)

  const sourcePeriod = getEditablePerformanceDashboardPeriod({ periodId, repositories, viewer })

  return saveAdminPerformanceDashboardPeriod({
    idGenerator,
    input: {
      ...sourcePeriod,
      id: undefined,
      published_at: null,
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title: `Copy of ${sourcePeriod.title}`,
    },
    now,
    repositories,
    viewer,
  })
}

export function importAdminPerformanceDashboardJson({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  rawJson,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  let parsedJson

  try {
    parsedJson = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
  } catch {
    return {
      errors: [
        {
          message: 'Dashboard JSON is not valid JSON.',
          path: '$',
          severity: 'error',
        },
      ],
      isValid: false,
      period: null,
      warnings: [],
    }
  }

  const timestamp = now()
  const importResult = parsePerformanceDashboardJson({
    ...parsedJson,
    client_id: input.clientId ?? input.client_id ?? parsedJson?.client_id,
    created_at: parsedJson?.created_at ?? timestamp,
    id: parsedJson?.id ?? idGenerator(),
    period_end: input.periodEnd ?? input.period_end ?? parsedJson?.period_end,
    period_start: input.periodStart ?? input.period_start ?? parsedJson?.period_start,
    updated_at: timestamp,
    updated_by: viewer.userId,
  })

  if (!importResult.period) {
    return importResult
  }

  if (!importResult.isValid) {
    return {
      ...importResult,
      period: null,
    }
  }

  const client = getAdminClient({
    clientId: importResult.period.client_id,
    repositories,
    viewer,
  })
  const period = {
    ...importResult.period,
    created_by: importResult.period.created_by ?? viewer.userId,
    status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
  }

  repositories.performanceDashboardPeriods.upsert(period)

  return {
    ...importResult,
    period: mapPerformanceDashboardPeriod({ client, period }),
  }
}
