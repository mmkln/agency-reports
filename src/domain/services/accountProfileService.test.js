import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import { getOwnProfileSettings, updateOwnProfileSettings } from './accountProfileService'

const IDS = Object.freeze({
  AGENCY_ADMIN: '11111111-1111-4111-8111-111111111111',
  AGENCY_TEAM: '22222222-2222-4222-8222-222222222222',
  CLIENT_ADMIN: '33333333-3333-4333-8333-333333333333',
  CLIENT_TEAM: '44444444-4444-4444-8444-444444444444',
})

function createProfilesRepository(records = []) {
  return {
    records,
    findByUserId(userId) {
      return this.records.find((profile) => profile.user_id === userId) ?? null
    },
    list() {
      return this.records
    },
    upsert(record) {
      const index = this.records.findIndex((profile) => profile.id === record.id)

      if (index >= 0) {
        this.records[index] = { ...this.records[index], ...record }
        return this.records[index]
      }

      this.records.push(record)
      return record
    },
  }
}

function createRepositories() {
  return {
    profiles: createProfilesRepository([
      {
        email: 'admin@growthlab.example',
        id: 'profile-admin',
        name: 'GrowthLab Admin',
        role: USER_ROLES.AGENCY_ADMIN,
        user_id: IDS.AGENCY_ADMIN,
      },
      {
        email: 'mia@growthlab.example',
        id: 'profile-team',
        name: 'Mia Carter',
        role: USER_ROLES.AGENCY_TEAM,
        user_id: IDS.AGENCY_TEAM,
      },
      {
        email: 'client@greendental.example',
        id: 'profile-client-admin',
        name: 'Green Dental Client',
        role: USER_ROLES.CLIENT_ADMIN,
        user_id: IDS.CLIENT_ADMIN,
      },
      {
        email: 'ops@greendental.example',
        id: 'profile-client-team',
        name: 'Green Dental Ops',
        role: USER_ROLES.CLIENT_TEAM,
        user_id: IDS.CLIENT_TEAM,
      },
    ]),
  }
}

function createViewer({ role, userId }) {
  return {
    email: '',
    name: '',
    role,
    userId,
  }
}

describe('account profile settings', () => {
  it.each([
    ['agency admin', USER_ROLES.AGENCY_ADMIN, IDS.AGENCY_ADMIN, 'Agency admin'],
    ['agency team', USER_ROLES.AGENCY_TEAM, IDS.AGENCY_TEAM, 'Agency team'],
    ['client admin', USER_ROLES.CLIENT_ADMIN, IDS.CLIENT_ADMIN, 'Client admin'],
    ['client team', USER_ROLES.CLIENT_TEAM, IDS.CLIENT_TEAM, 'Client team'],
  ])('loads %s own profile settings', (_label, role, userId, roleLabel) => {
    const profile = getOwnProfileSettings({
      repositories: createRepositories(),
      viewer: createViewer({ role, userId }),
    })

    expect(profile).toMatchObject({
      role,
      roleLabel,
      userId,
    })
  })

  it.each([
    ['agency admin', USER_ROLES.AGENCY_ADMIN, IDS.AGENCY_ADMIN],
    ['agency team', USER_ROLES.AGENCY_TEAM, IDS.AGENCY_TEAM],
    ['client admin', USER_ROLES.CLIENT_ADMIN, IDS.CLIENT_ADMIN],
    ['client team', USER_ROLES.CLIENT_TEAM, IDS.CLIENT_TEAM],
  ])('lets %s update only their own profile', (_label, role, userId) => {
    const repositories = createRepositories()
    const updatedProfile = updateOwnProfileSettings({
      input: {
        email: `UPDATED.${userId}@example.com`,
        name: `${_label} Updated`,
      },
      now: () => '2026-05-20T10:00:00.000Z',
      repositories,
      viewer: createViewer({ role, userId }),
    })

    expect(updatedProfile).toMatchObject({
      email: `updated.${userId}@example.com`,
      name: `${_label} Updated`,
      userId,
    })
    expect(repositories.profiles.findByUserId(userId)).toMatchObject({
      email: `updated.${userId}@example.com`,
      name: `${_label} Updated`,
      updated_at: '2026-05-20T10:00:00.000Z',
    })

    const otherProfiles = repositories.profiles
      .list()
      .filter((profile) => profile.user_id !== userId)

    expect(otherProfiles.every((profile) => !profile.email.startsWith('updated.'))).toBe(true)
  })

  it('rejects missing auth and missing profile', () => {
    expect(() => getOwnProfileSettings({
      repositories: createRepositories(),
      viewer: null,
    })).toThrow('You must be signed in to manage account settings.')

    expect(() => getOwnProfileSettings({
      repositories: createRepositories(),
      viewer: createViewer({
        role: USER_ROLES.CLIENT_TEAM,
        userId: 'missing-user',
      }),
    })).toThrow('Profile was not found.')
  })

  it('rejects invalid account profile values', () => {
    expect(() => updateOwnProfileSettings({
      input: {
        email: 'admin.updated@example.com',
        name: 'A',
      },
      repositories: createRepositories(),
      viewer: createViewer({
        role: USER_ROLES.AGENCY_ADMIN,
        userId: IDS.AGENCY_ADMIN,
      }),
    })).toThrow('Name must be at least 2 characters.')

    expect(() => updateOwnProfileSettings({
      input: {
        email: 'not-an-email',
        name: 'Admin Updated',
      },
      repositories: createRepositories(),
      viewer: createViewer({
        role: USER_ROLES.AGENCY_ADMIN,
        userId: IDS.AGENCY_ADMIN,
      }),
    })).toThrow('Email must be a valid email address.')

    expect(() => updateOwnProfileSettings({
      input: {
        email: 'mia@growthlab.example',
        name: 'Admin Updated',
      },
      repositories: createRepositories(),
      viewer: createViewer({
        role: USER_ROLES.AGENCY_ADMIN,
        userId: IDS.AGENCY_ADMIN,
      }),
    })).toThrow('Email is already used by another account.')
  })
})
