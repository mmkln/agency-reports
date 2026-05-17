import { getClientUpdatesPage } from '../../../domain/services/clientUpdatesService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  UpdatesSummary,
  UpdatesTimeline,
} from '../../../widgets/client-updates'

export function ClientUpdatesPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-updates:${clientId}`,
    load: () => runtime.dataClient.read((repositories) => getClientUpdatesPage({
      clientId,
      repositories,
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

  return (
    <div className="grid gap-6">
      <UpdatesSummary latestUpdate={page.latestUpdate} updateCount={page.updates.length} />
      <UpdatesTimeline counts={page.counts} updates={page.updates} />
    </div>
  )
}
