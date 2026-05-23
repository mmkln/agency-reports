import { createAsyncPortalDataClient } from './createAsyncPortalDataClient'
import { createApiPortalDataClient } from './createApiPortalDataClient'
import {
  createHttpPortalSnapshotTransport,
  getPortalApiBaseUrl,
} from './createHttpPortalSnapshotTransport'

export const PORTAL_DATA_CLIENT_ADAPTERS = Object.freeze({
  HTTP_SNAPSHOT: 'httpSnapshot',
  LOCAL_REPOSITORY: 'localRepository',
})

export function resolvePortalDataClientAdapter(adapter) {
  const requestedAdapter = adapter ?? PORTAL_DATA_CLIENT_ADAPTERS.LOCAL_REPOSITORY

  if (Object.values(PORTAL_DATA_CLIENT_ADAPTERS).includes(requestedAdapter)) {
    return requestedAdapter
  }

  throw new Error(`Unsupported portal data client adapter: ${requestedAdapter}`)
}

export function createPortalDataClient({
  adapter = PORTAL_DATA_CLIENT_ADAPTERS.LOCAL_REPOSITORY,
  fetchImpl,
  getHeaders,
  repositories,
} = {}) {
  const resolvedAdapter = resolvePortalDataClientAdapter(adapter)

  if (resolvedAdapter === PORTAL_DATA_CLIENT_ADAPTERS.HTTP_SNAPSHOT) {
    return createApiPortalDataClient({
      transport: createHttpPortalSnapshotTransport({
        baseUrl: getPortalApiBaseUrl(),
        fetchImpl,
        getHeaders,
      }),
    })
  }

  return createAsyncPortalDataClient({
    repositories,
  })
}
