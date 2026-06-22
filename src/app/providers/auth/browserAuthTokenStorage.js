const AUTH_TOKENS_STORAGE_KEY = 'agency-reports.authTokens'

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage ?? null
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

export function createBrowserAuthTokenStorage({
  storage = getSessionStorage(),
  storageKey = AUTH_TOKENS_STORAGE_KEY,
} = {}) {
  return {
    clear() {
      storage?.removeItem(storageKey)
    },
    read() {
      const rawValue = storage?.getItem(storageKey)
      if (!rawValue) {
        return null
      }

      try {
        return normalizeTokens(JSON.parse(rawValue))
      } catch {
        storage?.removeItem(storageKey)
        return null
      }
    },
    write(tokens) {
      const normalizedTokens = normalizeTokens(tokens)
      if (!normalizedTokens) {
        storage?.removeItem(storageKey)
        return null
      }

      storage?.setItem(storageKey, JSON.stringify(normalizedTokens))
      return normalizedTokens
    },
  }
}
