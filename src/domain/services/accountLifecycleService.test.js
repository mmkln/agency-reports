import { describe, expect, it } from 'vitest'

import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { PROFILE_STATUSES, USER_ROLES } from '../../entities/profile'
import { deactivateOwnProfile } from './accountLifecycleService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  MEMBERSHIP_OWNER: '33333333-3333-4333-8333-333333333333',
  MEMBERSHIP_OTHER_OWNER: '44444444-4444-4444-8444-444444444444',
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
    listByClientId(clientId) {
      return this.records.filter((record) => record.client_id === clientId)
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
  return {
    clientMemberships: createRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.MEMBERSHIP_OWNER,
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER_OWNER,
      },
      ...(includeOtherOwner ? [{
        client_id: IDS.CLIENT,
        id: IDS.MEMBERSHIP_OTHER_OWNER,
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER_OTHER_OWNER,
      }] : []),
    ]),
    profiles: createRepository([
      {
        agency_id: IDS.AGENCY,
        email: 'admin@example.com',
        id: IDS.PROFILE_ADMIN,
        name: 'Agency Admin',
        role: USER_ROLES.AGENCY_ADMIN,
        user_id: IDS.USER_ADMIN,
      },
      ...(includeOtherAdmin ? [{
        agency_id: IDS.AGENCY,
        email: 'other-admin@example.com',
        id: IDS.PROFILE_OTHER_ADMIN,
        name: 'Other Admin',
        role: USER_ROLES.AGENCY_ADMIN,
        user_id: IDS.USER_OTHER_ADMIN,
      }] : []),
      {
        agency_id: IDS.AGENCY,
        email: 'owner@example.com',
        id: IDS.PROFILE_OWNER,
        name: 'Client Owner',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: IDS.USER_OWNER,
      },
      ...(includeOtherOwner ? [{
        agency_id: IDS.AGENCY,
        email: 'other-owner@example.com',
        id: IDS.PROFILE_OTHER_OWNER,
        name: 'Other Owner',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: IDS.USER_OTHER_OWNER,
      }] : []),
    ]),
  }
}

function createViewer({ role, userId }) {
  return {
    role,
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
        role: USER_ROLES.CLIENT_ADMIN,
        userId: IDS.USER_OWNER,
      }),
    })

    expect(profile).toMatchObject({
      deactivated_at: '2026-05-20T12:00:00.000Z',
      deactivated_by: IDS.USER_OWNER,
      status: PROFILE_STATUSES.INACTIVE,
      updated_at: '2026-05-20T12:00:00.000Z',
    })
  })

  it('blocks deactivation for the last client workspace owner', () => {
    expect(() => deactivateOwnProfile({
      repositories: createRepositories({ includeOtherOwner: false }),
      viewer: createViewer({
        role: USER_ROLES.CLIENT_ADMIN,
        userId: IDS.USER_OWNER,
      }),
    })).toThrow('Transfer workspace ownership before deactivating this account.')
  })

  it('blocks deactivation for the last agency admin', () => {
    expect(() => deactivateOwnProfile({
      repositories: createRepositories({ includeOtherAdmin: false }),
      viewer: createViewer({
        role: USER_ROLES.AGENCY_ADMIN,
        userId: IDS.USER_ADMIN,
      }),
    })).toThrow('Another agency admin is required before deactivating this account.')
  })
})
