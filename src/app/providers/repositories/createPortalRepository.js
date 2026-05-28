export function resolvePortalRepositoryAdapter() {
  throw new Error('Portal repository adapters were removed. Use backend API clients instead.')
}

export function createPortalRepository() {
  throw new Error('Local portal repository adapters were removed from the active runtime. Use backend API clients instead.')
}
