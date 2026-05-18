import {
  createPortalRepositoryCollections,
  createPortalSeedSnapshot,
  normalizePortalSnapshot,
} from './createSnapshotPortalRepository'

export const PORTAL_STORAGE_KEY = 'agency-reports.portal.v2'
export { PORTAL_STORAGE_SCHEMA_VERSION } from './createSnapshotPortalRepository'

function createMemoryStorage() {
  const records = new Map()

  return {
    getItem(key) {
      return records.get(key) ?? null
    },
    removeItem(key) {
      records.delete(key)
    },
    setItem(key, value) {
      records.set(key, value)
    },
  }
}

export function createLocalStoragePortalRepository({ enableDemoReset = false, seedData, storage } = {}) {
  const storageAdapter = storage ?? (typeof window !== 'undefined' ? window.localStorage : createMemoryStorage())

  function readSnapshot() {
    const rawSnapshot = storageAdapter.getItem(PORTAL_STORAGE_KEY)

    if (!rawSnapshot) {
      const seededSnapshot = createPortalSeedSnapshot(seedData)
      storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(seededSnapshot))
      return seededSnapshot
    }

    try {
      const parsedSnapshot = JSON.parse(rawSnapshot)
      const normalizedSnapshot = normalizePortalSnapshot(parsedSnapshot, seedData)

      if (JSON.stringify(parsedSnapshot) !== JSON.stringify(normalizedSnapshot)) {
        storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(normalizedSnapshot))
      }

      return normalizedSnapshot
    } catch {
      const seededSnapshot = createPortalSeedSnapshot(seedData)
      storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(seededSnapshot))
      return seededSnapshot
    }
  }

  function writeSnapshot(snapshot) {
    storageAdapter.setItem(PORTAL_STORAGE_KEY, JSON.stringify(normalizePortalSnapshot(snapshot, seedData)))
  }

  const repository = createPortalRepositoryCollections({ readSnapshot, writeSnapshot })

  if (enableDemoReset) {
    repository.reset = function resetDemoRepository() {
      storageAdapter.removeItem(PORTAL_STORAGE_KEY)
      return readSnapshot()
    }
  }

  return repository
}
