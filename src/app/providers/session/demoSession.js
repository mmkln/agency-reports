import { USER_ROLES } from '../../../entities/profile'
import { SEED_IDS } from '../repositories/portalSeedData'

export const demoSession = Object.freeze({
  agencyId: SEED_IDS.AGENCY_GROWTHLAB,
  clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
  email: 'client@greendental.example',
  name: 'Green Dental Client',
  role: USER_ROLES.CLIENT_USER,
  userId: SEED_IDS.USER_CLIENT_GREEN,
})

export const demoAdminSession = Object.freeze({
  agencyId: SEED_IDS.AGENCY_GROWTHLAB,
  email: 'admin@growthlab.example',
  name: 'GrowthLab Admin',
  role: USER_ROLES.AGENCY_ADMIN,
  userId: SEED_IDS.USER_ADMIN_GROWTHLAB,
})

export const demoTeamSession = Object.freeze({
  agencyId: SEED_IDS.AGENCY_GROWTHLAB,
  clientIds: [SEED_IDS.CLIENT_GREEN_DENTAL],
  email: 'mia@growthlab.example',
  name: 'Mia Carter',
  role: USER_ROLES.AGENCY_TEAM,
  userId: SEED_IDS.USER_TEAM_MIA,
})
