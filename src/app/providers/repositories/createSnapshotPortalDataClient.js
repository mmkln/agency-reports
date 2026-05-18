import { portalSeedData } from './portalSeedData'
import { createPortalRepositoryFromSnapshot } from './createSnapshotPortalRepository'

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
    return createPortalRepositoryFromSnapshot({
      seedData,
      snapshot: await loadSnapshot(),
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

      await saveSnapshot(workspace.getSnapshot())

      return result
    },
  }
}
