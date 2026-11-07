import { describe, expect, it, vi } from 'vitest'

import { getContactCollectionFromApi } from './contactCollectionApiService'

describe('contactCollectionApiService', () => {
  it('loads one snapshot-bound page with an optional search query', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue({
        collection: {
          grain: 'opportunity',
          key: 'leads.created',
          title: 'Total leads',
          total_records: 2,
          unique_contacts: 1,
        },
        items: [],
        pagination: { page: 2, page_size: 10, total_items: 2, total_pages: 1 },
      }),
    }

    const collection = await getContactCollectionFromApi({
      apiClient,
      endpoint: '/api/workspaces/workspace-1/analytics/drilldown/',
      page: 2,
      pageSize: 10,
      query: 'Lauren',
    })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/analytics/drilldown/',
      { query: { page: 2, page_size: 10, q: 'Lauren' } },
    )
    expect(collection).toMatchObject({ key: 'leads.created', totalRecords: 2, uniqueContacts: 1 })
  })

  it('rejects endpoints outside the API namespace', async () => {
    await expect(getContactCollectionFromApi({
      apiClient: { get: vi.fn() },
      endpoint: 'https://example.com/contacts',
      page: 1,
      pageSize: 25,
      query: '',
    })).rejects.toThrow('valid contact collection endpoint')
  })
})
