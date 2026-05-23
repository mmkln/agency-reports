import { PageHeader, StatusBadge } from '@/shared/ui'

import { getClientPerformanceDashboardPage } from '../../../domain/services/clientPerformanceDashboardService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { getClientPageMode } from '../clientPageAccess'

function HeaderActions({ dashboard }) {
  if (!dashboard) {
    return null
  }

  return (
    <>
      <StatusBadge meta={dashboard.dataConfidenceMeta} />
      <StatusBadge meta={dashboard.statusMeta} />
    </>
  )
}

export function ClientPerformancePageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const periodId = routeParams.performancePeriodId ?? routeParams.periodId
  const mode = getClientPageMode(runtime.viewer)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-performance-header:${clientId ?? ''}:${periodId ?? ''}:${mode}`,
    load: () => runtime.dataClient.read((repositories) => getClientPerformanceDashboardPage({
      clientId,
      mode,
      periodId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Performance Dashboard" width={activeRoute?.contentWidth} />
  }

  if (page.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  if (page.redirectTo) {
    return <PageHeader title="Clinic Results" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<HeaderActions dashboard={page.performanceDashboard} />}
      title="Performance Dashboard"
      width={activeRoute?.contentWidth}
    />
  )
}
