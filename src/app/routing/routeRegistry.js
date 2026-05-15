import { lazy } from 'react'

import { USER_ROLES } from '../../entities/profile'
import { AcceptInvitePage } from '../../pages/auth/accept-invite/AcceptInvitePage'
import { LoginPage } from '../../pages/auth/login/LoginPage'
import { ClientDashboardPage } from '../../pages/client/dashboard/ClientDashboardPage'
import { ClientDashboardPageHeader } from '../../pages/client/dashboard/ClientDashboardPageHeader'
import { ClientOverviewPage } from '../../pages/client/overview/ClientOverviewPage'
import { ClientOverviewPageHeader } from '../../pages/client/overview/ClientOverviewPageHeader'
import { ClientPerformancePage } from '../../pages/client/performance/ClientPerformancePage'
import { ClientPerformancePageHeader } from '../../pages/client/performance/ClientPerformancePageHeader'
import { ClientReportsPage } from '../../pages/client/reports/ClientReportsPage'
import { ClientReportsPageHeader } from '../../pages/client/reports/ClientReportsPageHeader'
import { AdminClientAccessPage } from '../../pages/admin/client-access/AdminClientAccessPage'
import { AdminClientActivityPage } from '../../pages/admin/client-activity/AdminClientActivityPage'
import { AdminClientOverviewPage } from '../../pages/admin/client-overview/AdminClientOverviewPage'
import { AdminClientRequestsPage } from '../../pages/admin/client-requests/AdminClientRequestsPage'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientsPageHeader } from '../../pages/admin/clients/AdminClientsPageHeader'
import { AdminDashboardLinksPage } from '../../pages/admin/dashboard-links/AdminDashboardLinksPage'
import { AdminDashboardLinksPageHeader } from '../../pages/admin/dashboard-links/AdminDashboardLinksPageHeader'
import { AdminPerformanceDashboardEditorPage } from '../../pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPage'
import { AdminPerformanceDashboardEditorPageHeader } from '../../pages/admin/performance-dashboard-editor/AdminPerformanceDashboardEditorPageHeader'
import { AdminPerformanceDashboardsPage } from '../../pages/admin/performance-dashboards/AdminPerformanceDashboardsPage'
import { AdminPerformanceDashboardsPageHeader } from '../../pages/admin/performance-dashboards/AdminPerformanceDashboardsPageHeader'
import { AdminReportsPage } from '../../pages/admin/reports/AdminReportsPage'
import { AdminReportsPageHeader } from '../../pages/admin/reports/AdminReportsPageHeader'
import { AccessDeniedPage } from '../../pages/system/access-denied/AccessDeniedPage'
import { TeamTasksPage } from '../../pages/team/tasks/TeamTasksPage'
import { TeamTasksPageHeader } from '../../pages/team/tasks/TeamTasksPageHeader'

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })))
}

const BuildBoardPage = lazyNamed(() => import('../../pages/legacy/build-board/BuildBoardPage'), 'BuildBoardPage')
const CrmDashboardPage = lazyNamed(() => import('../../pages/legacy/crm-dashboard/CrmDashboardPage'), 'CrmDashboardPage')
const DailyActivitiesPage = lazyNamed(() => import('../../pages/legacy/daily-activities/DailyActivitiesPage'), 'DailyActivitiesPage')
const LandingPage = lazyNamed(() => import('../../pages/legacy/landing/LandingPage'), 'LandingPage')
const MarketingProcessPage = lazyNamed(() => import('../../pages/legacy/marketing-process/MarketingProcessPage'), 'MarketingProcessPage')
const MarketingReportsPage = lazyNamed(() => import('../../pages/legacy/marketing-reports/MarketingReportsPage'), 'MarketingReportsPage')

