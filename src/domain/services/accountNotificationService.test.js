import { describe, expect, it } from 'vitest'

import { PROFILE_STATUSES, USER_ROLES } from '../../entities/profile'
import {
  getOwnNotificationPreferences,
  updateOwnNotificationPreferences,
} from './accountNotificationService'

const IDS = Object.freeze({
  PROFILE: '11111111-1111-4111-8111-111111111111',
  USER: '22222222-2222-4222-8222-222222222222',
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

function createRepositories(profileOverrides = {}) {
  return {
    profiles: createProfilesRepository([
      {
        email: 'user@example.com',
        id: IDS.PROFILE,
        name: 'Portal User',
        role: USER_ROLES.CLIENT_TEAM,
        user_id: IDS.USER,
        ...profileOverrides,
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

describe('accountNotificationService', () => {
  it('returns default notification preferences for profiles without saved preferences', () => {
    expect(getOwnNotificationPreferences({
      repositories: createRepositories(),
      viewer: createViewer(),
    })).toEqual({
      actionNeeded: true,
      emailUpdates: true,
      weeklySummary: false,
    })
  })

  it('updates own notification preferences on the profile record', () => {
    const repositories = createRepositories()

    const preferences = updateOwnNotificationPreferences({
      input: {
        actionNeeded: false,
        emailUpdates: true,
        weeklySummary: true,
      },
      now: () => '2026-05-20T12:00:00.000Z',
      repositories,
      viewer: createViewer(),
    })

    expect(preferences).toEqual({
      actionNeeded: false,
      emailUpdates: true,
      weeklySummary: true,
    })
    expect(repositories.profiles.findByUserId(IDS.USER)).toMatchObject({
      notification_preferences: {
        action_needed: false,
        email_updates: true,
        weekly_summary: true,
      },
      updated_at: '2026-05-20T12:00:00.000Z',
    })
  })

  it('blocks inactive profiles', () => {
    expect(() => getOwnNotificationPreferences({
      repositories: createRepositories({
        status: PROFILE_STATUSES.INACTIVE,
      }),
      viewer: createViewer(),
    })).toThrow('Profile was not found.')
  })
})
