import { getDentalGrowthReviewDashboardPage } from '../../../domain/services/dentalGrowthReviewService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Skeleton } from '@/shared/ui'
import { DentalGrowthReviewDashboard } from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
    ?? runtime.defaultClientId
    ?? runtime.viewer?.activeWorkspaceId
    ?? null
  const source = routeParams.preview === 'draft' ? 'draft' : 'published'
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:dental-growth-review:${clientId ?? ''}:${routeParams.periodId ?? ''}:${routeParams.periodType ?? ''}:${source}`,
    load: () => runtime.dataClient.read((repositories) => getDentalGrowthReviewDashboardPage({
      clientId,
      periodId: routeParams.periodId,
      periodType: routeParams.periodType,
      repositories,
      source,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  return <DentalGrowthReviewDashboard page={page} />
}
