import { describe, expect, it } from 'vitest'

import { AGENCY_MEMBERSHIP_STATUSES, AGENCY_ROLES } from '../../entities/agency-membership'
import { WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { PROFILE_STATUSES } from '../../entities/profile'
import { deactivateOwnProfile } from './accountLifecycleService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  MEMBERSHIP_OWNER: '33333333-3333-4333-8333-333333333333',
  MEMBERSHIP_OTHER_OWNER: '44444444-4444-4444-8444-444444444444',
  AGENCY_MEMBERSHIP_ADMIN: '12121212-1212-4212-9212-121212121212',
  AGENCY_MEMBERSHIP_OTHER_ADMIN: '13131313-1313-4313-9313-131313131313',
  PROFILE_ADMIN: '55555555-5555-4555-8555-555555555555',
  PROFILE_OTHER_ADMIN: '66666666-6666-4666-8666-666666666666',
  PROFILE_OWNER: '77777777-7777-4777-8777-777777777777',
  PROFILE_OTHER_OWNER: '88888888-8888-4888-8888-888888888888',
  USER_ADMIN: '99999999-9999-4999-8999-999999999999',
  USER_OTHER_ADMIN: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  USER_OWNER: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  USER_OTHER_OWNER: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
})

function createRepository(records = []) {
  return {
    records,
    findById(id) {
      return this.records.find((record) => record.id === id) ?? null
    },
    findByUserId(userId) {
      return this.records.find((record) => record.user_id === userId) ?? null
    },
    list() {
      return this.records
    },
    listByWorkspaceId(workspaceId) {
      return this.records.filter((record) => record.workspace_id === workspaceId || record.client_id === workspaceId)
    },
    upsert(record) {
      const index = this.records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        this.records[index] = {
          ...this.records[index],
          ...record,
        }
        return this.records[index]
      }

      this.records.push(record)
      return record
    },
  }
}

function createRepositories({ includeOtherAdmin = true, includeOtherOwner = true } = {}) {
  const workspaceMemberships = createRepository([
    {
      id: IDS.MEMBERSHIP_OWNER,
      role: WORKSPACE_ROLES.OWNER,
      user_id: IDS.USER_OWNER,
      workspace_id: IDS.CLIENT,
    },
    ...(includeOtherOwner ? [{
      id: IDS.MEMBERSHIP_OTHER_OWNER,
      role: WORKSPACE_ROLES.OWNER,
      user_id: IDS.USER_OTHER_OWNER,
      workspace_id: IDS.CLIENT,
    }] : []),
  ])

  return {
    agencyMemberships: createRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.AGENCY_MEMBERSHIP_ADMIN,
        role: AGENCY_ROLES.ADMIN,
        status: AGENCY_MEMBERSHIP_STATUSES.ACTIVE,
        user_id: IDS.USER_ADMIN,
      },
      ...(includeOtherAdmin ? [{
        agency_id: IDS.AGENCY,
        id: IDS.AGENCY_MEMBERSHIP_OTHER_ADMIN,
        role: AGENCY_ROLES.ADMIN,
        status: AGENCY_MEMBERSHIP_STATUSES.ACTIVE,
        user_id: IDS.USER_OTHER_ADMIN,
      }] : []),
    ]),
    profiles: createRepository([
      {
        agency_id: IDS.AGENCY,
        email: 'admin@example.com',
        id: IDS.PROFILE_ADMIN,
        name: 'Agency Admin',
        user_id: IDS.USER_ADMIN,
      },
      ...(includeOtherAdmin ? [{
        agency_id: IDS.AGENCY,
        email: 'other-admin@example.com',
        id: IDS.PROFILE_OTHER_ADMIN,
        name: 'Other Admin',
        user_id: IDS.USER_OTHER_ADMIN,
      }] : []),
      {
        agency_id: IDS.AGENCY,
        email: 'owner@example.com',
        id: IDS.PROFILE_OWNER,
        name: 'Client Owner',
        user_id: IDS.USER_OWNER,
      },
      ...(includeOtherOwner ? [{
        agency_id: IDS.AGENCY,
        email: 'other-owner@example.com',
        id: IDS.PROFILE_OTHER_OWNER,
        name: 'Other Owner',
        user_id: IDS.USER_OTHER_OWNER,
      }] : []),
    ]),
    workspaceMemberships,
  }
}

function createViewer({ userId }) {
  return {
    userId,
  }
}

describe('accountLifecycleService', () => {
  it('soft deactivates the current profile', () => {
    const repositories = createRepositories()

    const profile = deactivateOwnProfile({
      now: () => '2026-05-20T12:00:00.000Z',
      repositories,
      viewer: createViewer({
        userId: IDS.USER_OWNER,
      }),
    })

    expect(profile).toMatchObject({
      deactivated_at: '2026-05-20T12:00:00.000Z',
      deactivated_by: IDS.USER_OWNER,
      status: PROFILE_STATUSES.INACTIVE,
      updated_at: '2026-05-20T12:00:00.000Z',
    })
    expect(repositories.workspaceMemberships.findById(IDS.MEMBERSHIP_OWNER)).toMatchObject({
      role: WORKSPACE_ROLES.OWNER,
      user_id: IDS.USER_OWNER,
    })
  })

  it('blocks deactivation for the last client workspace owner', () => {
    expect(() => deactivateOwnProfile({
      repositories: createRepositories({ includeOtherOwner: false }),
      viewer: createViewer({
        userId: IDS.USER_OWNER,
      }),
    })).toThrow('Transfer workspace ownership before deactivating this account.')
  })

  it('blocks deactivation for the last agency admin', () => {
    expect(() => deactivateOwnProfile({
      repositories: createRepositories({ includeOtherAdmin: false }),
      viewer: createViewer({
        userId: IDS.USER_ADMIN,
      }),
    })).toThrow('Another agency admin is required before deactivating this account.')
  })

  it('uses agency memberships rather than profile role to guard last agency admin', () => {
    const repositories = createRepositories({ includeOtherAdmin: false })
    const adminProfile = repositories.profiles.findByUserId(IDS.USER_ADMIN)

    repositories.profiles.upsert({
      ...adminProfile,
      role: 'legacy-profile-role-is-ignored',
    })

    expect(() => deactivateOwnProfile({
      repositories,
      viewer: createViewer({
        userId: IDS.USER_ADMIN,
      }),
    })).toThrow('Another agency admin is required before deactivating this account.')
  })
})
