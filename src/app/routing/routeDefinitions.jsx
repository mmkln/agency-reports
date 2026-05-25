/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { CLIENT_TYPES } from '../../entities/client'
import { CLINIC_REPORTING_CAPABILITIES } from '../../entities/profile'
import { ACCESS_AUDIENCES } from '../../domain/policies/accessAudience'
import { AcceptInvitePage } from '../../pages/auth/accept-invite/AcceptInvitePage'
import { LoginPage } from '../../pages/auth/login/LoginPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { ClientSettingsPageHeader } from '../../pages/client/settings/ClientSettingsPageHeader'
import { AccessDeniedPage } from '../../pages/system/access-denied/AccessDeniedPage'
import { AuthLayout } from '../layout/AuthLayout'
import { NAVIGATION_SCOPES } from './roleAccess'
import { ProtectedRoute } from './ProtectedRoute'
import {
  AccountSettingsPageRoute,
  AdminClientAccessPageRoute,
  AdminClientsPageRoute,
  AdminClinicDataSourcesPageRoute,
  AdminClinicSetupPageRoute,
  ClientSettingsPageRoute,
  DentalGrowthReviewPageRoute,
} from './RoutePages'

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })))
}

const LandingPage = lazyNamed(() => import('../../pages/legacy/landing/LandingPage'), 'LandingPage')

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>
const CLIENT_PORTAL_ACCESS_AUDIENCES = [ACCESS_AUDIENCES.WORKSPACE_ADMIN, ACCESS_AUDIENCES.WORKSPACE_MEMBER]
const {
  AGENCY,
  CLIENT_PORTAL,
} = NAVIGATION_SCOPES

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
    path: '/account/settings',
    id: 'account-settings',
    label: 'Settings',
    pageTitle: 'Account Settings',
    accessAudiences: [
      ACCESS_AUDIENCES.ACCOUNT_USER,
    ],
    contentWidth: 'content',
    iconName: 'settings',
    navigationAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    navigationScope: AGENCY,
    navOrder: 20,
    element: <AccountSettingsPageRoute />,
  },
  {
    path: '/admin/clients',
    id: 'admin-clients',
    label: 'Clients',
    pageTitle: 'Clients',
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    header: AdminClientsPageHeader,
    iconName: 'users',
    navigationScope: AGENCY,
    navOrder: 10,
    element: <AdminClientsPageRoute />,
  },
  {
    path: '/admin/client-access',
    id: 'admin-client-access',
    label: 'Access',
    pageTitle: 'Client Access',
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'users',
    element: <AdminClientAccessPageRoute />,
  },
  {
    path: '/admin/clinic-setup',
    id: 'admin-clinic-setup',
    label: 'Setup',
    pageTitle: 'Setup',
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    clientTypes: [CLIENT_TYPES.CLINIC],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'stethoscope',
    element: <AdminClinicSetupPageRoute />,
  },
  {
    path: '/admin/clinic-data-sources',
    id: 'admin-clinic-data-sources',
    label: 'Data Sources',
    pageTitle: 'Data Sources',
    accessAudiences: [ACCESS_AUDIENCES.AGENCY_ADMIN],
    clientTypes: [CLIENT_TYPES.CLINIC],
    showInNav: false,
    fullBleedContent: true,
    hidePageHeader: true,
    iconName: 'database',
    element: <AdminClinicDataSourcesPageRoute />,
  },
  {
    path: '/client/growth-review',
    id: 'dental-growth-review',
    label: 'Growth Review',
    pageTitle: 'Growth Review',
    accessAudiences: [
      ACCESS_AUDIENCES.AGENCY_ADMIN,
      ACCESS_AUDIENCES.AGENCY_MEMBER,
      ACCESS_AUDIENCES.WORKSPACE_ADMIN,
      ACCESS_AUDIENCES.WORKSPACE_MEMBER,
    ],
    clientTypes: [CLIENT_TYPES.CLINIC],
    contentWidth: 'content',
    iconName: 'trendingUp',
    navLabel: 'Growth Review',
    navigationScope: CLIENT_PORTAL,
    navOrder: 10,
    requiredCapabilities: [CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW],
    element: <DentalGrowthReviewPageRoute />,
  },
  {
    path: '/client/settings',
    id: 'client-settings',
    label: 'Settings',
    pageTitle: 'Settings',
    accessAudiences: CLIENT_PORTAL_ACCESS_AUDIENCES,
    contentWidth: 'content',
    header: ClientSettingsPageHeader,
    iconName: 'settings',
    navigationScope: CLIENT_PORTAL,
    navOrder: 20,
    element: <ClientSettingsPageRoute />,
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

  if (!route.accessAudiences?.length && !route.requiredCapabilities?.length) {
    return routeElement
  }

  return (
    <ProtectedRoute route={route}>
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
