export const PORTAL_STORAGE_KEY = 'agency-reports.portal.v2'
export const PORTAL_STORAGE_SCHEMA_VERSION = 1

const TABLE_NAMES = Object.freeze([
  'activity_events',
  'clients',
  'client_invitations',
  'client_file_links',
  'client_memberships',
  'client_requests',
  'client_work_items',
  'clinic_locations',
  'clinic_profiles',
  'clinic_service_lines',
  'dashboard_links',
  'needed_from_client',
  'performance_dashboard_periods',
  'profiles',
  'projects',
  'reports',
  'tasks',
  'updates',
])

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createMemoryStorage() {
  const records = new Map()

  return {
    getItem(key) {
      return records.get(key) ?? null
    },
    removeItem(key) {
      records.delete(key)
    },
    setItem(key, value) {
      records.set(key, value)
    },
  }
}

function createSeedSnapshot(seedData) {
  const seedSnapshot = {
    ...clone(seedData),
    __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
  }

  for (const tableName of TABLE_NAMES) {
    if (!Array.isArray(seedSnapshot[tableName])) {
      seedSnapshot[tableName] = []
    }
  }

  return seedSnapshot
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeSeedPerformanceDashboardPeriod(record, seedRecord) {
  const existingContent = isPlainObject(record.content) ? record.content : {}
  const seedContent = isPlainObject(seedRecord.content) ? seedRecord.content : {}
  const existingCampaignExecution = isPlainObject(existingContent.campaign_execution)
    ? existingContent.campaign_execution
    : {}
  const seedCampaignExecution = isPlainObject(seedContent.campaign_execution)
    ? seedContent.campaign_execution
    : null
  const existingActivitySeries = Array.isArray(existingCampaignExecution.activity_series)
    ? existingCampaignExecution.activity_series
    : []

  if (!seedCampaignExecution || existingActivitySeries.length >= seedCampaignExecution.activity_series?.length) {
    return record
  }

  return {
    ...record,
    content: {
      ...seedContent,
      ...existingContent,
      campaign_execution: {
        ...seedCampaignExecution,
        ...existingCampaignExecution,
        activity_series: seedCampaignExecution.activity_series,
      },
    },
  }
}

function mergeSeedRecord(record, seedRecord, tableName) {
  if (tableName === 'performance_dashboard_periods') {
    return mergeSeedPerformanceDashboardPeriod(record, seedRecord)
  }

  return record
}

function mergeSeedRecords(records, seedRecords, tableName) {
  const existingRecords = Array.isArray(records) ? records : []
  const seedRecordsList = Array.isArray(seedRecords) ? seedRecords : []
  const existingIds = new Set(existingRecords.map((record) => record?.id).filter(Boolean))
  const missingSeedRecords = seedRecordsList.filter((record) => !existingIds.has(record.id))
  const seedRecordsById = new Map(seedRecordsList.map((record) => [record.id, record]))
  const mergedExistingRecords = existingRecords.map((record) => {
    const seedRecord = seedRecordsById.get(record?.id)

    return seedRecord ? mergeSeedRecord(record, seedRecord, tableName) : record
  })

  return [...mergedExistingRecords, ...clone(missingSeedRecords)]
}

function normalizeSnapshot(snapshot, seedData) {
  if (!isPlainObject(snapshot)) {
    return createSeedSnapshot(seedData)
  }

  const seedSnapshot = createSeedSnapshot(seedData)
  const normalizedSnapshot = {
    ...snapshot,
    __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
  }

  for (const tableName of TABLE_NAMES) {
    const seedTableRecords = Array.isArray(seedSnapshot[tableName]) ? seedSnapshot[tableName] : []
    const tableRecords = Array.isArray(snapshot[tableName])
      ? snapshot[tableName]
      : seedTableRecords

    normalizedSnapshot[tableName] = mergeSeedRecords(tableRecords, seedTableRecords, tableName)
  }

  return normalizedSnapshot
}

function createEntityRepository(tableName, readSnapshot, writeSnapshot) {
  return {
    findById(id) {
      return readSnapshot()[tableName].find((record) => record.id === id) ?? null
    },
    list() {
      return readSnapshot()[tableName]
    },
    listByClientId(clientId) {
      return readSnapshot()[tableName].filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const snapshot = readSnapshot()
      const table = snapshot[tableName]
      const index = table.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        table[index] = { ...table[index], ...record }
      } else {
        table.push(record)
      }

      writeSnapshot(snapshot)
      return record
    },
    deleteById(id) {
      const snapshot = readSnapshot()
      const table = snapshot[tableName]
      const nextTable = table.filter((item) => item.id !== id)

      if (nextTable.length === table.length) {
        return false
      }

      snapshot[tableName] = nextTable
      writeSnapshot(snapshot)
      return true
    },
  }
}

