import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'

import {
  createDevPortalSnapshotMiddleware,
  createDevPortalSnapshotStore,
} from './createDevPortalSnapshotMiddleware'
import { createApiPortalDataClient } from './createApiPortalDataClient'
import { createHttpPortalSnapshotTransport } from './createHttpPortalSnapshotTransport'
import { createSeedDataForRepositoryContract } from './portalRepositoryContract.test-support'

function createRequest({ body = null, method = 'GET', url = '/api/portal-snapshot' } = {}) {
  const chunks = body ? [JSON.stringify(body)] : []
  const request = Readable.from(chunks)

  request.method = method
  request.url = url

  return request
}

function createResponse() {
  return {
    body: '',
    headers: {},
    statusCode: 200,
    end(body = '') {
      this.body = body
      this.ended = true
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
  }
}

async function callMiddleware(middleware, request) {
  const response = createResponse()
  let nextCalled = false

  await middleware(request, response, () => {
    nextCalled = true
  })

  return {
    nextCalled,
    response,
  }
}

function createMiddlewareFetch(middleware) {
  return async function fetchImpl(url, options = {}) {
    const request = createRequest({
      body: options.body ? JSON.parse(options.body) : null,
      method: options.method,
      url: new URL(url).pathname,
    })
    const { response } = await callMiddleware(middleware, request)

    return {
      async json() {
        return JSON.parse(response.body)
      },
      ok: response.statusCode >= 200 && response.statusCode < 300,
      status: response.statusCode,
    }
  }
}

describe('createDevPortalSnapshotStore', () => {
  it('loads seeded snapshots and rejects stale saves', () => {
    const store = createDevPortalSnapshotStore({
      seedData: createSeedDataForRepositoryContract(),
    })
    const firstLoad = store.loadSnapshot()
    const nextVersion = store.saveSnapshot({
      workspaces: [
        {
          id: 'client-1',
        },
      ],
    }, {
      version: firstLoad.version,
    })

    expect(nextVersion.version).not.toBe(firstLoad.version)
    expect(() => store.saveSnapshot({
      workspaces: [],
    }, {
      version: firstLoad.version,
    })).toThrow('Snapshot version conflict. Reload before saving again.')
  })
})

describe('createDevPortalSnapshotMiddleware', () => {
  it('serves GET and PUT /api/portal-snapshot requests', async () => {
    const middleware = createDevPortalSnapshotMiddleware({
      seedData: createSeedDataForRepositoryContract(),
    })
    const loadResult = await callMiddleware(middleware, createRequest())
    const loadedPayload = JSON.parse(loadResult.response.body)

    expect(loadResult.response.statusCode).toBe(200)
    expect(loadedPayload).toMatchObject({
      snapshot: {
        workspaces: [],
      },
      version: 'dev-snapshot-0',
    })

    const saveResult = await callMiddleware(middleware, createRequest({
      body: {
        snapshot: {
          workspaces: [
            {
              id: 'client-1',
            },
          ],
        },
        version: loadedPayload.version,
      },
      method: 'PUT',
    }))

    expect(saveResult.response.statusCode).toBe(200)
    expect(JSON.parse(saveResult.response.body)).toEqual({
      version: 'dev-snapshot-1',
    })
  })

  it('passes through unrelated requests', async () => {
    const middleware = createDevPortalSnapshotMiddleware()
    const result = await callMiddleware(middleware, createRequest({
      url: '/other',
    }))

    expect(result.nextCalled).toBe(true)
    expect(result.response.ended).toBeUndefined()
  })

  it('works end-to-end through the HTTP transport and API data client', async () => {
    const middleware = createDevPortalSnapshotMiddleware({
      seedData: createSeedDataForRepositoryContract(),
    })
    const dataClient = createApiPortalDataClient({
      seedData: createSeedDataForRepositoryContract(),
      transport: createHttpPortalSnapshotTransport({
        baseUrl: 'http://localhost',
        fetchImpl: createMiddlewareFetch(middleware),
      }),
    })

    await dataClient.write((repositories) => {
      repositories.clients.upsert({
        id: 'client-1',
        name: 'HTTP Client',
      })
    })

    await expect(dataClient.read((repositories) => (
      repositories.clients.findById('client-1')
    ))).resolves.toMatchObject({
      name: 'HTTP Client',
    })
  })

  it('accepts GHL events and serves calculated Growth Review snapshots', async () => {
    const middleware = createDevPortalSnapshotMiddleware({
      seedData: createSeedDataForRepositoryContract(),
    })
    const eventResult = await callMiddleware(middleware, createRequest({
      body: {
        appointment_id: 'appt-1',
        client_id: 'client-1',
        contact_id: 'contact-1',
        event_id: 'appt-1-created',
        event_type: 'appointment_created',
        occurred_at: '2026-05-12T09:00:00.000Z',
        period_end: '2026-05-17',
        period_start: '2026-05-11',
        source: 'facebook lead',
      },
      method: 'POST',
      url: '/api/integrations/ghl/events',
    }))
    const eventPayload = JSON.parse(eventResult.response.body)

    expect(eventResult.response.statusCode).toBe(202)
    expect(eventPayload.normalized.booking).toMatchObject({
      appointment_id: 'appt-1',
      client_id: 'client-1',
    })
    expect(eventPayload.period.content.hero_metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'bookings',
          value: '1',
        }),
      ]),
    )

    const readResult = await callMiddleware(middleware, createRequest({
      method: 'GET',
      url: '/api/client/growth-review?clientId=client-1&start=2026-05-11&end=2026-05-17',
    }))
    const readPayload = JSON.parse(readResult.response.body)

    expect(readResult.response.statusCode).toBe(200)
    expect(readPayload.period.content.funnel).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'booked',
          stage_count: 1,
        }),
      ]),
    )
  })
})
