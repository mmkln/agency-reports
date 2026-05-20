import { PageHeader, StatusBadge } from '@/shared/ui'

import {
  getClientReportsDashboardsPage,
} from '../../../domain/services/clientReportsDashboardsService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function HeaderActions({ page }) {
  const dashboard = page.performancePage.performanceDashboard

  return (
    <>
      {dashboard?.dataConfidenceMeta ? <StatusBadge meta={dashboard.dataConfidenceMeta} /> : null}
      {dashboard?.statusMeta ? <StatusBadge meta={dashboard.statusMeta} /> : null}
    </>
  )
}

export function ClientReportsDashboardsPageHeader({ activeRoute, routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const mode = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client'
  const performancePeriodId = routeParams.performancePeriodId ?? routeParams.periodId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:reports-dashboards-header:${clientId}:${routeParams.dashboardId ?? ''}:${performancePeriodId ?? ''}:${routeParams.reportId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClientReportsDashboardsPage({
      clientId,
      dashboardId: routeParams.dashboardId,
      mode,
      performancePeriodId,
      reportId: routeParams.reportId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <PageHeader title="Reports & Dashboards" width={activeRoute?.contentWidth} />
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <PageHeader title="Access denied" width={activeRoute?.contentWidth} />
  }

  return (
    <PageHeader
      actions={<HeaderActions page={page} />}
      title={page.copy.pageTitle}
      width={activeRoute?.contentWidth}
    />
  )
}
