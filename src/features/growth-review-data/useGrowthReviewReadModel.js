import { getDentalGrowthReviewDashboardPage } from '../../domain/services/dentalGrowthReviewService'
import { getGrowthReviewDashboardPageFromApi } from '../../domain/services/growthReviewApiReadService'
import { createBackendApiClient } from '../../shared/api/backendApiClient'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

const DATA_SOURCES = Object.freeze({
  DEMO: 'demo',
  DJANGO: 'django',
})

function getGrowthReviewDataSource() {
  return import.meta.env.VITE_GROWTH_REVIEW_DATA_SOURCE === DATA_SOURCES.DJANGO
    ? DATA_SOURCES.DJANGO
    : DATA_SOURCES.DEMO
}

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
  dataSource = getGrowthReviewDataSource(),
  routeParams = {},
  runtime,
}) {
  const workspaceId = resolveWorkspaceId({ routeParams, runtime })
  const source = routeParams.preview === 'draft' ? 'draft' : 'published'
  const dependencyKey = [
    runtime.viewer?.userId ?? '',
    'dental-growth-review',
    dataSource,
    workspaceId ?? '',
    routeParams.periodId ?? '',
    routeParams.periodType ?? '',
    routeParams.start ?? '',
    routeParams.end ?? '',
    source,
  ].join(':')
  const resource = useAsyncResource({
    dependencyKey,
    load: () => {
      if (dataSource === DATA_SOURCES.DJANGO) {
        return getGrowthReviewDashboardPageFromApi({
          apiClient,
          routeParams,
          viewer: runtime.viewer,
          workspaceId,
        })
      }

      return runtime.dataClient.read((repositories) => getDentalGrowthReviewDashboardPage({
        clientId: workspaceId,
        periodId: routeParams.periodId,
        periodType: routeParams.periodType,
        repositories,
        source,
        viewer: runtime.viewer,
      }))
    },
  })

  return {
    ...resource,
    dataSource,
    page: resource.status === 'error' ? createErrorPage(resource.error) : resource.data,
    workspaceId,
  }
}
