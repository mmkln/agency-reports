import { describe, expect, it } from 'vitest'

import {
  ASYNC_PORTAL_QA_STORAGE_KEY,
  createAsyncPortalDataClient,
  readAsyncPortalQaConfig,
  writeAsyncPortalQaConfig,
} from './createAsyncPortalDataClient'

function createStorage(initialRecords = {}) {
  const records = new Map(Object.entries(initialRecords))

  return {
    getItem(key) {
      return records.get(key) ?? null
    },
    setItem(key, value) {
      records.set(key, value)
    },
  }
}

describe('createAsyncPortalDataClient', () => {
  it('runs read and write operations against the wrapped repositories', async () => {
    const repositories = {
      clients: {
        list: () => [{ id: 'client-1' }],
      },
    }
    const dataClient = createAsyncPortalDataClient({
      getConfig: () => ({ failureRate: 0, latencyMs: 0 }),
      repositories,
    })

    await expect(dataClient.read((repo) => repo.clients.list())).resolves.toEqual([{ id: 'client-1' }])
    await expect(dataClient.write((repo) => repo.clients.list().length)).resolves.toBe(1)
  })

  it('can simulate repository failures for QA', async () => {
    const dataClient = createAsyncPortalDataClient({
      getConfig: () => ({ failureRate: 1, latencyMs: 0 }),
      repositories: {},
    })

    await expect(dataClient.read(() => 'ok')).rejects.toThrow('Simulated read repository failure.')
  })

  it('normalizes QA config from storage', () => {
    const storage = createStorage()

    expect(writeAsyncPortalQaConfig({ failureRate: 2, latencyMs: -10 }, storage)).toEqual({
      failureRate: 1,
      latencyMs: 0,
    })
    expect(JSON.parse(storage.getItem(ASYNC_PORTAL_QA_STORAGE_KEY))).toEqual({
      failureRate: 1,
      latencyMs: 0,
    })
    expect(readAsyncPortalQaConfig(storage)).toEqual({
      failureRate: 1,
      latencyMs: 0,
    })
  })
})
