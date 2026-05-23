function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createVersion(revision) {
  return `api-snapshot-${revision}`
}

export function createInMemoryApiPortalSnapshotTransport({
  initialSnapshot = null,
  rejectStaleWrites = true,
} = {}) {
  let snapshot = clone(initialSnapshot)
  let revision = 0

  return {
    async loadSnapshot() {
      return {
        snapshot: clone(snapshot),
        version: createVersion(revision),
      }
    },
    async saveSnapshot(nextSnapshot, { version } = {}) {
      const currentVersion = createVersion(revision)

      if (rejectStaleWrites && version !== currentVersion) {
        throw new Error('Snapshot version conflict. Reload before saving again.')
      }

      snapshot = clone(nextSnapshot)
      revision += 1

      return {
        version: createVersion(revision),
      }
    },
  }
}
