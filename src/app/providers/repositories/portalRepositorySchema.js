import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
} from './portalRepositoryContract'

export const PORTAL_REPOSITORY_CLIENT_SCOPE = Object.freeze({
  GLOBAL: 'global',
  OPTIONAL: 'optional',
  REQUIRED: 'required',
})

export const PORTAL_REPOSITORY_SCHEMA_OVERRIDES = Object.freeze({
  agencies: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['status'],
    requiredColumns: ['id', 'name', 'status'],
  },
  agency_memberships: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['agency_id', 'status', 'user_id'],
    requiredColumns: ['id', 'agency_id', 'role', 'status', 'user_id'],
  },
  agency_workspace_relationships: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['agency_id', 'status', 'workspace_id'],
    requiredColumns: ['id', 'agency_id', 'status', 'workspace_id'],
  },
  auth_credentials: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['user_id'],
    requiredColumns: ['id', 'user_id'],
  },
  workspaces: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['agency_id', 'portal_slug'],
    requiredColumns: ['id', 'agency_id'],
  },
  invitation_access_tokens: {
    indexes: ['invitation_id', 'status', 'token'],
    requiredColumns: ['id', 'client_id', 'invitation_id', 'status', 'token'],
  },
  growth_review_snapshots: {
    indexes: ['client_id', 'period_end', 'period_start', 'period_type'],
    requiredColumns: ['id', 'client_id', 'period_start', 'period_end', 'period_type', 'calculated_at', 'content'],
  },
  normalized_bookings: {
    indexes: ['appointment_created_at', 'client_id', 'contact_id', 'lead_id', 'source_system'],
    requiredColumns: ['id', 'client_id', 'contact_id', 'appointment_created_at', 'source_system'],
  },
  normalized_contact_events: {
    indexes: ['client_id', 'contact_id', 'direction', 'event_at', 'source_system'],
    requiredColumns: ['id', 'client_id', 'contact_id', 'direction', 'event_at', 'source_system'],
  },
  normalized_leads: {
    indexes: ['client_id', 'contact_id', 'created_at', 'normalized_source', 'source_system'],
    requiredColumns: ['id', 'client_id', 'created_at', 'normalized_source', 'source_system'],
  },
  profiles: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.OPTIONAL,
    indexes: ['agency_id', 'client_id', 'user_id'],
    nullableColumns: ['client_id'],
    requiredColumns: ['id', 'agency_id', 'user_id'],
  },
  raw_ghl_events: {
    indexes: ['client_id', 'event_type', 'external_event_id', 'location_id', 'occurred_at'],
    requiredColumns: ['id', 'client_id', 'event_type', 'occurred_at', 'payload', 'received_at', 'source_system'],
  },
})

function createDefaultTableSchema(collection) {
  return {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.REQUIRED,
    indexes: ['client_id'],
    nullableColumns: [],
    requiredColumns: ['id', 'client_id'],
    repositoryKey: collection.key,
    tableName: collection.tableName,
  }
}

function createTableSchema(collection) {
  const baseSchema = createDefaultTableSchema(collection)
  const override = PORTAL_REPOSITORY_SCHEMA_OVERRIDES[collection.tableName] ?? {}
  const publishesClinicState = PORTAL_CLINIC_PUBLISH_STATE_TABLES.includes(collection.tableName)
  const requiredColumns = new Set([
    ...baseSchema.requiredColumns,
    ...(override.requiredColumns ?? []),
  ])
  const indexes = new Set([
    'id',
    ...baseSchema.indexes,
    ...(override.indexes ?? []),
  ])

  if (override.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL) {
    requiredColumns.delete('client_id')
    indexes.delete('client_id')
  }

  if (override.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.OPTIONAL) {
    requiredColumns.delete('client_id')
  }

  if (publishesClinicState) {
    requiredColumns.add('publish_state')
    indexes.add('publish_state')
  }

  return {
    ...baseSchema,
    ...override,
    indexes: [...indexes],
    nullableColumns: override.nullableColumns ?? baseSchema.nullableColumns,
    publishesClinicState,
    requiredColumns: [...requiredColumns],
    repositoryKey: collection.key,
    tableName: collection.tableName,
  }
}

export function createPortalRepositorySchemaManifest() {
  return PORTAL_REPOSITORY_COLLECTIONS.map(createTableSchema)
}

export function getPortalRepositoryTableSchema(tableName) {
  return createPortalRepositorySchemaManifest().find((tableSchema) => tableSchema.tableName === tableName) ?? null
}
