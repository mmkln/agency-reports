/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { ClientActionNeededPage } from '../../pages/client/action-needed/ClientActionNeededPage'
import { ClientActionNeededPageHeader } from '../../pages/client/action-needed/ClientActionNeededPageHeader'
import { ClientCallsBookingsPage } from '../../pages/client/calls-bookings/ClientCallsBookingsPage'
import { ClientCallsBookingsPageHeader } from '../../pages/client/calls-bookings/ClientCallsBookingsPageHeader'
import {
  ClientComplianceApprovalsPage,
} from '../../pages/client/compliance-approvals/ClientComplianceApprovalsPage'
import {
  ClientComplianceApprovalsPageHeader,
} from '../../pages/client/compliance-approvals/ClientComplianceApprovalsPageHeader'
import { ClientOverviewPage } from '../../pages/client/overview/ClientOverviewPage'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import { ClientDashboardPage } from '../../pages/client/dashboard/ClientDashboardPage'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientExecutivePerformancePage } from '../../pages/client/executive-performance/ClientExecutivePerformancePage'
import { ClientFilesLinksPage } from '../../pages/client/files-links/ClientFilesLinksPage'
import { ClientFilesLinksPageHeader } from '../../pages/client/files-links/ClientFilesLinksPageHeader'
import { ClientMonthlyStrategyPage } from '../../pages/client/monthly-strategy/ClientMonthlyStrategyPage'
import { ClientPatientAcquisitionPage } from '../../pages/client/patient-acquisition/ClientPatientAcquisitionPage'
import {
  ClientPatientAcquisitionPageHeader,
} from '../../pages/client/patient-acquisition/ClientPatientAcquisitionPageHeader'
import { ClientPerformancePage } from '../../pages/client/performance/ClientPerformancePage'
import { ClientPerformancePageHeader } from '../../pages/client/performance/ClientPerformancePageHeader'
import { ClientProjectsPage } from '../../pages/client/projects/ClientProjectsPage'
import { ClientProjectsPageHeader } from '../../pages/client/projects/ClientProjectsPageHeader'
import { ClientRequestsPage } from '../../pages/client/requests/ClientRequestsPage'
import { ClientRequestsPageHeader } from '../../pages/client/requests/ClientRequestsPageHeader'
import { ClientReportsDashboardsPage } from '../../pages/client/reports-dashboards/ClientReportsDashboardsPage'
import { ClientReportsDashboardsPageHeader } from '../../pages/client/reports-dashboards/ClientReportsDashboardsPageHeader'
import { ClientReportsPage } from '../../pages/client/reports/ClientReportsPage'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { ClientReputationPage } from '../../pages/client/reputation/ClientReputationPage'
import { ClientReputationPageHeader } from '../../pages/client/reputation/ClientReputationPageHeader'
import { ClientSettingsPage } from '../../pages/client/settings/ClientSettingsPage'
import { ClientSettingsPageHeader } from '../../pages/client/settings/ClientSettingsPageHeader'
import { ClientServiceLinesPage } from '../../pages/client/service-lines/ClientServiceLinesPage'
import { ClientServiceLinesPageHeader } from '../../pages/client/service-lines/ClientServiceLinesPageHeader'
import { ClientUpdatesPage } from '../../pages/client/updates/ClientUpdatesPage'
import { ClientUpdatesPageHeader } from '../../pages/client/updates/ClientUpdatesPageHeader'
import { AdminClientAccessPage } from '../../pages/admin/client-access/AdminClientAccessPage'
import { AdminClientActivityPage } from '../../pages/admin/client-activity/AdminClientActivityPage'
import { AdminClientFilesLinksPage } from '../../pages/admin/client-files-links'
import { AdminClientReportsDashboardsPage } from '../../pages/admin/client-reports-dashboards'
import { AdminClientRequestsPage } from '../../pages/admin/client-requests/AdminClientRequestsPage'
import { AdminClientSubmittedRequestsPage } from '../../pages/admin/client-submitted-requests'
import { AdminClientUpdatesPage } from '../../pages/admin/client-updates'
import { AdminClientWorkReviewPage } from '../../pages/admin/client-work-review/AdminClientWorkReviewPage'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminClinicCompliancePage } from '../../pages/admin/clinic-compliance'
import { AdminClinicMetricsPage } from '../../pages/admin/clinic-metrics'
import { AdminClinicReportingPage } from '../../pages/admin/clinic-reporting'
import { AdminClinicReputationPage } from '../../pages/admin/clinic-reputation'
import { AdminClinicSetupPage } from '../../pages/admin/clinic-setup'
import { AdminDashboardLinksPage } from '../../pages/admin/dashboard-links/AdminDashboardLinksPage'
import { DentalGrowthReviewPage } from '../../pages/dashboards/dental-growth-review'
import { AdminDashboardLinksPageHeader } from '../../pages/admin/dashboard-links/AdminDashboardLinksPageHeader'
import { AdminPerformanceDashboardEditorPage } from '../../pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPage'
import { AdminPerformanceDashboardEditorPageHeader } from '../../pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPageHeader'
import { AdminPerformanceDashboardsPage } from '../../pages/admin/performance-dashboards/AdminPerformanceDashboardsPage'
import { AdminPerformanceDashboardsPageHeader } from '../../pages/admin/performance-dashboards/AdminPerformanceDashboardsPageHeader'
import { AdminReportsPage } from '../../pages/admin/reports/AdminReportsPage'
import { AdminReportsPageHeader } from '../../pages/admin/reports/AdminReportsPageHeader'
import { AdminClientOverviewPage } from '../../pages/admin/client-overview/AdminClientOverviewPage'
import { TeamTasksPage } from '../../pages/team/tasks/TeamTasksPage'
import { TeamTasksPageHeader } from '../../pages/team/tasks/TeamTasksPageHeader'
import { ClinicDailyOpsPage } from '../../pages/clinic/daily-ops/ClinicDailyOpsPage'
import { TeamClinicOperatorPage } from '../../pages/team/clinic-operator/TeamClinicOperatorPage'
import { AccountSettingsPage } from '../../pages/account/settings/AccountSettingsPage'

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>

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
export const ClientActionNeededPageRoute = withPageProps(
  ClientActionNeededPage,
  ClientActionNeededPageHeader,
)
export const ClientCallsBookingsPageRoute = withPageProps(
  ClientCallsBookingsPage,
  ClientCallsBookingsPageHeader,
)
export const ClientComplianceApprovalsPageRoute = withPageProps(
  ClientComplianceApprovalsPage,
  ClientComplianceApprovalsPageHeader,
)
export const ClientDashboardPageRoute = withPageProps(ClientDashboardPage, ClientDashboardPageHeader)
export const ClientExecutivePerformancePageRoute = withPageProps(ClientExecutivePerformancePage, undefined)
export const ClientFilesLinksPageRoute = withPageProps(ClientFilesLinksPage, ClientFilesLinksPageHeader)
export const ClientMonthlyStrategyPageRoute = withPageProps(ClientMonthlyStrategyPage, undefined)
export const ClientPatientAcquisitionPageRoute = withPageProps(
  ClientPatientAcquisitionPage,
  ClientPatientAcquisitionPageHeader,
)
export const ClientPerformancePageRoute = withPageProps(ClientPerformancePage, ClientPerformancePageHeader)
export const ClientProjectsPageRoute = withPageProps(ClientProjectsPage, ClientProjectsPageHeader)
export const ClientRequestsPageRoute = withPageProps(ClientRequestsPage, ClientRequestsPageHeader)
export const ClientReportsDashboardsPageRoute = withPageProps(
  ClientReportsDashboardsPage,
  ClientReportsDashboardsPageHeader,
)
export const ClientReportsPageRoute = withPageProps(ClientReportsPage, ClientReportsPageHeader)
export const ClientReputationPageRoute = withPageProps(ClientReputationPage, ClientReputationPageHeader)
export const ClientSettingsPageRoute = withPageProps(ClientSettingsPage, ClientSettingsPageHeader)
export const ClientServiceLinesPageRoute = withPageProps(ClientServiceLinesPage, ClientServiceLinesPageHeader)
export const ClientUpdatesPageRoute = withPageProps(ClientUpdatesPage, ClientUpdatesPageHeader)
export const AdminClientsPageRoute = withPageProps(AdminClientsPage, AdminClientsPageHeader)
export const AdminDashboardLinksPageRoute = withPageProps(AdminDashboardLinksPage, AdminDashboardLinksPageHeader)
export const DentalGrowthReviewPageRoute = withPageProps(DentalGrowthReviewPage, undefined)
export const AdminPerformanceDashboardsPageRoute = withPageProps(
  AdminPerformanceDashboardsPage,
  AdminPerformanceDashboardsPageHeader,
)
export const AdminPerformanceDashboardEditorPageRoute = withPageProps(
  AdminPerformanceDashboardEditorPage,
  AdminPerformanceDashboardEditorPageHeader,
)
export const AdminReportsPageRoute = withPageProps(AdminReportsPage, AdminReportsPageHeader)
export const AdminClientAccessPageRoute = withPageProps(AdminClientAccessPage, undefined)
export const AdminClientActivityPageRoute = withPageProps(AdminClientActivityPage, undefined)
export const AdminClientFilesLinksPageRoute = withPageProps(AdminClientFilesLinksPage, undefined)
export const AdminClientReportsDashboardsPageRoute = withPageProps(AdminClientReportsDashboardsPage, undefined)
export const AdminClientRequestsPageRoute = withPageProps(AdminClientRequestsPage, undefined)
export const AdminClientSubmittedRequestsPageRoute = withPageProps(AdminClientSubmittedRequestsPage, undefined)
export const AdminClientUpdatesPageRoute = withPageProps(AdminClientUpdatesPage, undefined)
export const AdminClientWorkReviewPageRoute = withPageProps(AdminClientWorkReviewPage, undefined)
export const AdminClientPreviewPageRoute = withPageProps(ClientOverviewPage, ClientOverviewPageHeader)
export const AdminClientOverviewPageRoute = withPageProps(AdminClientOverviewPage, undefined)
export const AdminClinicCompliancePageRoute = withPageProps(AdminClinicCompliancePage, undefined)
export const AdminClinicMetricsPageRoute = withPageProps(AdminClinicMetricsPage, undefined)
export const AdminClinicReportingPageRoute = withPageProps(AdminClinicReportingPage, undefined)
export const AdminClinicReputationPageRoute = withPageProps(AdminClinicReputationPage, undefined)
export const AdminClinicSetupPageRoute = withPageProps(AdminClinicSetupPage, undefined)
export const AdminTasksPageRoute = withPageProps(TeamTasksPage, TeamTasksPageHeader)
export const AccountSettingsPageRoute = withPageProps(AccountSettingsPage, undefined)
export const ClinicDailyOpsPageRoute = withPageProps(ClinicDailyOpsPage, undefined)
export const TeamClinicOperatorPageRoute = withPageProps(TeamClinicOperatorPage, undefined)
export const TeamTasksPageRoute = withPageProps(TeamTasksPage, TeamTasksPageHeader)
