import { Badge, PageHeader } from '@/shared/ui'

import { getClientPatientAcquisitionPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function HeaderActions({ latestUpdatedAt, snapshotCount }) {
  return (
    <div className="flex items-center gap-tag">
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {snapshotCount} snapshot{snapshotCount === 1 ? '' : 's'}
      </Badge>
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        Updated {latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleDateString() : 'not set'}
      </Badge>
    </div>
  )
}

export function ClientPatientAcquisitionPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:patient-acquisition-header:${clientId}`,
    load: () => runtime.dataClient.read((repositories) => getClientPatientAcquisitionPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Patient Acquisition" />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={(
        <HeaderActions
          latestUpdatedAt={page.latestUpdatedAt}
          snapshotCount={page.snapshots.length}
        />
      )}
      title="Patient Acquisition"
    />
  )
}
