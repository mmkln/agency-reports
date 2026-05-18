import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'

export const PORTAL_STORAGE_SCHEMA_VERSION = 1

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function createPortalSeedSnapshot(seedData) {
  const seedSnapshot = {
    ...clone(seedData),
    __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
  }

  for (const tableName of PORTAL_TABLE_NAMES) {
    if (!Array.isArray(seedSnapshot[tableName])) {
      seedSnapshot[tableName] = []
    }
  }

  return seedSnapshot
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

  if (PORTAL_CLINIC_PUBLISH_STATE_TABLES.includes(tableName) && !record.publish_state && seedRecord.publish_state) {
    return {
      ...record,
      publish_state: seedRecord.publish_state,
      published_at: record.published_at ?? seedRecord.published_at ?? null,
      published_by: record.published_by ?? seedRecord.published_by ?? null,
    }
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

export function normalizePortalSnapshot(snapshot, seedData) {
  if (!isPlainObject(snapshot)) {
    return createPortalSeedSnapshot(seedData)
  }

  const seedSnapshot = createPortalSeedSnapshot(seedData)
  const normalizedSnapshot = {
    ...snapshot,
    __schemaVersion: PORTAL_STORAGE_SCHEMA_VERSION,
  }

  for (const tableName of PORTAL_TABLE_NAMES) {
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

export function createPortalRepositoryCollections({ readSnapshot, writeSnapshot }) {
  const repositories = Object.fromEntries(
    PORTAL_REPOSITORY_COLLECTIONS.map((collection) => [
      collection.key,
      createEntityRepository(collection.tableName, readSnapshot, writeSnapshot),
    ]),
  )

  return {
    ...repositories,
    profiles: {
      ...repositories.profiles,
      findByUserId(userId) {
        return readSnapshot().profiles.find((profile) => profile.user_id === userId) ?? null
      },
    },
  }
}

export function createPortalRepositoryFromSnapshot({ seedData, snapshot, version = null }) {
  let workingSnapshot = normalizePortalSnapshot(snapshot, seedData)

  const repositories = createPortalRepositoryCollections({
    readSnapshot() {
      return workingSnapshot
    },
    writeSnapshot(nextSnapshot) {
      workingSnapshot = normalizePortalSnapshot(nextSnapshot, seedData)
    },
  })

  return {
    getSnapshot() {
      return clone(workingSnapshot)
    },
    repositories,
    version,
  }
}