export const routes = [
  {
    component: LandingPage,
    href: '/',
    id: 'landing',
    label: 'Landing',
    layout: 'public',
    showInNav: false,
  },
  {
    component: AcceptInvitePage,
    href: '/accept-invite',
    id: 'accept-invite',
    label: 'Accept Invite',
    layout: 'auth',
    showInNav: false,
  },
  {
    component: LoginPage,
    href: '/login',
    id: 'login',
    label: 'Login',
    layout: 'auth',
    showInNav: false,
  },
  {
    component: AccessDeniedPage,
    href: '/access-denied',
    id: 'access-denied',
    label: 'Access Denied',
    layout: 'auth',
    showInNav: false,
  },
  {
    component: ClientOverviewPage,
    header: ClientOverviewPageHeader,
    href: '/client/overview',
    iconName: 'layoutDashboard',
    id: 'client-overview',
    label: 'Overview',
    pageTitle: 'Client Overview',
    allowedRoles: [USER_ROLES.CLIENT_USER],
  },
  {
    component: ClientDashboardPage,
    header: ClientDashboardPageHeader,
    href: '/client/dashboard',
    iconName: 'layoutDashboard',
    id: 'client-dashboard',
    label: 'Dashboard',
    pageTitle: 'Marketing Dashboard',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    showInNav: false,
  },
  {
    component: ClientPerformancePage,
    header: ClientPerformancePageHeader,
    href: '/client/performance',
    iconName: 'barChart',
    id: 'client-performance',
    label: 'Performance',
    pageTitle: 'Performance Dashboard',
    allowedRoles: [USER_ROLES.CLIENT_USER],
  },
  {
    component: ClientReportsPage,
    header: ClientReportsPageHeader,
    href: '/client/reports',
    iconName: 'fileText',
    id: 'client-reports',
    label: 'Reports',
    pageTitle: 'Monthly Reports',
    allowedRoles: [USER_ROLES.CLIENT_USER],
    showInNav: false,
  },
  {
    component: AdminClientsPage,
    header: AdminClientsPageHeader,
    href: '/admin/clients',
    iconName: 'users',
    id: 'admin-clients',
    label: 'Clients',
    pageTitle: 'Clients',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
  },
  {
    component: TeamTasksPage,
    header: TeamTasksPageHeader,
    href: '/admin/tasks',
    iconName: 'checkCircle2',
    id: 'admin-tasks',
    label: 'Tasks',
    pageTitle: 'Tasks',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
  },
  {
    component: AdminDashboardLinksPage,
    header: AdminDashboardLinksPageHeader,
    href: '/admin/dashboard-links',
    iconName: 'layoutDashboard',
    id: 'admin-dashboard-links',
    label: 'Dashboards',
    pageTitle: 'Dashboard Links',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
  },
  {
    component: AdminPerformanceDashboardsPage,
    header: AdminPerformanceDashboardsPageHeader,
    href: '/admin/performance-dashboards',
    iconName: 'barChart',
    id: 'admin-performance-dashboards',
    label: 'Performance',
    pageTitle: 'Performance Dashboards',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
  },
  {
    component: AdminPerformanceDashboardEditorPage,
    header: AdminPerformanceDashboardEditorPageHeader,
    href: '/admin/performance-dashboard-editor',
    iconName: 'barChart',
    id: 'admin-performance-dashboard-editor',
    label: 'Performance Editor',
    pageTitle: 'Performance Dashboard Editor',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: AdminReportsPage,
    header: AdminReportsPageHeader,
    href: '/admin/reports',
    iconName: 'fileText',
    id: 'admin-reports',
    label: 'Reports',
    pageTitle: 'Reports',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
  },
  {
    component: ClientOverviewPage,
    header: ClientOverviewPageHeader,
    href: '/admin/client-preview',
    iconName: 'layoutDashboard',
    id: 'admin-client-preview',
    label: 'Client Preview',
    pageTitle: 'Client Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: ClientDashboardPage,
    header: ClientDashboardPageHeader,
    href: '/admin/client-dashboard-preview',
    iconName: 'layoutDashboard',
    id: 'admin-client-dashboard-preview',
    label: 'Dashboard Preview',
    pageTitle: 'Dashboard Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: ClientPerformancePage,
    header: ClientPerformancePageHeader,
    href: '/admin/client-performance-preview',
    iconName: 'barChart',
    id: 'admin-client-performance-preview',
    label: 'Performance Preview',
    pageTitle: 'Performance Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: ClientReportsPage,
    header: ClientReportsPageHeader,
    href: '/admin/client-report-preview',
    iconName: 'fileText',
    id: 'admin-client-report-preview',
    label: 'Report Preview',
    pageTitle: 'Report Preview',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: AdminClientAccessPage,
    fullBleedContent: true,
    href: '/admin/client-access',
    hidePageHeader: true,
    iconName: 'users',
    id: 'admin-client-access',
    label: 'Access',
    pageTitle: 'Client Access',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: AdminClientActivityPage,
    fullBleedContent: true,
    href: '/admin/client-activity',
    hidePageHeader: true,
    iconName: 'clock',
    id: 'admin-client-activity',
    label: 'Activity',
    pageTitle: 'Client Activity',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: AdminClientRequestsPage,
    fullBleedContent: true,
    href: '/admin/client-requests',
    hidePageHeader: true,
    iconName: 'messageSquare',
    id: 'admin-client-requests',
    label: 'Requests',
    pageTitle: 'Client Requests',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: AdminClientOverviewPage,
    fullBleedContent: true,
    href: '/admin/client-overview',
    hidePageHeader: true,
    iconName: 'fileText',
    id: 'admin-client-overview',
    label: 'Overview Editor',
    pageTitle: 'Client Overview Editor',
    allowedRoles: [USER_ROLES.AGENCY_ADMIN],
    showInNav: false,
  },
  {
    component: TeamTasksPage,
    header: TeamTasksPageHeader,
    href: '/team/tasks',
    iconName: 'checkCircle2',
    id: 'team-tasks',
    label: 'Team Tasks',
    pageTitle: 'Team Tasks',
    allowedRoles: [USER_ROLES.AGENCY_TEAM],
  },
  {
    component: BuildBoardPage,
    href: '/legacy/build-board',
    id: 'legacy-build-board',
    label: 'Legacy Buildout',
    pageTitle: 'Legacy Buildout',
    showInNav: false,
  },
  {
    component: CrmDashboardPage,
    href: '/legacy/crm-dashboard',
    id: 'legacy-crm-dashboard',
    label: 'Legacy CRM Dashboard',
    pageTitle: 'Legacy CRM Dashboard',
    showInNav: false,
  },
  {
    component: MarketingProcessPage,
    href: '/legacy/marketing-process',
    id: 'legacy-marketing-process',
    label: 'Legacy Marketing Processes',
    pageTitle: 'Legacy Marketing Processes',
    showInNav: false,
  },
  {
    component: DailyActivitiesPage,
    href: '/legacy/daily-activities',
    id: 'legacy-daily-activities',
    label: 'Legacy Daily Activities',
    pageTitle: 'Legacy Daily Activities',
    showInNav: false,
  },
  {
    component: MarketingReportsPage,
    href: '/legacy/marketing-reports',
    id: 'legacy-marketing-reports',
    label: 'Legacy Marketing Reports',
    pageTitle: 'Legacy Marketing Reports',
    showInNav: false,
  },
]

export const defaultRoute = routes[0]
