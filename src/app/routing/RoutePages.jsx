/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { ClientOverviewPage } from '../../pages/client/overview/ClientOverviewPage'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import { ClientDashboardPage } from '../../pages/client/dashboard/ClientDashboardPage'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientReportsPage } from '../../pages/client/reports/ClientReportsPage'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { AdminClientAccessPage } from '../../pages/admin/client-access/AdminClientAccessPage'
import { AdminClientActivityPage } from '../../pages/admin/client-activity/AdminClientActivityPage'
import { AdminClientRequestsPage } from '../../pages/admin/client-requests/AdminClientRequestsPage'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminDashboardLinksPage } from '../../pages/admin/dashboard-links/AdminDashboardLinksPage'
import { AdminDashboardLinksPageHeader } from '../../pages/admin/dashboard-links/AdminDashboardLinksPageHeader'
import { AdminReportsPage } from '../../pages/admin/reports/AdminReportsPage'
import { AdminReportsPageHeader } from '../../pages/admin/reports/AdminReportsPageHeader'
import { AdminClientOverviewPage } from '../../pages/admin/client-overview/AdminClientOverviewPage'
import { TeamTasksPage } from '../../pages/team/tasks/TeamTasksPage'
import { TeamTasksPageHeader } from '../../pages/team/tasks/TeamTasksPageHeader'

const LoadingFallback = () => <div className="p-6 text-sm text-slate-500">Loading...</div>

function withPageProps(PageComponent, HeaderComponent) {
  return function PageWithProps() {
    const { runtime, onAuthChange } = useAuth()
    const [searchParams] = useSearchParams()
    const routeParams = Object.fromEntries(searchParams.entries())

    return (
      <Suspense fallback={<LoadingFallback />}>
        <PageComponent
          header={HeaderComponent}
          onAuthChange={onAuthChange}
          routeParams={routeParams}
          runtime={runtime}
        />
      </Suspense>
    )
  }
}

export const ClientOverviewPageRoute = withPageProps(ClientOverviewPage, ClientOverviewPageHeader)
export const ClientDashboardPageRoute = withPageProps(ClientDashboardPage, ClientDashboardPageHeader)
export const ClientReportsPageRoute = withPageProps(ClientReportsPage, ClientReportsPageHeader)
export const AdminClientsPageRoute = withPageProps(AdminClientsPage, AdminClientsPageHeader)
export const AdminDashboardLinksPageRoute = withPageProps(AdminDashboardLinksPage, AdminDashboardLinksPageHeader)
export const AdminReportsPageRoute = withPageProps(AdminReportsPage, AdminReportsPageHeader)
export const AdminClientAccessPageRoute = withPageProps(AdminClientAccessPage, undefined)
export const AdminClientActivityPageRoute = withPageProps(AdminClientActivityPage, undefined)
export const AdminClientRequestsPageRoute = withPageProps(AdminClientRequestsPage, undefined)
export const AdminClientPreviewPageRoute = withPageProps(ClientOverviewPage, ClientOverviewPageHeader)
export const AdminClientOverviewPageRoute = withPageProps(AdminClientOverviewPage, undefined)
export const AdminTasksPageRoute = withPageProps(TeamTasksPage, TeamTasksPageHeader)
export const TeamTasksPageRoute = withPageProps(TeamTasksPage, TeamTasksPageHeader)
