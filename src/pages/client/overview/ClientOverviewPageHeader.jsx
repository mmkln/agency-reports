import { getClientOverviewPage } from '../../../domain/services/clientOverviewService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { PageHeader, StatusBadge } from '@/shared/ui'

function ProjectStatusAction({ client }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ui text-text-muted">Project status:</span>
      <StatusBadge meta={client.statusMeta} />
    </div>
  )
}

export function ClientOverviewPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = routeParams.preview === 'draft' ? 'draft' : 'published'
  const overviewResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:overview-header:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientOverviewPage({
      clientId,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const overview = overviewResource.data

  if (overviewResource.status === 'loading' || !overview) {
    return <PageHeader title="Overview" width={activeRoute?.contentWidth} />
  }

  if (overviewResource.status === 'error' || overview.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<ProjectStatusAction client={overview.client} />}
      title={overview.client.name}
      width={activeRoute?.contentWidth}
    />
  )
}
