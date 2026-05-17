import { cn } from '@/lib/utils'

import { USER_ROLES } from '../../entities/profile'

export const roleMeta = {
  [USER_ROLES.AGENCY_ADMIN]: {
    label: 'Agency Admin',
    searchPlaceholder: 'Search clients, reports...',
  },
  [USER_ROLES.AGENCY_TEAM]: {
    label: 'Agency Team',
    searchPlaceholder: 'Search tasks, clients...',
  },
  [USER_ROLES.CLIENT_USER]: {
    label: 'Client User',
    searchPlaceholder: 'Search portal...',
  },
}

export const demoNotifications = [
  {
    body: 'Green Dental Clinic approved the creative batch and left a note.',
    id: 'notification-creative-approved',
    isUnread: true,
    time: '4m ago',
    title: 'Creative batch approved',
  },
  {
    body: 'GA4 conversion tracking still needs a final event mapping check.',
    id: 'notification-ga4-check',
    isUnread: true,
    time: '22m ago',
    title: 'Tracking task needs review',
  },
  {
    body: 'April 2026 report is ready for the client portal preview.',
    id: 'notification-report-ready',
    isUnread: false,
    time: 'Yesterday',
    title: 'Report draft ready',
  },
]

const sidebarRailInset = 'mx-[calc((var(--spacing-sidebar-collapsed)-var(--spacing-target))/2)]'
const sidebarRailItemWidth = 'w-target'
const sidebarExpandedItemWidth = 'sm:group-hover/app-sidebar:w-[calc(var(--spacing-sidebar-expanded)-var(--spacing-sidebar-collapsed)+var(--spacing-target))] sm:group-focus-within/app-sidebar:w-[calc(var(--spacing-sidebar-expanded)-var(--spacing-sidebar-collapsed)+var(--spacing-target))]'

export const sidebarLabelClass = 'ml-target min-w-0 truncate pr-control opacity-0 transition-opacity duration-motion-fast delay-motion-label ease-motion-standard sm:group-hover/app-sidebar:opacity-100 sm:group-focus-within/app-sidebar:opacity-100'
export const sidebarIconSlotClass = `absolute left-0 top-1/2 flex ${sidebarRailItemWidth} -translate-y-1/2 items-center justify-center`

const sidebarRowTone = {
  nav: {
    active: 'bg-fill text-text-primary',
    idle: 'text-text-secondary hover:bg-fill-secondary hover:text-text-primary',
  },
  utility: {
    active: '',
    idle: 'text-text-muted hover:bg-fill-secondary hover:text-text-primary',
  },
  search: {
    active: '',
    idle: 'text-text-muted hover:bg-transparent hover:text-text-secondary',
  },
}

export function sidebarRowClass({ isActive = false, tone = 'nav' } = {}) {
  const toneClass = sidebarRowTone[tone] ?? sidebarRowTone.nav

  return cn(
    'relative flex h-target items-center overflow-hidden rounded-control text-ui font-medium no-underline outline-none transition-[width,background-color,color] duration-motion-fast ease-motion-standard focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/35',
    sidebarRailInset,
    sidebarRailItemWidth,
    sidebarExpandedItemWidth,
    isActive ? toneClass.active : toneClass.idle,
  )
}
