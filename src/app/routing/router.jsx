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
import {
  ClientOverviewPageRoute,
  ClientDashboardPageRoute,
  ClientPerformancePageRoute,
  ClientReportsPageRoute,
  ClientRequestsPageRoute,
  AdminClientsPageRoute,
  AdminDashboardLinksPageRoute,
  AdminPerformanceDashboardEditorPageRoute,
  AdminPerformanceDashboardsPageRoute,
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

const LoadingFallback = () => <div className="p-6 text-sm text-text-muted">Loading...</div>
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

export const router = createBrowserRouter(
  [
    {
      path: '/',
    element: <RootLayout />,
    errorElement: <div className="p-6 text-destructive">Page not found</div>,
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
            path: 'performance',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT_USER]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientPerformancePageRoute />
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
          {
            path: 'requests',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT_USER]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientRequestsPageRoute />
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
            path: 'performance-dashboards',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPerformanceDashboardsPageRoute />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'performance-dashboard-editor',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPerformanceDashboardEditorPageRoute />
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
            path: 'client-performance-preview',
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.AGENCY_ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <ClientPerformancePageRoute />
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

