import { Link } from 'react-router-dom'

import {
  Button,
  PageShell,
} from '@/shared/ui'

import { listAdminClients } from '../../../domain/services/adminClientService'
import { listAdminPerformanceDashboardPeriods } from '../../../domain/services/adminPerformanceDashboardService'
import { listAdminReports } from '../../../domain/services/adminReportService'
import { listAdminDashboardLinks } from '../../../domain/services/dashboardLinkService'
import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../../features/admin-client-workspace'
import { Icon } from '../../../shared/icons'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { AdminClientReportsDashboardsWorkspace } from '../../../widgets/admin-client-reports-dashboards'

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message} status="error" />
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
  const isClinic = Boolean(client)

  if (workspaceResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (workspaceResource.status === 'error' || !client) {
    return <WorkspaceErrorState message={workspaceResource.error || 'Account was not found.'} />
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
        eyebrow={isClinic ? 'Clinic results' : 'Reports & Dashboards'}
        primaryAction={{
          children: isClinic ? 'New Clinic Performance' : 'New Performance',
          to: `/admin/performance-dashboards?clientId=${client.id}&createPerformanceDashboard=true`,
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
