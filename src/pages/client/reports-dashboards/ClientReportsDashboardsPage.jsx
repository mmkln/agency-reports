import { getClientReportsDashboardsPage } from '../../../domain/services/clientReportsDashboardsService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  CurrentPerformanceSection,
  ReportArchiveSection,
  ResultsHeader,
  SelectedReportSection,
  SourceDashboardSection,
} from '../../../widgets/client-reports-dashboards'

export function ClientReportsDashboardsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const mode = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client'
  const performancePeriodId = routeParams.performancePeriodId ?? routeParams.periodId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:reports-dashboards:${clientId}:${routeParams.dashboardId ?? ''}:${performancePeriodId ?? ''}:${routeParams.reportId ?? ''}`,
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
      <ResultsHeader page={page} />
      <CurrentPerformanceSection mode={mode} performancePage={page.performancePage} />
      <SourceDashboardSection clientId={clientId} dashboardPage={page.dashboardPage} />
      <SelectedReportSection clientId={clientId} reportsPage={page.reportsPage} />
      <ReportArchiveSection clientId={clientId} reportsPage={page.reportsPage} />
    </div>
  )
}
