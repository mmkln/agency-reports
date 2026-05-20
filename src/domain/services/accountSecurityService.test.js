import { describe, expect, it } from 'vitest'

import { USER_ROLES } from '../../entities/profile'
import { DEMO_AUTH_PASSWORD } from './authService'
import { changeOwnPassword } from './accountSecurityService'
import { verifyPasswordCredential } from './authCredentialService'

const IDS = Object.freeze({
  CREDENTIAL: '11111111-1111-4111-8111-111111111111',
  PROFILE: '22222222-2222-4222-8222-222222222222',
  SALT: '33333333-3333-4333-8333-333333333333',
  USER: '44444444-4444-4444-8444-444444444444',
})

function createRepository(records = []) {
  return {
    records,
    findByUserId(userId) {
      return this.records.find((record) => record.user_id === userId) ?? null
    },
    list() {
      return this.records
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

function createRepositories() {
  return {
    authCredentials: createRepository([]),
    profiles: createRepository([
      {
        email: 'user@example.com',
        id: IDS.PROFILE,
        name: 'Portal User',
        role: USER_ROLES.CLIENT_TEAM,
        user_id: IDS.USER,
      },
    ]),
  }
}

function createViewer() {
  return {
    role: USER_ROLES.CLIENT_TEAM,
    userId: IDS.USER,
  }
}

describe('accountSecurityService', () => {
  it('changes a seeded demo password into a stored credential', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.SALT, IDS.CREDENTIAL]

    const result = changeOwnPassword({
      idGenerator: () => generatedIds.shift(),
      input: {
        confirmPassword: 'new-password',
        currentPassword: DEMO_AUTH_PASSWORD,
        newPassword: 'new-password',
      },
      now: () => '2026-05-20T12:00:00.000Z',
      repositories,
      viewer: createViewer(),
    })

    expect(result).toEqual({
      updatedAt: '2026-05-20T12:00:00.000Z',
      userId: IDS.USER,
    })
    expect(verifyPasswordCredential({
      password: 'new-password',
      repositories,
      userId: IDS.USER,
    })).toBe(true)
    expect(verifyPasswordCredential({
      password: DEMO_AUTH_PASSWORD,
      repositories,
      userId: IDS.USER,
    })).toBe(false)
  })

  it('requires the current password and a valid new password pair', () => {
    const repositories = createRepositories()

    expect(() => changeOwnPassword({
      idGenerator: () => IDS.CREDENTIAL,
      input: {
        confirmPassword: 'new-password',
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      },
      repositories,
      viewer: createViewer(),
    })).toThrow('Current password is incorrect.')

    expect(() => changeOwnPassword({
      idGenerator: () => IDS.CREDENTIAL,
      input: {
        confirmPassword: 'different-password',
        currentPassword: DEMO_AUTH_PASSWORD,
        newPassword: 'new-password',
      },
      repositories,
      viewer: createViewer(),
    })).toThrow('Password confirmation does not match.')

    expect(() => changeOwnPassword({
      idGenerator: () => IDS.CREDENTIAL,
      input: {
        confirmPassword: DEMO_AUTH_PASSWORD,
        currentPassword: DEMO_AUTH_PASSWORD,
        newPassword: DEMO_AUTH_PASSWORD,
      },
      repositories,
      viewer: createViewer(),
    })).toThrow('New password must be different from the current password.')
  })
})
