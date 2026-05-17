import { Badge, PageHeader } from '@/shared/ui'

import { getClientClinicServiceLinesPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { getClinicAnalyticsFilterKey, getClinicAnalyticsFilters } from '../clinicAnalyticsFilters'
import { getClinicPreviewSource } from '../clinicPreviewSource'

function HeaderActions({ locationCount, serviceLineCount }) {
  return (
    <div className="flex items-center gap-tag">
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {serviceLineCount} service line{serviceLineCount === 1 ? '' : 's'}
      </Badge>
      <Badge className="border-control-border bg-block text-text-secondary" variant="outline">
        {locationCount} location{locationCount === 1 ? '' : 's'}
      </Badge>
    </div>
  )
}

export function ClientServiceLinesPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = getClinicPreviewSource(routeParams)
  const filters = getClinicAnalyticsFilters(routeParams)
  const filterKey = getClinicAnalyticsFilterKey(filters)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:service-lines-header:${clientId}:${previewSource}:${filterKey}`,
    load: () => runtime.dataClient.read((repositories) => getClientClinicServiceLinesPage({
      clientId,
      filters,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Service Lines" width={activeRoute?.contentWidth} />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={(
        <HeaderActions
          locationCount={page.locations.length}
          serviceLineCount={page.serviceLines.length}
        />
      )}
      title="Service Lines"
      width={activeRoute?.contentWidth}
    />
  )
}
