import { Badge, PageHeader } from '@/shared/ui'

import { getClientComplianceApprovalsPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { getClinicPreviewSource } from '../clinicPreviewSource'

function HeaderActions({ approvalCount, latestUpdatedAt, reviewCount }) {
  return (
    <div className="flex items-center gap-tag">
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {reviewCount} review{reviewCount === 1 ? '' : 's'}
      </Badge>
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {approvalCount} approval{approvalCount === 1 ? '' : 's'}
      </Badge>
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        Updated {latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleDateString() : 'not set'}
      </Badge>
    </div>
  )
}

export function ClientComplianceApprovalsPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = getClinicPreviewSource(routeParams)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:compliance-approvals-header:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientComplianceApprovalsPage({
      clientId,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Compliance & Approvals" />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={(
        <HeaderActions
          approvalCount={page.approvals.length}
          latestUpdatedAt={page.latestUpdatedAt}
          reviewCount={page.reviews.length}
        />
      )}
      title="Compliance & Approvals"
    />
  )
}
