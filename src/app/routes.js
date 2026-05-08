import { BuildBoardPage } from '../pages/build-board/BuildBoardPage'
import { CrmDashboardPage } from '../pages/crm-dashboard/CrmDashboardPage'
import { DailyActivitiesPage } from '../pages/daily-activities/DailyActivitiesPage'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/login/LoginPage'
import { MarketingProcessPage } from '../pages/marketing-process/MarketingProcessPage'
import { MarketingReportsPage } from '../pages/marketing-reports/MarketingReportsPage'

export const routes = [
  {
    component: LandingPage,
    href: '#landing',
    id: 'landing',
    label: 'Landing',
    layout: 'public',
    showInNav: false,
  },
  {
    component: BuildBoardPage,
    href: '#build-board',
    iconName: 'fileText',
    id: 'build-board',
    label: 'Go CRM Buildout Plan',
    navLabel: 'Buildout',
    pageTitle: 'CRM Buildout Plan',
  },
  {
    component: CrmDashboardPage,
    href: '#crm-dashboard',
    iconName: 'layoutDashboard',
    id: 'crm-dashboard',
    label: 'CRM Dashboard',
    navLabel: 'Dashboard',
    pageTitle: 'CRM Dashboard',
  },
  {
    component: MarketingProcessPage,
    href: '#marketing-process',
    iconName: 'gitMerge',
    id: 'marketing-process',
    label: 'Marketing Processes',
    navLabel: 'Processes',
    pageTitle: 'Marketing Processes',
  },
  {
    component: DailyActivitiesPage,
    href: '#daily-activities',
    iconName: 'calendar',
    id: 'daily-activities',
    label: 'Daily Activities',
    navLabel: 'Activities',
    pageTitle: 'Daily Activities',
  },
  {
    component: MarketingReportsPage,
    href: '#marketing-reports',
    iconName: 'chartColumn',
    id: 'marketing-reports',
    label: 'Marketing Reports',
    navLabel: 'Reports',
    pageTitle: 'Marketing Reports',
  },
  {
    component: LoginPage,
    href: '#login',
    id: 'login',
    label: 'Login',
    layout: 'auth',
    showInNav: false,
  },
]

export const defaultRoute = routes[0]
