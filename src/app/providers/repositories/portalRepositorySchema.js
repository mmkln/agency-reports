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
  auth_credentials: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['user_id'],
    requiredColumns: ['id', 'user_id'],
  },
  clients: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL,
    indexes: ['agency_id', 'portal_slug'],
    requiredColumns: ['id', 'agency_id'],
  },
  invitation_access_tokens: {
    indexes: ['invitation_id', 'status', 'token'],
    requiredColumns: ['id', 'client_id', 'invitation_id', 'status', 'token'],
  },
  profiles: {
    clientScope: PORTAL_REPOSITORY_CLIENT_SCOPE.OPTIONAL,
    indexes: ['agency_id', 'client_id', 'user_id'],
    nullableColumns: ['client_id'],
    requiredColumns: ['id', 'agency_id', 'user_id'],
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
