import { Link } from 'react-router-dom'

import {
  Button,
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import { listAdminClients } from '../../../domain/services/adminClientService'
import { listAdminPerformanceDashboardPeriods } from '../../../domain/services/adminPerformanceDashboardService'
import { listAdminReports } from '../../../domain/services/adminReportService'
import { listAdminDashboardLinks } from '../../../domain/services/dashboardLinkService'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { AdminClientReportsDashboardsWorkspace } from '../../../widgets/admin-client-reports-dashboards'

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <Card className="bg-block shadow-none">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <Card className="bg-block shadow-none">
        <CardContent className="flex min-h-[260px] items-center justify-center text-ui text-destructive">
          {message}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function AdminClientReportsDashboardsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const workspaceResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-reports-dashboards:${clientId ?? ''}`,
    initialData: {
      clients: [],
      dashboardLinks: [],
      periods: [],
      reports: [],
    },
    load: () => runtime.dataClient.read((repositories) => ({
      clients: listAdminClients({
        repositories,
        viewer: runtime.viewer,
      }),
      dashboardLinks: listAdminDashboardLinks({
        repositories,
        viewer: runtime.viewer,
      }),
      periods: listAdminPerformanceDashboardPeriods({
        repositories,
        viewer: runtime.viewer,
      }),
      reports: listAdminReports({
        repositories,
        viewer: runtime.viewer,
      }),
    })),
  })
  const workspace = workspaceResource.data
  const client = workspace?.clients.find((item) => item.id === clientId) ?? workspace?.clients[0] ?? null
  const selectedClientId = client?.id ?? ''
  const dashboardLinks = workspace?.dashboardLinks.filter((dashboardLink) => dashboardLink.clientId === selectedClientId) ?? []
  const periods = workspace?.periods.filter((period) => period.clientId === selectedClientId) ?? []
  const reports = workspace?.reports.filter((report) => report.clientId === selectedClientId) ?? []

  if (workspaceResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workspaceResource.status === 'error' || !client) {
    return <WorkspaceErrorState message={workspaceResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <>
            <Button asChild size="sm" variant="outline">
              <Link to={`/admin/dashboard-links?clientId=${client.id}&newDashboard=true`}>
                <Icon name="layoutDashboard" size={14} />
                Source dashboard
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/admin/reports?clientId=${client.id}&newReport=true`}>
                <Icon name="fileText" size={14} />
                Report
              </Link>
            </Button>
          </>
        )}
        client={client}
        currentPage="reports-dashboards"
        eyebrow="Reports & Dashboards"
        primaryAction={{
          children: 'New Performance',
          to: `/admin/performance-dashboards?clientId=${client.id}&newPerformanceDashboard=true`,
        }}
        width="content"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        <AdminClientReportsDashboardsWorkspace
          clientId={client.id}
          dashboardLinks={dashboardLinks}
          periods={periods}
          reports={reports}
        />
      </PageShell>
    </>
  )
}
