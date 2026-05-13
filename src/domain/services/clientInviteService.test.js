import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { createLocalStoragePortalRepository } from '../../app/providers/repositories/createLocalStoragePortalRepository'
import {
  acceptClientInvitation,
  cancelClientInvitation,
  createClientInvitation,
  getInvitationStatus,
  listClientInvitations,
} from './clientInviteService'

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

  it('lists invitations with effective expired status and selected role', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.INVITATION, IDS.TOKEN]

    createClientInvitation({
      clientId: IDS.CLIENT,
      email: 'viewer@example.com',
      expiresAt: '2026-05-01T00:00:00.000Z',
      idGenerator: () => generatedIds.shift(),
      name: 'Viewer Name',
      repositories,
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(listClientInvitations({
      clientId: IDS.CLIENT,
      now: () => '2026-05-12T00:00:00.000Z',
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })).toEqual([
      expect.objectContaining({
        email: 'viewer@example.com',
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
        status: CLIENT_INVITATION_STATUSES.EXPIRED,
      }),
    ])
  })

  it('cancels pending invitations', () => {
    const repositories = createRepositories()

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

    const invitation = cancelClientInvitation({
      invitationId: IDS.INVITATION,
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(invitation.status).toBe(CLIENT_INVITATION_STATUSES.CANCELLED)
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

  it('blocks accepting cancelled, accepted, and expired invitations', () => {
    const repositories = createRepositories()

    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'cancelled@example.com',
      id: 'cancelled-invite',
      name: 'Cancelled',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.CANCELLED,
      token: 'cancelled-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })
    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'accepted@example.com',
      id: 'accepted-invite',
      name: 'Accepted',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.ACCEPTED,
      token: 'accepted-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })
    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'expired@example.com',
      expires_at: '2026-05-01T00:00:00.000Z',
      id: 'expired-invite',
      name: 'Expired',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'expired-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })

    expect(() => acceptClientInvitation({
      email: 'cancelled@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Cancelled',
      repositories,
      token: 'cancelled-token',
    })).toThrow('Invitation was cancelled.')
    expect(() => acceptClientInvitation({
      email: 'accepted@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Accepted',
      repositories,
      token: 'accepted-token',
    })).toThrow('Invitation was already accepted.')
    expect(() => acceptClientInvitation({
      email: 'expired@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Expired',
      now: () => '2026-05-12T00:00:00.000Z',
      repositories,
      token: 'expired-token',
    })).toThrow('Invitation has expired.')

    expect(getInvitationStatus(
      repositories.clientInvitations.findById('expired-invite'),
    )).toBe(CLIENT_INVITATION_STATUSES.EXPIRED)
  })
})
