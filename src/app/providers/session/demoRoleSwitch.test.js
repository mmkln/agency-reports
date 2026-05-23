import { describe, expect, it } from 'vitest'

import { buildViewerFromProfile } from '../../../domain/services/authService'
import {
  CLINIC_REPORTING_CAPABILITIES,
} from '../../../entities/profile'
import { AGENCY_ROLES } from '../../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../../entities/workspace-membership'
import { createPortalRepositoryFromSnapshot } from '../repositories/createSnapshotPortalRepository'
import { portalSeedData, SEED_IDS } from '../repositories/portalSeedData'
import {
  DEMO_ROLE_OPTIONS,
  getDemoRoleOptionByViewer,
} from './demoRoleSwitch'

function createSeedRepositories() {
  return createPortalRepositoryFromSnapshot({
    seedData: portalSeedData,
    snapshot: portalSeedData,
  }).repositories
}

function buildSeedViewer(userId) {
  const repositories = createSeedRepositories()

  return buildViewerFromProfile({
    profile: repositories.profiles.findByUserId(userId),
    repositories,
  })
}

describe('demo role switch options', () => {
  it('includes seeded users for every clinic reporting access variant', () => {
    expect(DEMO_ROLE_OPTIONS.map((option) => option.key)).toEqual([
      'admin',
      'team',
      'client',
      'finance',
      'frontdesk',
    ])

    expect(buildSeedViewer(SEED_IDS.USER_ADMIN_GROWTHLAB)).toMatchObject({
      agencyMemberships: [expect.objectContaining({ role: AGENCY_ROLES.ADMIN })],
      capabilities: expect.arrayContaining(Object.values(CLINIC_REPORTING_CAPABILITIES)),
    })
    expect(buildSeedViewer(SEED_IDS.USER_TEAM_MIA)).toMatchObject({
      agencyMemberships: [expect.objectContaining({ role: AGENCY_ROLES.TEAM })],
      capabilities: expect.arrayContaining([
        CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
        CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW,
        CLINIC_REPORTING_CAPABILITIES.WEEKLY_OPERATOR_VIEW,
        CLINIC_REPORTING_CAPABILITIES.OPERATIONAL_ROWS_VIEW,
      ]),
    })
    expect(buildSeedViewer(SEED_IDS.USER_CLIENT_GREEN)).toMatchObject({
      workspaceMemberships: [expect.objectContaining({ role: WORKSPACE_ROLES.CLINIC_OWNER })],
      capabilities: expect.arrayContaining([
        CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW,
        CLINIC_REPORTING_CAPABILITIES.EXECUTIVE_VIEW,
      ]),
    })
    expect(buildSeedViewer(SEED_IDS.USER_CLIENT_GREEN_FINANCE)).toMatchObject({
      workspaceMemberships: [expect.objectContaining({ role: WORKSPACE_ROLES.FINANCE_CONTACT })],
      capabilities: expect.arrayContaining([
        CLINIC_REPORTING_CAPABILITIES.MONTHLY_FINANCE_VIEW,
      ]),
    })
    expect(buildSeedViewer(SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN)).toMatchObject({
      workspaceMemberships: [expect.objectContaining({ role: WORKSPACE_ROLES.FRONT_DESK })],
      capabilities: expect.arrayContaining([CLINIC_REPORTING_CAPABILITIES.DAILY_OPS_VIEW]),
    })
  })

  it('resolves duplicate role names by viewer identity for active switcher state', () => {
    expect(getDemoRoleOptionByViewer({ userId: SEED_IDS.USER_CLIENT_GREEN_FINANCE }).key)
      .toBe('finance')
    expect(getDemoRoleOptionByViewer({ userId: SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN }).key)
      .toBe('frontdesk')
  })
})
