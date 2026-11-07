import { describe, expect, it } from 'vitest'

import { createBrowserAuthTokenStorage } from './browserAuthTokenStorage'

const STORAGE_KEY = 'test.authTokens'

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues))

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}

function createTokens(overrides = {}) {
  return {
    access: 'access-token',
    refresh: 'refresh-token',
    tokenType: 'Bearer',
    ...overrides,
  }
}

describe('createBrowserAuthTokenStorage', () => {
  it('writes and reads tokens from persistent storage', () => {
    const storage = createMemoryStorage()
    const tokenStorage = createBrowserAuthTokenStorage({
      legacyStorage: createMemoryStorage(),
      storage,
      storageKey: STORAGE_KEY,
    })

    expect(tokenStorage.write(createTokens())).toEqual(createTokens())
    expect(tokenStorage.read()).toEqual(createTokens())
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(createTokens())
  })

  it('migrates an existing session token to persistent storage', () => {
    const legacyStorage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify(createTokens()),
    })
    const storage = createMemoryStorage()
    const tokenStorage = createBrowserAuthTokenStorage({
      legacyStorage,
      storage,
      storageKey: STORAGE_KEY,
    })

    expect(tokenStorage.read()).toEqual(createTokens())
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual(createTokens())
    expect(legacyStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('falls back to session storage when persistent storage is unavailable', () => {
    const legacyStorage = createMemoryStorage()
    const tokenStorage = createBrowserAuthTokenStorage({
      legacyStorage,
      storage: null,
      storageKey: STORAGE_KEY,
    })

    expect(tokenStorage.write(createTokens())).toEqual(createTokens())
    expect(tokenStorage.read()).toEqual(createTokens())
    expect(JSON.parse(legacyStorage.getItem(STORAGE_KEY))).toEqual(createTokens())
  })

  it('clears tokens from persistent and legacy storage', () => {
    const storedValue = JSON.stringify(createTokens())
    const legacyStorage = createMemoryStorage({ [STORAGE_KEY]: storedValue })
    const storage = createMemoryStorage({ [STORAGE_KEY]: storedValue })
    const tokenStorage = createBrowserAuthTokenStorage({
      legacyStorage,
      storage,
      storageKey: STORAGE_KEY,
    })

    tokenStorage.clear()

    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect(legacyStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
