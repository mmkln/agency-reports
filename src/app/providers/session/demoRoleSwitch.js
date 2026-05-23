import { SEED_IDS } from '../repositories/portalSeedData'

export const DEMO_ROLE_STORAGE_KEY = 'agency-reports.demo-role'

export const DEMO_ROLE_OPTIONS = Object.freeze([
  {
    description: 'Manage accounts and overview content',
    homeHref: '/admin/clients',
    iconName: 'shieldCheck',
    key: 'admin',
    label: 'Admin',
    userId: SEED_IDS.USER_ADMIN_GROWTHLAB,
  },
  {
    description: 'Update assigned operational tasks',
    homeHref: '/team/tasks',
    iconName: 'checkCircle2',
    key: 'team',
    label: 'Team',
    userId: SEED_IDS.USER_TEAM_MIA,
  },
  {
    description: 'View executive clinic reporting',
    homeHref: `/client/overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
    iconName: 'user',
    key: 'client',
    label: 'Workspace Admin',
    userId: SEED_IDS.USER_CLIENT_GREEN,
  },
  {
    description: 'View monthly finance and strategy reporting',
    homeHref: `/client/monthly-strategy?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
    iconName: 'dollarSign',
    key: 'finance',
    label: 'Finance',
    userId: SEED_IDS.USER_CLIENT_GREEN_FINANCE,
  },
  {
    description: 'View daily ops without row-level patient queues',
    homeHref: `/clinic/daily-ops?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
    iconName: 'stethoscope',
    key: 'frontdesk',
    label: 'Front Desk',
    userId: SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN,
  },
])

export function getDemoRoleOption(roleKey) {
  return DEMO_ROLE_OPTIONS.find((option) => option.key === roleKey) ?? DEMO_ROLE_OPTIONS[0]
}

export function getDemoRoleOptionByViewer(viewer) {
  return DEMO_ROLE_OPTIONS.find((option) => option.userId === viewer?.userId) ?? DEMO_ROLE_OPTIONS[0]
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
