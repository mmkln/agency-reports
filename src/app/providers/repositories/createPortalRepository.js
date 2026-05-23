import { createLocalStoragePortalRepository } from './createLocalStoragePortalRepository'
import { portalSeedData } from './portalSeedData'

export const PORTAL_REPOSITORY_ADAPTERS = Object.freeze({
  API_SNAPSHOT: 'apiSnapshot',
  LOCAL_STORAGE: 'localStorage',
})

export function resolvePortalRepositoryAdapter(adapter) {
  const requestedAdapter = adapter ?? PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE

  if ([
    PORTAL_REPOSITORY_ADAPTERS.API_SNAPSHOT,
    PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
  ].includes(requestedAdapter)) {
    return requestedAdapter
  }

  throw new Error(`Unsupported portal repository adapter: ${requestedAdapter}`)
}

export function createPortalRepository({
  adapter = PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
  enableDemoReset = false,
  seedData = portalSeedData,
  storage,
} = {}) {
  const resolvedAdapter = resolvePortalRepositoryAdapter(adapter)

  if (resolvedAdapter === PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE) {
    return createLocalStoragePortalRepository({
      enableDemoReset,
      seedData,
      storage,
    })
  }

  throw new Error(
    'The apiSnapshot adapter is a data-client transport adapter. Use createApiPortalDataClient() instead of createPortalRepository().',
  )
}
