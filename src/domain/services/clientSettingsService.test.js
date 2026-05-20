import { describe, expect, it } from 'vitest'

import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { getClientSettingsPage, updateClientProfileSettings } from './clientSettingsService'

const IDS = Object.freeze({
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  MEMBERSHIP_A: '33333333-3333-4333-8333-333333333333',
  MEMBERSHIP_B: '44444444-4444-4444-8444-444444444444',
  USER_A: '55555555-5555-4555-8555-555555555555',
  USER_B: '66666666-6666-4666-8666-666666666666',
})

function createEntityRepository(records = []) {
  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
        return records[index]
      }

      records.push(record)
      return record
    },
  }
}

function createRepositories() {
  return {
    clientMemberships: createEntityRepository([
      {
        client_id: IDS.CLIENT_A,
        id: IDS.MEMBERSHIP_A,
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER_A,
      },
      {
        client_id: IDS.CLIENT_A,
        id: IDS.MEMBERSHIP_B,
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
        user_id: IDS.USER_B,
      },
    ]),
    clients: createEntityRepository([
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_A,
        name: 'Client A',
        portal_slug: 'client-a',
        primary_contact_email: 'owner@example.com',
        primary_contact_name: 'Owner User',
      },
      {
        agency_id: 'agency-a',
        id: IDS.CLIENT_B,
        name: 'Client B',
        portal_slug: 'client-b',
      },
    ]),
    profiles: {
      records: [
          {
            email: 'owner@example.com',
            id: 'profile-a',
            name: 'Owner User',
            role: USER_ROLES.CLIENT_ADMIN,
            user_id: IDS.USER_A,
          },
          {
            email: 'viewer@example.com',
            id: 'profile-b',
            name: 'Viewer User',
            role: USER_ROLES.CLIENT_TEAM,
            user_id: IDS.USER_B,
          },
        ],
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
    },
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientId,
    clientIds: [clientId],
    email: 'owner@example.com',
    name: 'Owner User',
    role: USER_ROLES.CLIENT_USER,
    userId: IDS.USER_A,
  }
}

describe('getClientSettingsPage', () => {
  it('returns profile, company, and member settings for the current client', () => {
    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.profile).toMatchObject({
      email: 'owner@example.com',
      name: 'Owner User',
      roleLabel: 'Client admin',
    })
    expect(page.currentMembership).toMatchObject({
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      roleLabel: 'Owner',
    })
    expect(page.client).toMatchObject({
      name: 'Client A',
      portalSlug: 'client-a',
    })
    expect(page.members.map((member) => member.email)).toEqual([
      'owner@example.com',
      'viewer@example.com',
    ])
    expect(page.sections.notifications.isAvailable).toBe(false)
    expect(page.sections.security.isAvailable).toBe(false)
    expect(page.sections.team).toMatchObject({
      allowedInviteRoles: [CLIENT_MEMBERSHIP_ROLES.VIEWER],
      canManage: true,
    })
  })

  it('marks team management unavailable for client team members', () => {
    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: {
        clientId: IDS.CLIENT_A,
        clientIds: [IDS.CLIENT_A],
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: USER_ROLES.CLIENT_TEAM,
        userId: IDS.USER_B,
      },
    })

    expect(page.status).toBe('ready')
    expect(page.sections.team.canManage).toBe(false)
  })

  it('denies cross-client access', () => {
    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('updates only the authenticated client viewer profile name and email', () => {
    const repositories = createRepositories()
    const updatedProfile = updateClientProfileSettings({
      clientId: IDS.CLIENT_A,
      input: {
        email: 'OWNER.UPDATED@example.com',
        name: 'Owner Updated',
      },
      now: () => '2026-05-20T10:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })

    expect(updatedProfile).toMatchObject({
      email: 'owner.updated@example.com',
      name: 'Owner Updated',
      userId: IDS.USER_A,
    })
    expect(repositories.profiles.findByUserId(IDS.USER_A)).toMatchObject({
      email: 'owner.updated@example.com',
      name: 'Owner Updated',
      updated_at: '2026-05-20T10:00:00.000Z',
    })
    expect(repositories.profiles.findByUserId(IDS.USER_B)).toMatchObject({
      email: 'viewer@example.com',
      name: 'Viewer User',
    })
  })

  it('lets client team members update their own profile', () => {
    const repositories = createRepositories()
    const updatedProfile = updateClientProfileSettings({
      clientId: IDS.CLIENT_A,
      input: {
        email: 'viewer.updated@example.com',
        name: 'Viewer Updated',
      },
      repositories,
      viewer: {
        clientId: IDS.CLIENT_A,
        clientIds: [IDS.CLIENT_A],
        email: 'viewer@example.com',
        name: 'Viewer User',
        role: USER_ROLES.CLIENT_TEAM,
        userId: IDS.USER_B,
      },
    })

    expect(updatedProfile).toMatchObject({
      email: 'viewer.updated@example.com',
      name: 'Viewer Updated',
      userId: IDS.USER_B,
    })
    expect(repositories.profiles.findByUserId(IDS.USER_A)).toMatchObject({
      email: 'owner@example.com',
      name: 'Owner User',
    })
  })

  it('blocks profile updates for another client workspace', () => {
    expect(() => updateClientProfileSettings({
      clientId: IDS.CLIENT_B,
      input: {
        email: 'owner.updated@example.com',
        name: 'Owner Updated',
      },
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })).toThrow('You do not have permission to view this client portal.')
  })

  it('rejects invalid and duplicate profile emails', () => {
    expect(() => updateClientProfileSettings({
      clientId: IDS.CLIENT_A,
      input: {
        email: 'not-an-email',
        name: 'Owner Updated',
      },
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })).toThrow('Email must be a valid email address.')

    expect(() => updateClientProfileSettings({
      clientId: IDS.CLIENT_A,
      input: {
        email: 'viewer@example.com',
        name: 'Owner Updated',
      },
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })).toThrow('Email is already used by another account.')
  })
})
