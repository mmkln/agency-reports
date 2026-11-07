const AUTH_TOKENS_STORAGE_KEY = 'agency-reports.authTokens'

function getBrowserStorage(storageName) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window[storageName] ?? null
  } catch {
    return null
  }
}

function normalizeTokens(tokens) {
  const access = String(tokens?.access ?? '').trim()
  const refresh = String(tokens?.refresh ?? '').trim()
  const tokenType = String(tokens?.token_type ?? tokens?.tokenType ?? 'Bearer').trim() || 'Bearer'

  if (!access || !refresh) {
    return null
  }

  return {
    access,
    refresh,
    tokenType,
  }
}

function removeStoredTokens(storage, storageKey) {
  try {
    storage?.removeItem(storageKey)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function readStoredTokens(storage, storageKey) {
  let rawValue

  try {
    rawValue = storage?.getItem(storageKey) ?? null
  } catch {
    return null
  }

  if (!rawValue) {
    return null
  }

  try {
    return normalizeTokens(JSON.parse(rawValue))
  } catch {
    removeStoredTokens(storage, storageKey)
    return null
  }
}

function writeStoredTokens(storage, storageKey, tokens) {
  try {
    storage?.setItem(storageKey, JSON.stringify(tokens))
    return storage != null
  } catch {
    return false
  }
}

export function createBrowserAuthTokenStorage({
  legacyStorage = getBrowserStorage('sessionStorage'),
  storage = getBrowserStorage('localStorage'),
  storageKey = AUTH_TOKENS_STORAGE_KEY,
} = {}) {
  return {
    clear() {
      removeStoredTokens(storage, storageKey)
      removeStoredTokens(legacyStorage, storageKey)
    },
    read() {
      const persistedTokens = readStoredTokens(storage, storageKey)
      if (persistedTokens) {
        return persistedTokens
      }

      const legacyTokens = readStoredTokens(legacyStorage, storageKey)
      if (!legacyTokens) {
        return null
      }

      if (writeStoredTokens(storage, storageKey, legacyTokens)) {
        removeStoredTokens(legacyStorage, storageKey)
      }

      return legacyTokens
    },
    write(tokens) {
      const normalizedTokens = normalizeTokens(tokens)
      if (!normalizedTokens) {
        removeStoredTokens(storage, storageKey)
        removeStoredTokens(legacyStorage, storageKey)
        return null
      }

      if (writeStoredTokens(storage, storageKey, normalizedTokens)) {
        removeStoredTokens(legacyStorage, storageKey)
      } else {
        writeStoredTokens(legacyStorage, storageKey, normalizedTokens)
      }

      return normalizedTokens
    },
  }
}
