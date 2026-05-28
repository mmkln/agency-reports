import { getGrowthReviewDashboardPageFromApi } from '../../domain/services/growthReviewApiReadService'
import { createBackendApiClient } from '../../shared/api/backendApiClient'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

const GROWTH_REVIEW_DATA_SOURCE = 'django'

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
  apiClient = createBackendApiClient(),
  routeParams = {},
  runtime,
}) {
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
      apiClient,
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
