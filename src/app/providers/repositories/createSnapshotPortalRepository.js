import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'

export const PORTAL_STORAGE_SCHEMA_VERSION = 1

const LEGACY_TABLE_ALIASES = Object.freeze({
  workspaces: 'clients',
  workspace_invitations: 'client_invitations',
  workspace_memberships: 'client_memberships',
})

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

  for (const legacyTableName of Object.values(LEGACY_TABLE_ALIASES)) {
    delete seedSnapshot[legacyTableName]
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
    const legacyTableName = LEGACY_TABLE_ALIASES[tableName]
    const tableRecords = Array.isArray(snapshot[tableName])
      ? snapshot[tableName]
      : Array.isArray(snapshot[legacyTableName])
        ? snapshot[legacyTableName]
      : seedTableRecords

    normalizedSnapshot[tableName] = mergeSeedRecords(tableRecords, seedTableRecords, tableName)
  }

  for (const legacyTableName of Object.values(LEGACY_TABLE_ALIASES)) {
    delete normalizedSnapshot[legacyTableName]
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
      return this.listByWorkspaceId(clientId)
    },
    listByWorkspaceId(workspaceId) {
      if (tableName === 'workspaces') {
        const workspace = this.findById(workspaceId)

        return workspace ? [workspace] : []
      }

      return readSnapshot()[tableName].filter((record) => (
        record.workspace_id === workspaceId || record.client_id === workspaceId
      ))
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

function withWorkspaceMembershipAliases(record) {
  if (!record) {
    return null
  }

  const workspaceRole = record.workspace_role
    ?? (record.role === 'owner' ? 'workspace_owner' : null)
    ?? (record.role === 'viewer' ? 'workspace_viewer' : null)
    ?? record.role

  const normalizedRecord = {
    ...record,
    client_id: record.client_id ?? record.workspace_id,
    workspace_id: record.workspace_id ?? record.client_id,
  }

  if (workspaceRole) {
    normalizedRecord.role = workspaceRole
    normalizedRecord.workspace_role = workspaceRole
  }

  return normalizedRecord
}

function createWorkspaceRepositoryAdapter(workspacesRepository) {
  return {
    deleteById: (id) => workspacesRepository.deleteById(id),
    findById: (id) => workspacesRepository.findById(id),
    list: () => workspacesRepository.list(),
    listByClientId: (clientId) => workspacesRepository.listByClientId(clientId),
    listByWorkspaceId: (workspaceId) => workspacesRepository.listByWorkspaceId(workspaceId),
    upsert: (record) => workspacesRepository.upsert(record),
  }
}

function createWorkspaceMembershipRepositoryAdapter(workspaceMembershipsRepository) {
  return {
    deleteById: (id) => workspaceMembershipsRepository.deleteById(id),
    findById(id) {
      return withWorkspaceMembershipAliases(workspaceMembershipsRepository.findById(id))
    },
    list() {
      return workspaceMembershipsRepository.list().map(withWorkspaceMembershipAliases)
    },
    listByClientId(clientId) {
      return this.listByWorkspaceId(clientId)
    },
    listByWorkspaceId(workspaceId) {
      return workspaceMembershipsRepository
        .listByClientId(workspaceId)
        .map(withWorkspaceMembershipAliases)
    },
    upsert(record) {
      return withWorkspaceMembershipAliases(workspaceMembershipsRepository.upsert({
        ...record,
        client_id: record.client_id ?? record.workspace_id,
        ...(record.role ? { workspace_role: record.role } : {}),
      }))
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
    clients: createWorkspaceRepositoryAdapter(repositories.workspaces),
    workspaceMemberships: createWorkspaceMembershipRepositoryAdapter(repositories.workspaceMemberships),
    workspaces: createWorkspaceRepositoryAdapter(repositories.workspaces),
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
