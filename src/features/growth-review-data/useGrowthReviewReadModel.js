import { getGrowthReviewDashboardPageFromApi } from '../../domain/services/growthReviewApiReadService'
import { useAsyncResource } from '../../shared/data/useAsyncResource'

const GROWTH_REVIEW_DATA_SOURCE = 'backend'

function resolveWorkspaceId({ routeParams = {}, runtime }) {
  return routeParams.workspaceId
    ?? routeParams.clientId
    ?? runtime.defaultClientId
    ?? runtime.viewer?.activeWorkspaceId
    ?? null
}

function resolveCampaignId(routeParams = {}) {
  return routeParams.campaign
    ?? routeParams.campaignId
    ?? ''
}

function createErrorPage(error, errorInfo) {
  const normalizedErrorInfo = errorInfo ?? {
    kind: 'failure',
    message: typeof error === 'string' ? error : error?.message ?? 'Could not load Growth Review.',
    status: 0,
  }

  return {
    error: typeof error === 'string' ? error : error?.message ?? 'Could not load Growth Review.',
    errorInfo: normalizedErrorInfo,
    period: null,
    reason: normalizedErrorInfo.kind,
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
  const campaignId = resolveCampaignId(routeParams)
  const source = routeParams.preview === 'draft' ? 'draft' : 'published'
  const dependencyKey = [
    runtime.viewer?.userId ?? '',
    'dental-growth-review',
    GROWTH_REVIEW_DATA_SOURCE,
    workspaceId ?? '',
    campaignId,
    source,
  ].join(':')
  const resource = useAsyncResource({
    dependencyKey,
    load: () => getGrowthReviewDashboardPageFromApi({
      apiClient: resolvedApiClient,
      campaignId,
      routeParams,
      viewer: runtime.viewer,
      workspaceId,
    }),
  })

  return {
    ...resource,
    dataSource: GROWTH_REVIEW_DATA_SOURCE,
    page: resource.status === 'error' ? createErrorPage(resource.error, resource.errorInfo) : resource.data,
    campaignId: resource.data?.campaignId || campaignId,
    workspaceId,
  }
}
