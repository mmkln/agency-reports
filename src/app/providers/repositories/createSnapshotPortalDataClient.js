import { portalSeedData } from './portalSeedData'
import { createPortalRepositoryFromSnapshot } from './createSnapshotPortalRepository'

function normalizeLoadedSnapshot(loadedSnapshot) {
  if (
    loadedSnapshot
    && typeof loadedSnapshot === 'object'
    && !Array.isArray(loadedSnapshot)
    && Object.hasOwn(loadedSnapshot, 'snapshot')
  ) {
    return {
      snapshot: loadedSnapshot.snapshot,
      version: loadedSnapshot.version ?? null,
    }
  }

  return {
    snapshot: loadedSnapshot,
    version: null,
  }
}

export function createSnapshotPortalDataClient({
  loadSnapshot,
  saveSnapshot,
  seedData = portalSeedData,
} = {}) {
  if (typeof loadSnapshot !== 'function') {
    throw new Error('loadSnapshot is required.')
  }

  if (typeof saveSnapshot !== 'function') {
    throw new Error('saveSnapshot is required.')
  }

  async function createWorkspace() {
    const loadedSnapshot = normalizeLoadedSnapshot(await loadSnapshot())

    return createPortalRepositoryFromSnapshot({
      seedData,
      snapshot: loadedSnapshot.snapshot,
      version: loadedSnapshot.version,
    })
  }

  return {
    async read(operation) {
      const workspace = await createWorkspace()

      return operation(workspace.repositories)
    },
    async write(operation) {
      const workspace = await createWorkspace()
      const result = operation(workspace.repositories)

      await saveSnapshot(workspace.getSnapshot(), {
        version: workspace.version,
      })

      return result
    },
  }
}
