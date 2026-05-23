import { describe, expect, it, vi } from 'vitest'

import {
  createPortalDataClient,
  PORTAL_DATA_CLIENT_ADAPTERS,
  resolvePortalDataClientAdapter,
} from './createPortalDataClient'

describe('createPortalDataClient', () => {
  it('defaults to the local repository data client', async () => {
    const dataClient = createPortalDataClient({
      repositories: {
        clients: {
          list: () => [
            {
              id: 'client-1',
            },
          ],
        },
      },
    })

    await expect(dataClient.read((repositories) => repositories.clients.list())).resolves.toEqual([
      {
        id: 'client-1',
      },
    ])
  })

  it('creates an HTTP snapshot data client when configured', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      async json() {
        return {
          snapshot: {
            workspaces: [
              {
                id: 'client-1',
              },
            ],
          },
          version: 'version-1',
        }
      },
      ok: true,
      status: 200,
    })
    const dataClient = createPortalDataClient({
      adapter: PORTAL_DATA_CLIENT_ADAPTERS.HTTP_SNAPSHOT,
      fetchImpl,
    })

    await expect(dataClient.read((repositories) => (
      repositories.clients.findById('client-1')
    ))).resolves.toMatchObject({
      id: 'client-1',
    })
  })

  it('fails fast for unsupported data client adapters', () => {
    expect(() => resolvePortalDataClientAdapter('missing')).toThrow(
      'Unsupported portal data client adapter: missing',
    )
  })
})
