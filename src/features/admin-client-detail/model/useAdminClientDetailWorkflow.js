import { useMemo } from 'react'

import { normalizeBackendClient } from '@/entities/client'
import { normalizeBackendClientMembership } from '@/entities/client-membership'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

function normalizeMembershipsPayload(payload = {}) {
  return (payload.memberships ?? []).map(normalizeBackendClientMembership)
}

export function useAdminClientDetailWorkflow({ routeParams = {}, runtime }) {
  const apiClient = runtime.apiClient
  const clientId = routeParams.clientId ?? ''
  const { data, error, reload, status } = useAsyncResource({
    dependencyKey: `admin-client-detail:${clientId}`,
    initialData: {
      client: null,
      memberships: [],
    },
    load: async () => {
      if (!clientId) {
        return {
          client: null,
          memberships: [],
        }
      }

      const [clientPayload, membershipsPayload] = await Promise.all([
        apiClient.get(`/api/clients/${clientId}/`),
        apiClient.get(`/api/clients/${clientId}/memberships/`),
      ])

      return {
        client: normalizeBackendClient(clientPayload.client),
        memberships: normalizeMembershipsPayload(membershipsPayload),
      }
    },
  })

  return useMemo(() => ({
    client: data?.client ?? null,
    clientId,
    error,
    memberships: data?.memberships ?? [],
    reload,
    status,
  }), [clientId, data, error, reload, status])
}
