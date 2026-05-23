import { describe, expect, it } from 'vitest'

import {
  PORTAL_ENTITY_REPOSITORY_METHODS,
  PORTAL_REPOSITORY_COLLECTIONS,
  PORTAL_REPOSITORY_EXTENSION_METHODS,
  PORTAL_REPOSITORY_KEYS,
  PORTAL_TABLE_NAMES,
} from './portalRepositoryContract'

export function createSeedDataForRepositoryContract(overrides = {}) {
  return {
    ...Object.fromEntries(PORTAL_TABLE_NAMES.map((tableName) => [tableName, []])),
    ...overrides,
  }
}

function createContractRecord({ clientId, repositoryKey, recordId }) {
  const workspaceId = clientId
  const record = {
    client_id: clientId,
    id: recordId,
    name: `${repositoryKey} contract record`,
    title: `${repositoryKey} contract record`,
    user_id: `${recordId}-user`,
  }

  if (repositoryKey === 'workspaceMemberships') {
    record.workspace_id = workspaceId
  }

  return record
}

function expectRepositoryShape(repository) {
  for (const repositoryKey of PORTAL_REPOSITORY_KEYS) {
    expect(repository[repositoryKey], repositoryKey).toBeDefined()

    for (const method of PORTAL_ENTITY_REPOSITORY_METHODS) {
      expect(typeof repository[repositoryKey][method], `${repositoryKey}.${method}`).toBe('function')
    }
  }

  for (const method of PORTAL_REPOSITORY_EXTENSION_METHODS.profiles) {
    expect(typeof repository.profiles[method], `profiles.${method}`).toBe('function')
  }
}

export function runPortalRepositoryContractSuite({ createRepository, name }) {
  describe(`${name} portal repository contract`, () => {
    it('implements every required collection and extension method', () => {
      expectRepositoryShape(createRepository())
    })

    it('round-trips records through every entity collection', () => {
      for (const { key: repositoryKey } of PORTAL_REPOSITORY_COLLECTIONS) {
        const repository = createRepository()
        const collection = repository[repositoryKey]
        const recordId = `contract-${repositoryKey}`
        const clientId = repositoryKey === 'workspaces' ? recordId : `contract-client-${repositoryKey}`
        const record = createContractRecord({ clientId, repositoryKey, recordId })

        expect(collection.findById(recordId), `${repositoryKey}.findById before upsert`).toBeNull()
        expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId before upsert`).toEqual([])
        expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId before upsert`).toEqual([])

        expect(collection.upsert(record), `${repositoryKey}.upsert create`).toEqual(record)
        expect(collection.findById(recordId), `${repositoryKey}.findById after create`).toMatchObject(record)
        expect(collection.list(), `${repositoryKey}.list after create`).toEqual(
          expect.arrayContaining([expect.objectContaining(record)]),
        )
        expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after create`).toEqual([
          expect.objectContaining(record),
        ])
        expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after create`).toEqual([
          expect.objectContaining(record),
        ])

        const updatedRecord = {
          ...record,
          title: `${repositoryKey} updated contract record`,
        }

        expect(collection.upsert(updatedRecord), `${repositoryKey}.upsert update`).toEqual(updatedRecord)
        expect(collection.findById(recordId), `${repositoryKey}.findById after update`).toMatchObject(updatedRecord)
        expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after update`).toHaveLength(1)
        expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after update`).toHaveLength(1)

        expect(collection.deleteById(recordId), `${repositoryKey}.deleteById existing`).toBe(true)
        expect(collection.findById(recordId), `${repositoryKey}.findById after delete`).toBeNull()
        expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after delete`).toEqual([])
        expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after delete`).toEqual([])
        expect(collection.deleteById(recordId), `${repositoryKey}.deleteById missing`).toBe(false)
      }
    })

    it('supports explicit adapter extension behavior', () => {
      const repository = createRepository()
      const profile = createContractRecord({
        clientId: 'contract-client-profile',
        recordId: 'contract-profile',
        repositoryKey: 'profiles',
      })

      repository.profiles.upsert(profile)

      expect(repository.profiles.findByUserId(profile.user_id)).toMatchObject(profile)
      expect(repository.profiles.findByUserId('missing-user')).toBeNull()
    })
  })
}

