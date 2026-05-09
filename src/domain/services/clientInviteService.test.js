import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { createLocalStoragePortalRepository } from '../../app/providers/repositories/createLocalStoragePortalRepository'
import { acceptClientInvitation, createClientInvitation } from './clientInviteService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  INVITATION: '33333333-3333-4333-8333-333333333333',
  MEMBERSHIP: '44444444-4444-4444-8444-444444444444',
  PROFILE: '55555555-5555-4555-8555-555555555555',
  TOKEN: '66666666-6666-4666-8666-666666666666',
  USER: '77777777-7777-4777-8777-777777777777',
})

function createMemoryStorage() {
  const records = new Map()

  return {
    getItem(key) {
      return records.get(key) ?? null
    },
    removeItem(key) {
      records.delete(key)
    },
    setItem(key, value) {
      records.set(key, value)
    },
  }
}

function createRepositories() {
  return createLocalStoragePortalRepository({
    seedData: {
      client_invitations: [],
      client_memberships: [],
      clients: [{
        agency_id: IDS.AGENCY,
        created_at: '2026-05-09T10:00:00.000Z',
        id: IDS.CLIENT,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental-clinic',
        primary_contact_email: 'owner@example.com',
        primary_contact_name: 'Owner Name',
        status: CLIENT_STATUSES.ON_TRACK,
        updated_at: '2026-05-09T10:00:00.000Z',
      }],
      dashboard_links: [],
      needed_from_client: [],
      profiles: [],
      projects: [],
      reports: [],
      tasks: [],
      updates: [],
    },
    storage: createMemoryStorage(),
  })
}

describe('clientInviteService', () => {
  it('creates pending client invitations for agency admins', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.INVITATION, IDS.TOKEN]

    const invitation = createClientInvitation({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(invitation).toMatchObject({
      client_id: IDS.CLIENT,
      email: 'owner@example.com',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: IDS.TOKEN.replace(/-/g, ''),
    })
  })

  it('accepts an invitation, creates a client user membership, and stores a session', () => {
    const repositories = createRepositories()
    const storage = createMemoryStorage()

    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'owner@example.com',
      id: IDS.INVITATION,
      name: 'Owner Name',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'invite-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })

    const generatedIds = [IDS.PROFILE, IDS.USER, IDS.MEMBERSHIP]
    const result = acceptClientInvitation({
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      repositories,
      storage,
      token: 'invite-token',
    })

    expect(result.profile).toMatchObject({
      client_id: IDS.CLIENT,
      email: 'owner@example.com',
      role: USER_ROLES.CLIENT_USER,
      user_id: IDS.USER,
    })
    expect(repositories.clientMemberships.list()).toEqual([
      expect.objectContaining({
        client_id: IDS.CLIENT,
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER,
      }),
    ])
    expect(repositories.clientInvitations.findById(IDS.INVITATION)).toMatchObject({
      status: CLIENT_INVITATION_STATUSES.ACCEPTED,
    })
    expect(storage.getItem('agency-reports.auth-session')).toContain(IDS.USER)
  })
})
