import { portalSeedData } from './portalSeedData.js'
import {
  createPortalSeedSnapshot,
  createPortalRepositoryFromSnapshot,
  normalizePortalSnapshot,
} from './createSnapshotPortalRepository.js'
import {
  ingestGhlGrowthReviewEvent,
  saveGhlGrowthReviewSnapshot,
} from '../../../domain/services/ghlGrowthReviewIntegrationService.js'

const DEFAULT_PATH = '/api/portal-snapshot'
const GHL_EVENTS_PATH = '/api/integrations/ghl/events'
const GROWTH_REVIEW_PATH = '/api/client/growth-review'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createVersion(revision) {
  return `dev-snapshot-${revision}`
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding?.('utf8')
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      if (!body) {
        resolve(null)
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Malformed JSON request body.'))
      }
    })
    request.on('error', reject)
  })
}

export function createDevPortalSnapshotStore({
  seedData = portalSeedData,
} = {}) {
  let snapshot = createPortalSeedSnapshot(seedData)
  let revision = 0

  return {
    loadSnapshot() {
      return {
        snapshot: clone(snapshot),
        version: createVersion(revision),
      }
    },
    saveSnapshot(nextSnapshot, { version } = {}) {
      if (version !== createVersion(revision)) {
        throw new Error('Snapshot version conflict. Reload before saving again.')
      }

      snapshot = normalizePortalSnapshot(nextSnapshot, seedData)
      revision += 1

      return {
        version: createVersion(revision),
      }
    },
  }
}

export function createDevPortalSnapshotMiddleware({
  path = DEFAULT_PATH,
  seedData = portalSeedData,
} = {}) {
  const store = createDevPortalSnapshotStore({ seedData })

  function mutateSnapshot(mutator) {
    const loaded = store.loadSnapshot()
    const workspace = createPortalRepositoryFromSnapshot({
      seedData,
      snapshot: loaded.snapshot,
      version: loaded.version,
    })
    const result = mutator(workspace.repositories)
    const saveResult = store.saveSnapshot(workspace.getSnapshot(), {
      version: loaded.version,
    })

    return {
      result,
      version: saveResult.version,
    }
  }

  return async function devPortalSnapshotMiddleware(request, response, next) {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost')

    if (
      requestUrl.pathname !== path
      && requestUrl.pathname !== GHL_EVENTS_PATH
      && requestUrl.pathname !== GROWTH_REVIEW_PATH
    ) {
      next()
      return
    }

    try {
      if (requestUrl.pathname === path && request.method === 'GET') {
        sendJson(response, 200, store.loadSnapshot())
        return
      }

      if (requestUrl.pathname === path && request.method === 'PUT') {
        const body = await readRequestBody(request)

        try {
          sendJson(response, 200, store.saveSnapshot(body?.snapshot, {
            version: body?.version,
          }))
        } catch (error) {
          sendJson(response, 409, {
            error: error.message,
          })
        }
        return
      }

      if (requestUrl.pathname === GHL_EVENTS_PATH && request.method === 'POST') {
        const body = await readRequestBody(request)
        const { result, version } = mutateSnapshot((repositories) => ingestGhlGrowthReviewEvent({
          clientId: body?.client_id ?? body?.clientId,
          payload: body,
          repositories,
        }))

        sendJson(response, 202, {
          normalized: {
            booking: result.booking,
            contact_event: result.contactEvent,
            lead: result.lead,
          },
          period: result.period,
          raw_event: result.rawEvent,
          version,
        })
        return
      }

      if (requestUrl.pathname === GROWTH_REVIEW_PATH && request.method === 'GET') {
        const clientId = requestUrl.searchParams.get('clientId') ?? requestUrl.searchParams.get('client_id')
        const periodStart = requestUrl.searchParams.get('start')
        const periodEnd = requestUrl.searchParams.get('end')
        const periodType = requestUrl.searchParams.get('periodType') ?? requestUrl.searchParams.get('period_type') ?? 'weekly'

        if (!clientId || !periodStart || !periodEnd) {
          sendJson(response, 400, {
            error: 'clientId, start, and end query parameters are required.',
          })
          return
        }

        const { result, version } = mutateSnapshot((repositories) => saveGhlGrowthReviewSnapshot({
          clientId,
          periodEnd,
          periodStart,
          periodType,
          repositories,
        }))

        sendJson(response, 200, {
          period: result.period,
          snapshot: result.snapshot,
          version,
        })
        return
      }

      sendJson(response, 405, {
        error: 'Method not allowed.',
      })
    } catch (error) {
      sendJson(response, 400, {
        error: error.message,
      })
    }
  }
}
