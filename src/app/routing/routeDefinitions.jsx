/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { CLIENT_TYPES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
import { AcceptInvitePage } from '../../pages/auth/accept-invite/AcceptInvitePage'
import { LoginPage } from '../../pages/auth/login/LoginPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminDashboardLinksPageHeader } from '../../pages/admin/dashboard-links/AdminDashboardLinksPageHeader'
import { AdminPerformanceDashboardEditorPageHeader } from '../../pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPageHeader'
import { AdminPerformanceDashboardsPageHeader } from '../../pages/admin/performance-dashboards/AdminPerformanceDashboardsPageHeader'
import { AdminReportsPageHeader } from '../../pages/admin/reports/AdminReportsPageHeader'
import { ClientActionNeededPageHeader } from '../../pages/client/action-needed/ClientActionNeededPageHeader'
import { ClientCallsBookingsPageHeader } from '../../pages/client/calls-bookings/ClientCallsBookingsPageHeader'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientFilesLinksPageHeader } from '../../pages/client/files-links/ClientFilesLinksPageHeader'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import {
  ClientPatientAcquisitionPageHeader,
} from '../../pages/client/patient-acquisition/ClientPatientAcquisitionPageHeader'
import { ClientPerformancePageHeader } from '../../pages/client/performance/ClientPerformancePageHeader'
import { ClientProjectsPageHeader } from '../../pages/client/projects/ClientProjectsPageHeader'
import { ClientReportsDashboardsPageHeader } from '../../pages/client/reports-dashboards/ClientReportsDashboardsPageHeader'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { ClientReputationPageHeader } from '../../pages/client/reputation/ClientReputationPageHeader'
import { ClientRequestsPageHeader } from '../../pages/client/requests/ClientRequestsPageHeader'
import { ClientSettingsPageHeader } from '../../pages/client/settings/ClientSettingsPageHeader'
import { ClientServiceLinesPageHeader } from '../../pages/client/service-lines/ClientServiceLinesPageHeader'
import { ClientUpdatesPageHeader } from '../../pages/client/updates/ClientUpdatesPageHeader'
import { TeamTasksPageHeader } from '../../pages/team/tasks/TeamTasksPageHeader'
import { AccessDeniedPage } from '../../pages/system/access-denied/AccessDeniedPage'
import { AuthLayout } from '../layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import {
  AdminClientAccessPageRoute,
  AdminClientActivityPageRoute,
  AdminClientFilesLinksPageRoute,
  AdminClientOverviewPageRoute,
  AdminClientPreviewPageRoute,
  AdminClientReportsDashboardsPageRoute,
  AdminClientRequestsPageRoute,
  AdminClientSubmittedRequestsPageRoute,
  AdminClientUpdatesPageRoute,
  AdminClientWorkReviewPageRoute,
  AdminClientsPageRoute,
  AdminDashboardLinksPageRoute,
  AdminPerformanceDashboardEditorPageRoute,
  AdminPerformanceDashboardsPageRoute,
  AdminReportsPageRoute,
  AdminTasksPageRoute,
  ClientActionNeededPageRoute,
  ClientCallsBookingsPageRoute,
  ClientDashboardPageRoute,
  ClientFilesLinksPageRoute,
  ClientOverviewPageRoute,
  ClientPatientAcquisitionPageRoute,
  ClientPerformancePageRoute,
  ClientProjectsPageRoute,
  ClientReportsDashboardsPageRoute,
  ClientReportsPageRoute,
  ClientReputationPageRoute,
  ClientRequestsPageRoute,
  ClientSettingsPageRoute,
  ClientServiceLinesPageRoute,
  ClientUpdatesPageRoute,
  TeamTasksPageRoute,
} from './RoutePages'

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })))
}

