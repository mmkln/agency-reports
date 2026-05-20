import { getDentalGrowthReviewDashboardPage } from '../../../domain/services/dentalGrowthReviewService'
import { DentalGrowthReviewDashboard } from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
    ?? runtime.viewer?.clientId
    ?? runtime.defaultClientId
    ?? runtime.viewer?.clientIds?.[0]
    ?? null
  const page = getDentalGrowthReviewDashboardPage({
    clientId,
    periodId: routeParams.periodId,
    periodType: routeParams.periodType,
    repositories: runtime.repositories,
    source: routeParams.preview === 'draft' ? 'draft' : 'published',
    viewer: runtime.viewer,
  })

  return <DentalGrowthReviewDashboard page={page} />
}