export function createLocalStoragePortalRepository({ seedData, storage } = {}) {
  const storageAdapter = storage ?? (typeof window !== 'undefined' ? window.localStorage : createMemoryStorage())

  function readSnapshot() {
    const rawSnapshot = storageAdapter.getItem(PORTAL_STORAGE_KEY)

    if (!rawSnapshot) {
      const seededSnapshot = createSeedSnapshot(seedData)
      storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(seededSnapshot))
      return seededSnapshot
    }

    try {
      const parsedSnapshot = JSON.parse(rawSnapshot)
      const normalizedSnapshot = normalizeSnapshot(parsedSnapshot, seedData)

      if (JSON.stringify(parsedSnapshot) !== JSON.stringify(normalizedSnapshot)) {
        storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(normalizedSnapshot))
      }

      return normalizedSnapshot
    } catch {
      const seededSnapshot = createSeedSnapshot(seedData)
      storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(seededSnapshot))
      return seededSnapshot
    }
  }

  function writeSnapshot(snapshot) {
    storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(normalizeSnapshot(snapshot, seedData)))
  }

  return {
    activityEvents: createEntityRepository('activity_events', readSnapshot, writeSnapshot),
    clients: createEntityRepository('clients', readSnapshot, writeSnapshot),
    clientFileLinks: createEntityRepository('client_file_links', readSnapshot, writeSnapshot),
    clientInvitations: createEntityRepository('client_invitations', readSnapshot, writeSnapshot),
    clientMemberships: createEntityRepository('client_memberships', readSnapshot, writeSnapshot),
    clientRequests: createEntityRepository('client_requests', readSnapshot, writeSnapshot),
    clientWorkItems: createEntityRepository('client_work_items', readSnapshot, writeSnapshot),
    clinicLocations: createEntityRepository('clinic_locations', readSnapshot, writeSnapshot),
    clinicProfiles: createEntityRepository('clinic_profiles', readSnapshot, writeSnapshot),
    clinicServiceLines: createEntityRepository('clinic_service_lines', readSnapshot, writeSnapshot),
    dashboardLinks: createEntityRepository('dashboard_links', readSnapshot, writeSnapshot),
    neededFromClient: createEntityRepository('needed_from_client', readSnapshot, writeSnapshot),
    performanceDashboardPeriods: createEntityRepository('performance_dashboard_periods', readSnapshot, writeSnapshot),
    profiles: {
      ...createEntityRepository('profiles', readSnapshot, writeSnapshot),
      findByUserId(userId) {
        return readSnapshot().profiles.find((profile) => profile.user_id === userId) ?? null
      },
    },
    projects: createEntityRepository('projects', readSnapshot, writeSnapshot),
    reports: createEntityRepository('reports', readSnapshot, writeSnapshot),
    reset() {
      storageAdapter.removeItem(PORTAL_STORAGE_KEY)
      return readSnapshot()
    },
    tasks: createEntityRepository('tasks', readSnapshot, writeSnapshot),
    updates: createEntityRepository('updates', readSnapshot, writeSnapshot),
  }
}
