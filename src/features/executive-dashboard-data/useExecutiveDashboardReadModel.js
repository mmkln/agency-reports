import { getExecutiveDashboardMetricsFromApi } from '../../domain/services/executiveDashboardApiReadService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { executiveDashboardStaticData } from './executiveDashboardStaticData'

function resolveWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.workspaceId
    ?? routeParams.clientId
    ?? runtime?.defaultClientId
    ?? runtime?.viewer?.activeWorkspaceId
    ?? null
}

export function useExecutiveDashboardReadModel({
  apiClient,
  routeParams = {},
  runtime,
}) {
  const workspaceId = resolveWorkspaceId({ routeParams, runtime })
  const resolvedApiClient = apiClient ?? runtime.apiClient
  const dependencyKey = [
    runtime.viewer?.userId ?? '',
    'executive-dashboard',
    workspaceId ?? '',
  ].join(':')
  const resource = useAsyncResource({
    dependencyKey,
    load: async () => {
      const readModel = await getExecutiveDashboardMetricsFromApi({
        apiClient: resolvedApiClient,
        workspaceId,
      })

      return {
        ...executiveDashboardStaticData,
        overviewMetrics: executiveDashboardStaticData.overviewMetrics.map((metric) => (
          metric.id === 'new-bookings'
            ? {
              ...metric,
              badge: 'GHL live',
              context: readModel.period.label,
              value: String(readModel.newBookings.value),
            }
            : metric
        )),
        workspaceId,
      }
    },
  })

  return {
    ...resource,
    page: resource.data,
    workspaceId,
  }
}
