import { describe, expect, it } from 'vitest'

import { portalSeedData } from './portalSeedData'
import {
  PORTAL_CLINIC_PUBLISH_STATE_TABLES,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'
import {
  createPortalRepositorySchemaManifest,
  getPortalRepositoryTableSchema,
  PORTAL_REPOSITORY_CLIENT_SCOPE,
} from './portalRepositorySchema'

describe('portalRepositorySchema', () => {
  it('describes every repository table exactly once', () => {
    const schemaManifest = createPortalRepositorySchemaManifest()

    expect(schemaManifest).toHaveLength(PORTAL_REPOSITORY_COLLECTIONS.length)
    expect(schemaManifest.map((tableSchema) => tableSchema.tableName)).toEqual(PORTAL_TABLE_NAMES)
    expect(new Set(schemaManifest.map((tableSchema) => tableSchema.tableName)).size).toBe(schemaManifest.length)
  })

  it('keeps repository keys and table schemas aligned', () => {
    for (const collection of PORTAL_REPOSITORY_COLLECTIONS) {
      expect(getPortalRepositoryTableSchema(collection.tableName)).toMatchObject({
        repositoryKey: collection.key,
        tableName: collection.tableName,
      })
    }
  })

  it('marks client-scoped tables with client indexes and required client ids', () => {
    const schemaManifest = createPortalRepositorySchemaManifest()

    for (const tableSchema of schemaManifest) {
      expect(tableSchema.requiredColumns).toContain('id')
      expect(tableSchema.indexes).toContain('id')

      if (tableSchema.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.REQUIRED) {
        expect(tableSchema.requiredColumns, tableSchema.tableName).toContain('client_id')
        expect(tableSchema.indexes, tableSchema.tableName).toContain('client_id')
      }

      if (tableSchema.clientScope === PORTAL_REPOSITORY_CLIENT_SCOPE.GLOBAL) {
        expect(tableSchema.requiredColumns, tableSchema.tableName).not.toContain('client_id')
        expect(tableSchema.indexes, tableSchema.tableName).not.toContain('client_id')
      }
    }
  })

  it('marks clinic publish-state tables with publish columns and indexes', () => {
    for (const tableName of PORTAL_CLINIC_PUBLISH_STATE_TABLES) {
      const tableSchema = getPortalRepositoryTableSchema(tableName)

      expect(tableSchema.publishesClinicState, tableName).toBe(true)
      expect(tableSchema.requiredColumns, tableName).toContain('publish_state')
      expect(tableSchema.indexes, tableName).toEqual(expect.arrayContaining(['client_id', 'publish_state']))
    }
  })

  it('keeps seed records aligned with required backend columns', () => {
    for (const tableName of PORTAL_TABLE_NAMES) {
      const tableSchema = getPortalRepositoryTableSchema(tableName)
      const tableRecords = portalSeedData[tableName]

      for (const record of tableRecords) {
        for (const requiredColumn of tableSchema.requiredColumns) {
          expect(Object.hasOwn(record, requiredColumn), `${tableName}.${record.id}.${requiredColumn}`).toBe(true)
        }
      }
    }
  })
})
