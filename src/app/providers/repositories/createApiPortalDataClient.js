import { portalSeedData } from './portalSeedData'
import { createSnapshotPortalDataClient } from './createSnapshotPortalDataClient'

function assertTransport(transport) {
  if (!transport || typeof transport.loadSnapshot !== 'function') {
    throw new Error('API portal transport must implement loadSnapshot().')
  }

  if (typeof transport.saveSnapshot !== 'function') {
    throw new Error('API portal transport must implement saveSnapshot(snapshot, context).')
  }
}

export function createApiPortalDataClient({
  seedData = portalSeedData,
  transport,
} = {}) {
  assertTransport(transport)

  return createSnapshotPortalDataClient({
    loadSnapshot: () => transport.loadSnapshot(),
    saveSnapshot: (snapshot, context) => transport.saveSnapshot(snapshot, context),
    seedData,
  })
}