const BuildBoardPage = lazyNamed(() => import('../../pages/legacy/build-board/BuildBoardPage'), 'BuildBoardPage')
const CrmDashboardPage = lazyNamed(() => import('../../pages/legacy/crm-dashboard/CrmDashboardPage'), 'CrmDashboardPage')
const DailyActivitiesPage = lazyNamed(() => import('../../pages/legacy/daily-activities/DailyActivitiesPage'), 'DailyActivitiesPage')
const LandingPage = lazyNamed(() => import('../../pages/legacy/landing/LandingPage'), 'LandingPage')
const MarketingProcessPage = lazyNamed(() => import('../../pages/legacy/marketing-process/MarketingProcessPage'), 'MarketingProcessPage')
const MarketingReportsPage = lazyNamed(() => import('../../pages/legacy/marketing-reports/MarketingReportsPage'), 'MarketingReportsPage')

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>

export const routeDefinitions = [
  {
    path: '/',
    id: 'landing',
    label: 'Landing',
    layout: 'public',
    showInNav: false,
    element: <LandingPage />,
  },
  {
    path: '/accept-invite',
    id: 'accept-invite',
    label: 'Accept Invite',
    layout: 'auth',
    showInNav: false,
    element: <AcceptInvitePage />,
  },
  {
    path: '/login',
    id: 'login',
    label: 'Login',
    layout: 'auth',
    showInNav: false,
    element: <LoginPage />,
  },
  {
    path: '/access-denied',
    id: 'access-denied',
    label: 'Access Denied',
    layout: 'auth',
    showInNav: false,
    element: <AccessDeniedPage />,
  },
  {
    path: '/client/overview',
    id: 'client-overview',
    label: 'Overview',
    pageTitle: 'Client Overview',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientOverviewPageHeader,
    iconName: 'layoutDashboard',
    element: <ClientOverviewPageRoute />,
  },
  {
    path: '/client/dashboard',
    id: 'client-dashboard',
    label: 'Dashboard',
    pageTitle: 'Marketing Dashboard',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientDashboardPageHeader,
    showInNav: false,
    iconName: 'layoutDashboard',
    element: <ClientDashboardPageRoute />,
  },
  {
    path: '/client/action-needed',
    id: 'client-action-needed',
    label: 'Action Needed',
    pageTitle: 'Action Needed',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientActionNeededPageHeader,
    iconName: 'bell',
    element: <ClientActionNeededPageRoute />,
  },
  {
    path: '/client/performance',
    id: 'client-performance',
    label: 'Performance',
    pageTitle: 'Performance Dashboard',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientPerformancePageHeader,
    showInNav: false,
    iconName: 'barChart',
    element: <ClientPerformancePageRoute />,
  },
  {
    path: '/client/patient-acquisition',
    id: 'client-patient-acquisition',
    label: 'Patient Acquisition',
    pageTitle: 'Patient Acquisition',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    header: ClientPatientAcquisitionPageHeader,
    iconName: 'target',
    clientTypes: [CLIENT_TYPES.CLINIC],
    element: <ClientPatientAcquisitionPageRoute />,
  },
  {
    path: '/client/calls-bookings',
    id: 'client-calls-bookings',
    label: 'Calls & Bookings',
    pageTitle: 'Calls & Bookings',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    header: ClientCallsBookingsPageHeader,
    iconName: 'phone',
    clientTypes: [CLIENT_TYPES.CLINIC],
    element: <ClientCallsBookingsPageRoute />,
  },
  {
    path: '/client/projects',
    id: 'client-projects',
    label: 'Projects',
    pageTitle: 'Projects',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientProjectsPageHeader,
    iconName: 'checkCircle2',
    excludeClientTypes: [CLIENT_TYPES.CLINIC],
    element: <ClientProjectsPageRoute />,
  },
  {
    path: '/client/service-lines',
    id: 'client-service-lines',
    label: 'Service Lines',
    pageTitle: 'Service Lines',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientServiceLinesPageHeader,
    iconName: 'stethoscope',
    clientTypes: [CLIENT_TYPES.CLINIC],
    element: <ClientServiceLinesPageRoute />,
  },
  {
    path: '/client/reputation',
    id: 'client-reputation',
    label: 'Reputation',
    pageTitle: 'Reputation',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientReputationPageHeader,
    iconName: 'messageSquare',
    clientTypes: [CLIENT_TYPES.CLINIC],
    element: <ClientReputationPageRoute />,
  },
  {
    path: '/client/reports-dashboards',
    id: 'client-reports-dashboards',
    label: 'Reports & Dashboards',
    pageTitle: 'Reports & Dashboards',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientReportsDashboardsPageHeader,
    iconName: 'barChart',
    element: <ClientReportsDashboardsPageRoute />,
  },
  {
    path: '/client/files-links',
    id: 'client-files-links',
    label: 'Files & Links',
    pageTitle: 'Files & Links',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientFilesLinksPageHeader,
    iconName: 'fileText',
    element: <ClientFilesLinksPageRoute />,
  },
  {
    path: '/client/requests',
    id: 'client-requests',
    label: 'Requests',
    pageTitle: 'Requests',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientRequestsPageHeader,
    iconName: 'messageSquare',
    element: <ClientRequestsPageRoute />,
  },
  {
    path: '/client/updates',
    id: 'client-updates',
    label: 'Updates',
    pageTitle: 'Updates',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientUpdatesPageHeader,
    iconName: 'clock',
    element: <ClientUpdatesPageRoute />,
  },
  {
    path: '/client/settings',
    id: 'client-settings',
    label: 'Settings',
    pageTitle: 'Settings',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientSettingsPageHeader,
    iconName: 'user',
    element: <ClientSettingsPageRoute />,
  },
  {
    path: '/client/reports',
    id: 'client-reports',
    label: 'Reports',
    pageTitle: 'Monthly Reports',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    contentWidth: 'content',
    header: ClientReportsPageHeader,
    showInNav: false,
    iconName: 'fileText',
    element: <ClientReportsPageRoute />,
  },
  {
    path: '/admin/clients',
    id: 'admin-clients',
    label: 'Clients',
    pageTitle: 'Clients',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminClientsPageHeader,
    iconName: 'users',
    element: <AdminClientsPageRoute />,
  },
  {
    path: '/admin/tasks',
    id: 'admin-tasks',
    label: 'Tasks',
    pageTitle: 'Tasks',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: TeamTasksPageHeader,
    iconName: 'checkCircle2',
    element: <AdminTasksPageRoute />,
  },
  {
    path: '/admin/dashboard-links',
    id: 'admin-dashboard-links',
    label: 'Dashboards',
    pageTitle: 'Dashboard Links',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminDashboardLinksPageHeader,
    iconName: 'layoutDashboard',
    element: <AdminDashboardLinksPageRoute />,
  },
  {
    path: '/admin/performance-dashboards',
    id: 'admin-performance-dashboards',
    label: 'Performance',
    pageTitle: 'Performance Dashboards',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminPerformanceDashboardsPageHeader,
    iconName: 'barChart',
    element: <AdminPerformanceDashboardsPageRoute />,
  },
  {
    path: '/admin/performance-dashboard-editor',
    id: 'admin-performance-dashboard-editor',
    label: 'Performance Editor',
    pageTitle: 'Performance Dashboard Editor',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminPerformanceDashboardEditorPageHeader,
    showInNav: false,
    iconName: 'barChart',
    element: <AdminPerformanceDashboardEditorPageRoute />,
  },
  {
    path: '/admin/reports',
    id: 'admin-reports',
    label: 'Reports',
    pageTitle: 'Reports',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminReportsPageHeader,
    iconName: 'fileText',
    element: <AdminReportsPageRoute />,
  },
  {
    path: '/admin/client-preview',
    id: 'admin-client-preview',
    label: 'Published Client Overview Preview',
    pageTitle: 'Published Client Overview Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientOverviewPageHeader,
    showInNav: false,
    iconName: 'layoutDashboard',
    element: <AdminClientPreviewPageRoute />,
  },
  {
    path: '/admin/client-action-needed-preview',
    id: 'admin-client-action-needed-preview',
    label: 'Published Action Needed Preview',
    pageTitle: 'Published Action Needed Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientActionNeededPageHeader,
    showInNav: false,
    iconName: 'bell',
    element: <ClientActionNeededPageRoute />,
  },
  {
    path: '/admin/client-projects-preview',
    id: 'admin-client-projects-preview',
    label: 'Published Projects Preview',
    pageTitle: 'Published Projects Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientProjectsPageHeader,
    showInNav: false,
    iconName: 'checkCircle2',
    element: <ClientProjectsPageRoute />,
  },
  {
    path: '/admin/client-reports-dashboards-preview',
    id: 'admin-client-reports-dashboards-preview',
    label: 'Published Reports & Dashboards Preview',
    pageTitle: 'Published Reports & Dashboards Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientReportsDashboardsPageHeader,
    showInNav: false,
    iconName: 'barChart',
    element: <ClientReportsDashboardsPageRoute />,
  },
  {
    path: '/admin/client-files-links-preview',
    id: 'admin-client-files-links-preview',
    label: 'Published Files & Links Preview',
    pageTitle: 'Published Files & Links Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientFilesLinksPageHeader,
    showInNav: false,
    iconName: 'fileText',
    element: <ClientFilesLinksPageRoute />,
  },
  {
    path: '/admin/client-requests-preview',
    id: 'admin-client-requests-preview',
    label: 'Published Requests Preview',
    pageTitle: 'Published Requests Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientRequestsPageHeader,
    showInNav: false,
    iconName: 'messageSquare',
    element: <ClientRequestsPageRoute />,
  },
  {
    path: '/admin/client-updates-preview',
    id: 'admin-client-updates-preview',
    label: 'Published Updates Preview',
    pageTitle: 'Published Updates Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientUpdatesPageHeader,
    showInNav: false,
    iconName: 'clock',
    element: <ClientUpdatesPageRoute />,
  },
  {
    path: '/admin/client-settings-preview',
    id: 'admin-client-settings-preview',
    label: 'Published Settings Preview',
    pageTitle: 'Published Settings Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientSettingsPageHeader,
    showInNav: false,
    iconName: 'user',
    element: <ClientSettingsPageRoute />,
  },
  {
    path: '/admin/client-dashboard-preview',
    id: 'admin-client-dashboard-preview',
    label: 'Reports & Dashboards Preview',
    pageTitle: 'Reports & Dashboards Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientReportsDashboardsPageHeader,
    showInNav: false,
    iconName: 'layoutDashboard',
    element: <ClientReportsDashboardsPageRoute />,
  },
  {
    path: '/admin/client-performance-preview',
    id: 'admin-client-performance-preview',
    label: 'Reports & Dashboards Preview',
    pageTitle: 'Reports & Dashboards Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientReportsDashboardsPageHeader,
    showInNav: false,
    iconName: 'barChart',
    element: <ClientReportsDashboardsPageRoute />,
  },
  {
    path: '/admin/client-report-preview',
    id: 'admin-client-report-preview',
    label: 'Reports & Dashboards Preview',
    pageTitle: 'Reports & Dashboards Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    contentWidth: 'content',
    header: ClientReportsDashboardsPageHeader,
    showInNav: false,
    iconName: 'fileText',
    element: <ClientReportsDashboardsPageRoute />,
  },
  {
    path: '/admin/client-access',
    id: 'admin-client-access',
    label: 'Access',
    pageTitle: 'Client Access',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'users',
    element: <AdminClientAccessPageRoute />,
  },
  {
    path: '/admin/client-activity',
    id: 'admin-client-activity',
    label: 'Activity',
    pageTitle: 'Client Activity',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'clock',
    element: <AdminClientActivityPageRoute />,
  },
  {
    path: '/admin/client-files-links',
    id: 'admin-client-files-links',
    label: 'Files & Links',
    pageTitle: 'Files & Links',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'fileText',
    element: <AdminClientFilesLinksPageRoute />,
  },
  {
    path: '/admin/client-reports-dashboards',
    id: 'admin-client-reports-dashboards',
    label: 'Reports & Dashboards',
    pageTitle: 'Reports & Dashboards',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'barChart',
    element: <AdminClientReportsDashboardsPageRoute />,
  },
  {
    path: '/admin/client-requests',
    id: 'admin-client-requests',
    label: 'Actions',
    pageTitle: 'Action Needed',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'bell',
    element: <AdminClientRequestsPageRoute />,
  },
  {
    path: '/admin/client-submitted-requests',
    id: 'admin-client-submitted-requests',
    label: 'Requests',
    pageTitle: 'Client Requests',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'messageSquare',
    element: <AdminClientSubmittedRequestsPageRoute />,
  },
  {
    path: '/admin/client-updates',
    id: 'admin-client-updates',
    label: 'Updates',
    pageTitle: 'Client Updates',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'clock',
    element: <AdminClientUpdatesPageRoute />,
  },
  {
    path: '/admin/client-work-review',
    id: 'admin-client-work-review',
    label: 'Projects',
    pageTitle: 'Client Projects',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'eye',
    element: <AdminClientWorkReviewPageRoute />,
  },
  {
    path: '/admin/client-overview',
    id: 'admin-client-overview',
    label: 'Overview Editor',
    pageTitle: 'Client Overview Editor',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'fileText',
    element: <AdminClientOverviewPageRoute />,
  },
  {
    path: '/team/tasks',
    id: 'team-tasks',
    label: 'Team Tasks',
    pageTitle: 'Team Tasks',
    allowedRoles: [USER_ROLES.AGENCY_TEAM],
    header: TeamTasksPageHeader,
    iconName: 'checkCircle2',
    element: <TeamTasksPageRoute />,
  },
  {
    path: '/legacy/build-board',
    id: 'legacy-build-board',
    label: 'Legacy Buildout',
    pageTitle: 'Legacy Buildout',
    showInNav: false,
    element: <BuildBoardPage />,
  },
  {
    path: '/legacy/crm-dashboard',
    id: 'legacy-crm-dashboard',
    label: 'Legacy CRM Dashboard',
    pageTitle: 'Legacy CRM Dashboard',
    showInNav: false,
    element: <CrmDashboardPage />,
  },
  {
    path: '/legacy/marketing-process',
    id: 'legacy-marketing-process',
    label: 'Legacy Marketing Processes',
    pageTitle: 'Legacy Marketing Processes',
    showInNav: false,
    element: <MarketingProcessPage />,
  },
  {
    path: '/legacy/daily-activities',
    id: 'legacy-daily-activities',
    label: 'Legacy Daily Activities',
    pageTitle: 'Legacy Daily Activities',
    showInNav: false,
    element: <DailyActivitiesPage />,
  },
  {
    path: '/legacy/marketing-reports',
    id: 'legacy-marketing-reports',
    label: 'Legacy Marketing Reports',
    pageTitle: 'Legacy Marketing Reports',
    showInNav: false,
    element: <MarketingReportsPage />,
  },
]

export const routeMetadata = routeDefinitions.map((route) => {
  const metadata = { ...route }
  delete metadata.element

  return metadata
})

function getRoutePath(path) {
  return path === '/' ? undefined : path.replace(/^\//, '')
}

function buildRouteElement(route) {
  const routeElement = route.layout === 'auth'
    ? <AuthLayout>{route.element}</AuthLayout>
    : <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>

  if (!route.allowedRoles?.length) {
    return routeElement
  }

  return (
    <ProtectedRoute allowedRoles={route.allowedRoles}>
      {routeElement}
    </ProtectedRoute>
  )
}

export function createRouteChildren() {
  return routeDefinitions.map((route) => {
    const element = buildRouteElement(route)

    if (route.path === '/') {
      return { index: true, element }
    }

    return {
      path: getRoutePath(route.path),
      element,
    }
  })
}
