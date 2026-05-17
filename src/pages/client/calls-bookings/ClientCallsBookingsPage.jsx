import { getClientCallsBookingsPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import { ClientCallsBookingsView } from '../../../widgets/client-calls-bookings'
import { getClinicAnalyticsFilterKey, getClinicAnalyticsFilters } from '../clinicAnalyticsFilters'
import { getClinicPreviewSource } from '../clinicPreviewSource'

export function ClientCallsBookingsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = getClinicPreviewSource(routeParams)
  const filters = getClinicAnalyticsFilters(routeParams)
  const filterKey = getClinicAnalyticsFilterKey(filters)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-calls-bookings:${clientId}:${previewSource}:${filterKey}`,
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
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <AccessDeniedState />
  }

  return <ClientCallsBookingsView page={page} />
}
