import { USER_ROLES } from '../../entities/profile'

export const roleMeta = {
  [USER_ROLES.AGENCY_ADMIN]: {
    label: 'Admin',
    searchPlaceholder: 'Search accounts, reports...',
  },
  [USER_ROLES.AGENCY_TEAM]: {
    label: 'Team',
    searchPlaceholder: 'Search tasks, accounts...',
  },
  [USER_ROLES.CLIENT_USER]: {
    label: 'Workspace Admin',
    searchPlaceholder: 'Search portal...',
  },
  [USER_ROLES.CLIENT_TEAM]: {
    label: 'Workspace Team',
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
    body: 'April 2026 report is ready for the workspace preview.',
    id: 'notification-report-ready',
    isUnread: false,
    time: 'Yesterday',
    title: 'Report draft ready',
  },
]
