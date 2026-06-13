import { Link } from 'react-router-dom'

import {
  AdminClientWorkspaceFrame,
  getWorkspaceReviewSetupPath,
  resolveRouteWorkspaceId,
} from '@/features/admin-client-workspace'
import { Button } from '@/shared/ui'
import { DentalGrowthReviewPage } from '../../dashboards/dental-growth-review'

export function AgencyWorkspaceReviewPage({ routeParams = {}, runtime }) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })
  const reviewSetupHref = workspaceId ? getWorkspaceReviewSetupPath(workspaceId) : ''

  return (
    <AdminClientWorkspaceFrame
      currentPage="review"
      routeParams={routeParams}
      runtime={runtime}
      width="full"
    >
      <DentalGrowthReviewPage
        funnelEmptyAction={workspaceId ? (
          <Button asChild size="sm" variant="secondary">
            <Link to={reviewSetupHref}>Open Review Setup</Link>
          </Button>
        ) : null}
        routeParams={{
          ...routeParams,
          clientId: workspaceId,
          workspaceId,
        }}
        runtime={runtime}
      />
    </AdminClientWorkspaceFrame>
  )
}
