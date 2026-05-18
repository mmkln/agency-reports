import {
  createPortalRepository,
  PORTAL_REPOSITORY_ADAPTERS,
} from './createPortalRepository'

export const portalRepository = createPortalRepository({
  adapter: import.meta.env.VITE_PORTAL_REPOSITORY_ADAPTER ?? PORTAL_REPOSITORY_ADAPTERS.LOCAL_STORAGE,
  enableDemoReset: import.meta.env.DEV,
})

if (import.meta.env.DEV && typeof window !== 'undefined' && typeof portalRepository.reset === 'function') {
  window.__agencyPortalRepository = Object.freeze({
    reset() {
      return portalRepository.reset()
    },
  })
}
