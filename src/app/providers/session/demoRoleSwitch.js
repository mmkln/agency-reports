import { USER_ROLES } from '../../../entities/profile'
import { SEED_IDS } from '../repositories/portalSeedData'

export const DEMO_ROLE_STORAGE_KEY = 'agency-reports.demo-role'

export const DEMO_ROLE_OPTIONS = Object.freeze([
  {
    description: 'Manage clients and overview content',
    homeHref: '#admin-clients',
    iconName: 'shieldCheck',
    key: 'admin',
    label: 'Admin',
    role: USER_ROLES.AGENCY_ADMIN,
    userId: SEED_IDS.USER_ADMIN_GROWTHLAB,
  },
  {
    description: 'Update assigned operational tasks',
    homeHref: '#team-tasks',
    iconName: 'checkCircle2',
    key: 'team',
    label: 'Team',
    role: USER_ROLES.AGENCY_TEAM,
    userId: SEED_IDS.USER_TEAM_MIA,
  },
  {
    description: 'View the client-facing portal',
    homeHref: `#client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
    iconName: 'user',
    key: 'client',
    label: 'Client',
    role: USER_ROLES.CLIENT_USER,
    userId: SEED_IDS.USER_CLIENT_GREEN,
  },
])

export function getDemoRoleOption(roleKey) {
  return DEMO_ROLE_OPTIONS.find((option) => option.key === roleKey) ?? DEMO_ROLE_OPTIONS[0]
}

export function getDemoRoleOptionByRole(role) {
  return DEMO_ROLE_OPTIONS.find((option) => option.role === role) ?? DEMO_ROLE_OPTIONS[0]
}

function getDefaultStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null
}

export function readDemoRoleKey(storage = getDefaultStorage()) {
  try {
    return getDemoRoleOption(storage?.getItem(DEMO_ROLE_STORAGE_KEY)).key
  } catch {
    return getDemoRoleOption().key
  }
}

export function writeDemoRoleKey(roleKey, storage = getDefaultStorage()) {
  const option = getDemoRoleOption(roleKey)

  storage?.setItem(DEMO_ROLE_STORAGE_KEY, option.key)

  return option
}
