import {
  useAcceptedTreatmentDrilldown,
  useGrowthReviewReadModel,
  useGrowthReviewRefresh,
} from '../../../features/growth-review-data'
import {
  GrowthReviewCampaignSelector,
  useGrowthReviewCampaignSelection,
} from '../../../features/growth-review-campaign-selection'
import { PageShell } from '@/shared/ui'
import {
  DentalGrowthReviewDashboard,
  DentalGrowthReviewSkeleton,
} from '../../../widgets/dental-growth-review'

export function DentalGrowthReviewPage({ funnelEmptyAction, routeParams = {}, runtime }) {
  const growthReview = useGrowthReviewReadModel({
    routeParams,
    runtime,
  })
  const campaignSelection = useGrowthReviewCampaignSelection({
    apiClient: runtime.apiClient,
    routeParams,
    workspaceId: growthReview.workspaceId,
  })
  const selectedCampaignId = campaignSelection.selectedCampaignId || growthReview.campaignId
  const refresh = useGrowthReviewRefresh({
    apiClient: runtime.apiClient,
    campaignId: selectedCampaignId,
    onCompleted: growthReview.reload,
    workspaceId: growthReview.workspaceId,
  })
  const acceptedTreatmentDrilldown = useAcceptedTreatmentDrilldown({
    apiClient: runtime.apiClient,
    campaignId: selectedCampaignId,
    workspaceId: growthReview.workspaceId,
  })
  const page = growthReview.page

  if (growthReview.status === 'loading' || !page) {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <DentalGrowthReviewSkeleton />
      </PageShell>
    )
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <DentalGrowthReviewDashboard
        acceptedTreatmentDrilldown={acceptedTreatmentDrilldown}
        apiClient={runtime.apiClient}
        campaignSelector={(
          <GrowthReviewCampaignSelector
            campaigns={campaignSelection.campaigns}
            error={campaignSelection.error}
            isLoading={campaignSelection.isLoading}
            onRetry={campaignSelection.reload}
            onSelect={campaignSelection.selectCampaign}
            selectedCampaign={campaignSelection.selectedCampaign ?? page.campaign}
            status={campaignSelection.status}
          />
        )}
        funnelEmptyAction={funnelEmptyAction}
        onLayoutSaved={growthReview.reload}
        onRetry={growthReview.reload}
        page={page}
        refresh={refresh}
        viewer={runtime.viewer}
        workspaceId={growthReview.workspaceId}
      />
    </PageShell>
  )
}
