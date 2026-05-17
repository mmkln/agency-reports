import { Badge, PageHeader } from '@/shared/ui'

import { getClientCallsBookingsPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { getClinicAnalyticsFilterKey, getClinicAnalyticsFilters } from '../clinicAnalyticsFilters'
import { getClinicPreviewSource } from '../clinicPreviewSource'

function HeaderActions({ latestUpdatedAt, metricCount }) {
  return (
    <div className="flex items-center gap-tag">
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {metricCount} segment{metricCount === 1 ? '' : 's'}
      </Badge>
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        Updated {latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleDateString() : 'not set'}
      </Badge>
    </div>
  )
}

export function ClientCallsBookingsPageHeader({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = getClinicPreviewSource(routeParams)
  const filters = getClinicAnalyticsFilters(routeParams)
  const filterKey = getClinicAnalyticsFilterKey(filters)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:calls-bookings-header:${clientId}:${previewSource}:${filterKey}`,
    load: () => runtime.dataClient.read((repositories) => getClientCallsBookingsPage({
      clientId,
      filters,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Calls & Bookings" />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" />
  }

  return (
    <PageHeader
      actions={(
        <HeaderActions
          latestUpdatedAt={page.latestUpdatedAt}
          metricCount={page.metrics.length}
        />
      )}
      title="Calls & Bookings"
    />
  )
}
