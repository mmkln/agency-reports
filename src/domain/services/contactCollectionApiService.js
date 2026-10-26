import { normalizeContactCollection } from '@/entities/contact-collection'

export async function getContactCollectionFromApi({
  apiClient,
  endpoint,
  page,
  pageSize,
  query,
}) {
  if (!String(endpoint ?? '').startsWith('/api/')) {
    throw new Error('A valid contact collection endpoint is required.')
  }

  const payload = await apiClient.get(endpoint, {
    query: {
      page,
      page_size: pageSize,
      ...(query ? { q: query } : {}),
    },
  })
  return normalizeContactCollection(payload)
}
