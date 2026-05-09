import { createLocalStoragePortalRepository } from './createLocalStoragePortalRepository'
import { portalSeedData } from './portalSeedData'

export const portalRepository = createLocalStoragePortalRepository({
  seedData: portalSeedData,
})

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__agencyPortalRepository = Object.freeze({
    reset() {
      return portalRepository.reset()
    },
  })
}
