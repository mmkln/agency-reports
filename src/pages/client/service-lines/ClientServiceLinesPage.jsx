import { getClientClinicServiceLinesPage } from '../../../domain/services/clinicClientService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import { ClientServiceLinesView } from '../../../widgets/client-service-lines'
import { getClinicPreviewSource } from '../clinicPreviewSource'

export function ClientServiceLinesPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = getClinicPreviewSource(routeParams)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-service-lines:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientClinicServiceLinesPage({
      clientId,
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

  return <ClientServiceLinesView page={page} />
}
