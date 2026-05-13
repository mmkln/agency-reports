import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { ClientOverviewPage } from '../../pages/client/overview/ClientOverviewPage'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import { ClientDashboardPage } from '../../pages/client/dashboard/ClientDashboardPage'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientReportsPage } from '../../pages/client/reports/ClientReportsPage'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
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
export const AdminClientPreviewPageRoute = withPageProps(ClientOverviewPage, ClientOverviewPageHeader)
export const AdminClientOverviewPageRoute = withPageProps(AdminClientOverviewPage, undefined)
export const TeamTasksPageRoute = withPageProps(TeamTasksPage, TeamTasksPageHeader)
