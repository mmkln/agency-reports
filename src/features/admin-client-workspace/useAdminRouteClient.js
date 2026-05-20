import { listAdminClients } from '../../domain/services/adminClientService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

export function useAdminRouteClient({ clientId, runtime }) {
  return useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-route-client:${clientId ?? ''}`,
    initialData: null,
    load: () => {
      if (!clientId) {
        return Promise.resolve(null)
      }

      return runtime.dataClient.read((repositories) => listAdminClients({
        repositories,
        viewer: runtime.viewer,
      }).find((client) => client.id === clientId) ?? null)
    },
  })
}
