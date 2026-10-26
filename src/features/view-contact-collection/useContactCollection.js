import { useEffect, useState } from 'react'

import { getContactCollectionFromApi } from '@/domain/services/contactCollectionApiService'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

const DEFAULT_PAGE_SIZE = 25
const SEARCH_DELAY_MS = 300

export function useContactCollection({ descriptor, open, runtime }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE)
  const [query, setQueryState] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [query])

  const resource = useAsyncResource({
    dependencyKey: open
      ? [descriptor?.endpoint ?? '', page, pageSize, debouncedQuery].join(':')
      : 'contact-collection:closed',
    initialData: null,
    load: () => open
      ? getContactCollectionFromApi({
          apiClient: runtime.apiClient,
          endpoint: descriptor.endpoint,
          page,
          pageSize,
          query: debouncedQuery,
        })
      : Promise.resolve(null),
  })

  function setQuery(value) {
    setQueryState(value)
    setPage(1)
  }

  function setPageSize(value) {
    setPageSizeState(Number(value))
    setPage(1)
  }

  return {
    ...resource,
    collection: resource.data,
    page,
    pageSize,
    query,
    setPage,
    setPageSize,
    setQuery,
  }
}
