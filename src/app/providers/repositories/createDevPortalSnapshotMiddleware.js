import { portalSeedData } from './portalSeedData.js'
import {
  createPortalSeedSnapshot,
  normalizePortalSnapshot,
} from './createSnapshotPortalRepository.js'

const DEFAULT_PATH = '/api/portal-snapshot'

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

  return async function devPortalSnapshotMiddleware(request, response, next) {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost')

    if (requestUrl.pathname !== path) {
      next()
      return
    }

    try {
      if (request.method === 'GET') {
        sendJson(response, 200, store.loadSnapshot())
        return
      }

      if (request.method === 'PUT') {
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