export function runPortalDataClientRepositoryContractSuite({ createDataClient, name }) {
  describe(`${name} portal data client repository contract`, () => {
    it('implements every required collection and extension method', async () => {
      const dataClient = createDataClient()

      await dataClient.read((repository) => {
        expectRepositoryShape(repository)
      })
    })

    it('round-trips records through every entity collection', async () => {
      for (const { key: repositoryKey } of PORTAL_REPOSITORY_COLLECTIONS) {
        const dataClient = createDataClient()
        const recordId = `contract-${repositoryKey}`
        const clientId = repositoryKey === 'workspaces' ? recordId : `contract-client-${repositoryKey}`
        const record = createContractRecord({ clientId, repositoryKey, recordId })

        await dataClient.read((repository) => {
          const collection = repository[repositoryKey]

          expect(collection.findById(recordId), `${repositoryKey}.findById before upsert`).toBeNull()
          expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId before upsert`).toEqual([])
          expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId before upsert`).toEqual([])
        })

        await expect(dataClient.write((repository) => (
          repository[repositoryKey].upsert(record)
        )), `${repositoryKey}.upsert create`).resolves.toEqual(record)

        await dataClient.read((repository) => {
          const collection = repository[repositoryKey]

          expect(collection.findById(recordId), `${repositoryKey}.findById after create`).toMatchObject(record)
          expect(collection.list(), `${repositoryKey}.list after create`).toEqual(
            expect.arrayContaining([expect.objectContaining(record)]),
          )
          expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after create`).toEqual([
            expect.objectContaining(record),
          ])
          expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after create`).toEqual([
            expect.objectContaining(record),
          ])
        })

        const updatedRecord = {
          ...record,
          title: `${repositoryKey} updated contract record`,
        }

        await expect(dataClient.write((repository) => (
          repository[repositoryKey].upsert(updatedRecord)
        )), `${repositoryKey}.upsert update`).resolves.toEqual(updatedRecord)

        await dataClient.read((repository) => {
          const collection = repository[repositoryKey]

          expect(collection.findById(recordId), `${repositoryKey}.findById after update`).toMatchObject(updatedRecord)
          expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after update`).toHaveLength(1)
          expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after update`).toHaveLength(1)
        })

        await expect(dataClient.write((repository) => (
          repository[repositoryKey].deleteById(recordId)
        )), `${repositoryKey}.deleteById existing`).resolves.toBe(true)

        await dataClient.read((repository) => {
          const collection = repository[repositoryKey]

          expect(collection.findById(recordId), `${repositoryKey}.findById after delete`).toBeNull()
          expect(collection.listByClientId(clientId), `${repositoryKey}.listByClientId after delete`).toEqual([])
          expect(collection.listByWorkspaceId(clientId), `${repositoryKey}.listByWorkspaceId after delete`).toEqual([])
        })

        await expect(dataClient.write((repository) => (
          repository[repositoryKey].deleteById(recordId)
        )), `${repositoryKey}.deleteById missing`).resolves.toBe(false)
      }
    })

    it('supports explicit adapter extension behavior', async () => {
      const dataClient = createDataClient()
      const profile = createContractRecord({
        clientId: 'contract-client-profile',
        recordId: 'contract-profile',
        repositoryKey: 'profiles',
      })

      await dataClient.write((repository) => {
        repository.profiles.upsert(profile)
      })

      await dataClient.read((repository) => {
        expect(repository.profiles.findByUserId(profile.user_id)).toMatchObject(profile)
        expect(repository.profiles.findByUserId('missing-user')).toBeNull()
      })
    })
  })
}
