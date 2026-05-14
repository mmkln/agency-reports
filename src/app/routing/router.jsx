/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { USER_ROLES } from '../../entities/profile'
import { AcceptInvitePage } from '../../pages/auth/accept-invite/AcceptInvitePage'
import { LoginPage } from '../../pages/auth/login/LoginPage'
import { AccessDeniedPage } from '../../pages/system/access-denied/AccessDeniedPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RootLayout } from '../layout/RootLayout'
import { AuthLayout } from '../layout/AuthLayout'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminDashboardLinksPageHeader } from '../../pages/admin/dashboard-links/AdminDashboardLinksPageHeader'
import { AdminReportsPageHeader } from '../../pages/admin/reports/AdminReportsPageHeader'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { TeamTasksPageHeader } from '../../pages/team/tasks/TeamTasksPageHeader'
import {
  ClientOverviewPageRoute,
  ClientDashboardPageRoute,
  ClientReportsPageRoute,
  AdminClientsPageRoute,
  AdminDashboardLinksPageRoute,
  AdminReportsPageRoute,
  AdminClientAccessPageRoute,
  AdminClientActivityPageRoute,
  AdminClientRequestsPageRoute,
  AdminClientPreviewPageRoute,
  AdminClientOverviewPageRoute,
  AdminTasksPageRoute,
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

const LoadingFallback = () => <div className="p-6 text-sm text-slate-500">Loading...</div>
const githubPagesBaseName = '/agency-reports'

function getRouterBasename() {
  if (import.meta.env.BASE_URL !== '/') {
    return import.meta.env.BASE_URL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location.pathname.startsWith(`${githubPagesBaseName}/`)) {
    return githubPagesBaseName
  }

  return undefined
}

export const routeMetadata = [
  {
    path: '/',
    id: 'landing',
    label: 'Landing',
    layout: 'public',
    showInNav: false,
  },
  {
    path: '/accept-invite',
    id: 'accept-invite',
    label: 'Accept Invite',
    layout: 'auth',
    showInNav: false,
  },
  {
    path: '/login',
    id: 'login',
    label: 'Login',
    layout: 'auth',
    showInNav: false,
  },
  {
    path: '/access-denied',
    id: 'access-denied',
    label: 'Access Denied',
    layout: 'auth',
    showInNav: false,
  },
  {
    path: '/client/overview',
    id: 'client-overview',
    label: 'Overview',
    pageTitle: 'Client Overview',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    header: ClientOverviewPageHeader,
    subtitle: 'Status, progress, active work, needed actions, dashboard, and latest report.',
    iconName: 'layoutDashboard',
  },
  {
    path: '/client/dashboard',
    id: 'client-dashboard',
    label: 'Dashboard',
    pageTitle: 'Marketing Dashboard',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    header: ClientDashboardPageHeader,
    showInNav: false,
    subtitle: 'External marketing dashboard surface for the client portal.',
    iconName: 'layoutDashboard',
  },
  {
    path: '/client/reports',
    id: 'client-reports',
    label: 'Reports',
    pageTitle: 'Monthly Reports',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    header: ClientReportsPageHeader,
    showInNav: false,
    subtitle: 'Published monthly summaries and archive.',
    iconName: 'fileText',
  },
  {
    path: '/admin/clients',
    id: 'admin-clients',
    label: 'Clients',
    pageTitle: 'Clients',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminClientsPageHeader,
    subtitle: 'Create clients and open their client-facing status hub.',
    iconName: 'users',
  },
  {
    path: '/admin/tasks',
    id: 'admin-tasks',
    label: 'Tasks',
    pageTitle: 'Tasks',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: TeamTasksPageHeader,
    subtitle: 'Create and manage work across client projects.',
    iconName: 'checkCircle2',
  },
  {
    path: '/admin/dashboard-links',
    id: 'admin-dashboard-links',
    label: 'Dashboards',
    pageTitle: 'Dashboard Links',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminDashboardLinksPageHeader,
    subtitle: 'Manage external dashboard embeds and links for clients.',
    iconName: 'layoutDashboard',
  },
  {
    path: '/admin/reports',
    id: 'admin-reports',
    label: 'Reports',
    pageTitle: 'Reports',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: AdminReportsPageHeader,
    subtitle: 'Create, publish, archive, and manage client-facing monthly summaries.',
    iconName: 'fileText',
  },
  {
    path: '/admin/client-preview',
    id: 'admin-client-preview',
    label: 'Client Preview',
    pageTitle: 'Client Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: ClientOverviewPageHeader,
    showInNav: false,
    subtitle: 'Admin preview of the client-facing portal.',
    iconName: 'layoutDashboard',
  },
  {
    path: '/admin/client-dashboard-preview',
    id: 'admin-client-dashboard-preview',
    label: 'Dashboard Preview',
    pageTitle: 'Dashboard Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: ClientDashboardPageHeader,
    showInNav: false,
    subtitle: 'Admin preview of the client-facing dashboard surface.',
    iconName: 'layoutDashboard',
  },
  {
    path: '/admin/client-report-preview',
    id: 'admin-client-report-preview',
    label: 'Report Preview',
    pageTitle: 'Report Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    header: ClientReportsPageHeader,
    showInNav: false,
    subtitle: 'Admin preview of the client-facing monthly report surface.',
    iconName: 'fileText',
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
    subtitle: 'Manage client portal members and invitations.',
    iconName: 'users',
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
    subtitle: 'Review recent client-facing portal activity.',
    iconName: 'clock',
  },
  {
    path: '/admin/client-requests',
    id: 'admin-client-requests',
    label: 'Requests',
    pageTitle: 'Client Requests',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    subtitle: 'Manage client dependencies and responses.',
    iconName: 'messageSquare',
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
    subtitle: 'Manage the client-facing overview content and publish state.',
    iconName: 'fileText',
  },
  {
    path: '/team/tasks',
    id: 'team-tasks',
    label: 'Team Tasks',
    pageTitle: 'Team Tasks',
    allowedRoles: [USER_ROLES.AGENCY_TEAM],
    header: TeamTasksPageHeader,
    subtitle: 'Update assigned work without publishing the client overview.',
    iconName: 'checkCircle2',
  },
  {
    path: '/legacy/build-board',
    id: 'legacy-build-board',
    label: 'Legacy Buildout',
    pageTitle: 'Legacy Buildout',
    showInNav: false,
  },
  {
    path: '/legacy/crm-dashboard',
    id: 'legacy-crm-dashboard',
    label: 'Legacy CRM Dashboard',
    pageTitle: 'Legacy CRM Dashboard',
    showInNav: false,
  },
  {
    path: '/legacy/marketing-process',
    id: 'legacy-marketing-process',
    label: 'Legacy Marketing Processes',
    pageTitle: 'Legacy Marketing Processes',
    showInNav: false,
  },
  {
    path: '/legacy/daily-activities',
    id: 'legacy-daily-activities',
    label: 'Legacy Daily Activities',
    pageTitle: 'Legacy Daily Activities',
    showInNav: false,
  },
  {
    path: '/legacy/marketing-reports',
    id: 'legacy-marketing-reports',
    label: 'Legacy Marketing Reports',
    pageTitle: 'Legacy Marketing Reports',
    showInNav: false,
  },
]

export const router = createBrowserRouter(
  [
    {
      path: '/',
    element: <RootLayout />,
    errorElement: <div className="p-6 text-red-600">Page not found</div>,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: 'accept-invite',
        element: (
          <AuthLayout>
            <AcceptInvitePage />
          </AuthLayout>
        ),
      },
      {
        path: 'access-denied',
        element: (
          <AuthLayout>
            <AccessDeniedPage />
          </AuthLayout>
        ),
      },
      {
        path: 'client',
        children: [
          {
            path: 'overview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT_USER]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientOverviewPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT_USER]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientDashboardPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT_USER]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientReportsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'clients',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'tasks',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminTasksPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard-links',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboardLinksPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminReportsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-preview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientPreviewPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-dashboard-preview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientDashboardPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-report-preview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientReportsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-access',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientAccessPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-activity',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientActivityPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-requests',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientRequestsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-overview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminClientOverviewPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'team',
        children: [
          {
            path: 'tasks',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_TEAM]}>
                <Suspense fallback={<LoadingFallback />}>
                  <TeamTasksPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'legacy',
        children: [
          {
            path: 'build-board',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BuildBoardPage />
              </Suspense>
            ),
          },
          {
            path: 'crm-dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <CrmDashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'marketing-process',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <MarketingProcessPage />
              </Suspense>
            ),
          },
          {
            path: 'daily-activities',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <DailyActivitiesPage />
              </Suspense>
            ),
          },
          {
            path: 'marketing-reports',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <MarketingReportsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
],
  { basename: getRouterBasename() },
)
