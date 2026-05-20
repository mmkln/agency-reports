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
