import { getGrowthReviewDashboardPageFromApi } from '../../domain/services/growthReviewApiReadService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

const GROWTH_REVIEW_DATA_SOURCE = 'backend'

function resolveWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.clientId
    ?? runtime.defaultClientId
    ?? runtime.viewer?.activeWorkspaceId
    ?? null
}

function createErrorPage(error) {
  return {
    error: typeof error === 'string' ? error : error?.message ?? 'Could not load Growth Review.',
    period: null,
    reason: 'api_error',
    status: 'error',
  }
}

export function useGrowthReviewReadModel({
  apiClient,
  routeParams = {},
  runtime,
}) {
  const resolvedApiClient = apiClient ?? runtime.apiClient
  const workspaceId = resolveWorkspaceId({ routeParams, runtime })
  const source = routeParams.preview === 'draft' ? 'draft' : 'published'
  const dependencyKey = [
    runtime.viewer?.userId ?? '',
    'dental-growth-review',
    GROWTH_REVIEW_DATA_SOURCE,
    workspaceId ?? '',
    routeParams.periodId ?? '',
    routeParams.periodType ?? '',
    routeParams.start ?? '',
    routeParams.end ?? '',
    source,
  ].join(':')
  const resource = useAsyncResource({
    dependencyKey,
    load: () => getGrowthReviewDashboardPageFromApi({
      apiClient: resolvedApiClient,
      routeParams,
      viewer: runtime.viewer,
      workspaceId,
    }),
  })

  return {
    ...resource,
    dataSource: GROWTH_REVIEW_DATA_SOURCE,
    page: resource.status === 'error' ? createErrorPage(resource.error) : resource.data,
    workspaceId,
  }
}
