import { createLocalStoragePortalRepository } from './createLocalStoragePortalRepository'
import { portalSeedData } from './portalSeedData'

export const PORTAL_REPOSITORY_ADAPTERS = Object.freeze({
  LOCAL_STORAGE: 'localStorage',
})

export function resolvePortalRepositoryAdapter(adapter) {
  const requestedAdapter = adapter ?? PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE

  if (requestedAdapter === PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE) {
    return requestedAdapter
  }

  throw new Error(`Unsupported portal repository adapter: ${requestedAdapter}`)
}

export function createPortalRepository({
  adapter = PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
  seedData = portalSeedData,
  storage,
} = {}) {
  const resolvedAdapter = resolvePortalRepositoryAdapter(adapter)

  if (resolvedAdapter === PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE) {
    return createLocalStoragePortalRepository({
      seedData,
      storage,
    })
  }

  throw new Error(`Portal repository adapter is not implemented: ${resolvedAdapter}`)
}
