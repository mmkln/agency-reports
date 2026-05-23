import { SEED_IDS } from '../repositories/portalSeedData'

export const demoSession = Object.freeze({
  email: 'client@greendental.example',
  name: 'Green Dental Client',
  userId: SEED_IDS.USER_CLIENT_GREEN,
})

export const demoAdminSession = Object.freeze({
  email: 'admin@growthlab.example',
  name: 'GrowthLab Admin',
  userId: SEED_IDS.USER_ADMIN_GROWTHLAB,
})

export const demoTeamSession = Object.freeze({
  email: 'mia@growthlab.example',
  name: 'Mia Carter',
  userId: SEED_IDS.USER_TEAM_MIA,
})
