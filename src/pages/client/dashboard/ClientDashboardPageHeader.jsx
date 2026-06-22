import { PageHeader, StatusBadge } from '@/shared/ui'

import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { getClientPageMode } from '../clientPageAccess'

function HeaderAction({ dashboard }) {
  if (!dashboard) {
    return null
  }

  return <StatusBadge meta={dashboard.statusMeta} />
}

export function ClientDashboardPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const mode = getClientPageMode(runtime.viewer)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-dashboard-header:${clientId ?? ''}:${routeParams.dashboardId ?? ''}:${mode}`,
    load: () => runtime.dataClient.read((repositories) => getClientDashboardPage({
      clientId,
      dashboardId: routeParams.dashboardId,
      mode,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Marketing Dashboard" width={activeRoute?.contentWidth} />
  }

  if (page.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  if (page.redirectTo) {
    return <PageHeader title="Clinic Results" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<HeaderAction dashboard={page.dashboard} />}
      title="Marketing Dashboard"
      width={activeRoute?.contentWidth}
    />
  )
}
