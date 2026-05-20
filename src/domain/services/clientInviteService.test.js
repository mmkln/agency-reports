import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { CLIENT_INVITATION_STATUSES } from '../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { createLocalStoragePortalRepository } from '../../app/providers/repositories/createLocalStoragePortalRepository'
import { authenticateWithEmail, DEMO_AUTH_PASSWORD } from './authService'
import { ACTIVITY_EVENT_TYPES } from './activityTrackingService'
import {
  acceptClientInvitation,
  cancelClientInvitation,
  cancelClientTeamInvitation,
  createClientInvitation,
  createClientTeamInvitation,
  getClientInvitationByToken,
  getInvitationStatus,
  INVITATION_ACCESS_LINK_SENT_MESSAGE,
  listClientInvitations,
  listClientTeamInvitations,
  requestClientInvitationAccessLink,
} from './clientInviteService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  INVITATION: '33333333-3333-4333-8333-333333333333',
  INVITATION_ACCEPTED_EVENT: '99999999-9999-4999-8999-999999999999',
  INVITATION_CANCELLED_EVENT: '88888888-8888-4888-8888-888888888888',
  INVITATION_CREATED_EVENT: '10101010-1010-4010-8010-101010101010',
  PASSWORD_CREDENTIAL: '12121212-1212-4212-8212-121212121212',
  PASSWORD_SALT: '13131313-1313-4313-8313-131313131313',
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
      activityIdGenerator: () => IDS.INVITATION_CREATED_EVENT,
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
    expect(repositories.activityEvents.list()).toEqual([
      expect.objectContaining({
        client_id: IDS.CLIENT,
        event_type: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CREATED,
        id: IDS.INVITATION_CREATED_EVENT,
        metadata: expect.objectContaining({
          email: 'owner@example.com',
          invitationId: IDS.INVITATION,
          status: CLIENT_INVITATION_STATUSES.PENDING,
        }),
        user_id: 'admin-user',
      }),
    ])
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

  it('lets client admins create and list teammate invitations for their own client', () => {
    const repositories = createRepositories()
    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: 'client-admin-membership',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
    const generatedIds = [IDS.INVITATION, IDS.TOKEN]
    const viewer = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.CLIENT_ADMIN,
      userId: IDS.USER,
    }

    const invitation = createClientTeamInvitation({
      clientId: IDS.CLIENT,
      email: 'teammate@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Team Mate',
      repositories,
      viewer,
    })

    expect(invitation).toMatchObject({
      client_id: IDS.CLIENT,
      email: 'teammate@example.com',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
    })
    expect(listClientTeamInvitations({
      clientId: IDS.CLIENT,
      repositories,
      viewer,
    })).toEqual([
      expect.objectContaining({
        email: 'teammate@example.com',
        status: CLIENT_INVITATION_STATUSES.PENDING,
      }),
    ])
  })

  it('only lists active pending invitations for client team management', () => {
    const repositories = createRepositories()
    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: 'client-admin-membership',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
    const viewer = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.CLIENT_ADMIN,
      userId: IDS.USER,
    }

    repositories.clientInvitations.upsert({
      accepted_at: null,
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'pending@example.com',
      expires_at: null,
      id: 'pending-invite',
      invited_by: IDS.USER,
      name: 'Pending',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'pending-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })
    repositories.clientInvitations.upsert({
      accepted_at: '2026-05-09T11:00:00.000Z',
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T09:00:00.000Z',
      email: 'accepted@example.com',
      expires_at: null,
      id: 'accepted-invite',
      invited_by: IDS.USER,
      name: 'Accepted',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.ACCEPTED,
      token: 'accepted-token',
      updated_at: '2026-05-09T11:00:00.000Z',
    })
    repositories.clientInvitations.upsert({
      accepted_at: null,
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T08:00:00.000Z',
      email: 'cancelled@example.com',
      expires_at: null,
      id: 'cancelled-invite',
      invited_by: IDS.USER,
      name: 'Cancelled',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.CANCELLED,
      token: 'cancelled-token',
      updated_at: '2026-05-09T11:00:00.000Z',
    })
    repositories.clientInvitations.upsert({
      accepted_at: null,
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T07:00:00.000Z',
      email: 'expired@example.com',
      expires_at: '2026-05-09T09:00:00.000Z',
      id: 'expired-invite',
      invited_by: IDS.USER,
      name: 'Expired',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'expired-token',
      updated_at: '2026-05-09T07:00:00.000Z',
    })

    expect(listClientTeamInvitations({
      clientId: IDS.CLIENT,
      now: () => '2026-05-09T12:00:00.000Z',
      repositories,
      viewer,
    }).map((invitation) => invitation.email)).toEqual(['pending@example.com'])
  })

  it('blocks client team invitations outside client-admin scope', () => {
    const repositories = createRepositories()

    expect(() => createClientTeamInvitation({
      clientId: IDS.CLIENT,
      email: 'teammate@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Team Mate',
      repositories,
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_TEAM,
        userId: IDS.USER,
      },
    })).toThrow('Only client admins can manage this client team.')

    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: 'client-admin-membership',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })

    expect(() => createClientTeamInvitation({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Owner Role',
      repositories,
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_ADMIN,
        userId: IDS.USER,
      },
    })).toThrow('Client admins can invite teammates as viewers only.')
  })

  it('client admin teammate invites create client team accounts on acceptance', () => {
    const repositories = createRepositories()
    const storage = createMemoryStorage()
    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: 'client-admin-membership',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
    const invitationIds = [IDS.INVITATION, IDS.TOKEN]
    const viewer = {
      clientIds: [IDS.CLIENT],
      role: USER_ROLES.CLIENT_ADMIN,
      userId: IDS.USER,
    }

    createClientTeamInvitation({
      clientId: IDS.CLIENT,
      email: 'teammate@example.com',
      idGenerator: () => invitationIds.shift(),
      name: 'Team Mate',
      repositories,
      viewer,
    })

    const generatedIds = [IDS.PROFILE, 'new-team-user', IDS.PASSWORD_SALT, IDS.PASSWORD_CREDENTIAL, IDS.MEMBERSHIP]
    const result = acceptClientInvitation({
      confirmPassword: 'secure-password',
      email: 'teammate@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Team Mate',
      password: 'secure-password',
      repositories,
      storage,
      token: IDS.TOKEN.replace(/-/g, ''),
    })

    expect(result.profile).toMatchObject({
      email: 'teammate@example.com',
      role: USER_ROLES.CLIENT_TEAM,
      user_id: 'new-team-user',
    })
    expect(repositories.clientMemberships.list()).toEqual([
      expect.objectContaining({
        role: CLIENT_MEMBERSHIP_ROLES.OWNER,
        user_id: IDS.USER,
      }),
      expect.objectContaining({
        role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
        user_id: 'new-team-user',
      }),
    ])
  })

  it('lets client admins cancel pending teammate invitations', () => {
    const repositories = createRepositories()
    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: 'client-admin-membership',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'teammate@example.com',
      id: IDS.INVITATION,
      name: 'Team Mate',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'invite-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })

    expect(cancelClientTeamInvitation({
      invitationId: IDS.INVITATION,
      repositories,
      viewer: {
        clientIds: [IDS.CLIENT],
        role: USER_ROLES.CLIENT_ADMIN,
        userId: IDS.USER,
      },
    })).toMatchObject({
      status: CLIENT_INVITATION_STATUSES.CANCELLED,
    })
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
      activityIdGenerator: () => IDS.INVITATION_CANCELLED_EVENT,
      invitationId: IDS.INVITATION,
      repositories,
      viewer: {
        agencyId: IDS.AGENCY,
        role: USER_ROLES.AGENCY_ADMIN,
        userId: 'admin-user',
      },
    })

    expect(invitation.status).toBe(CLIENT_INVITATION_STATUSES.CANCELLED)
    expect(repositories.activityEvents.list()).toEqual([
      expect.objectContaining({
        event_type: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CANCELLED,
        id: IDS.INVITATION_CANCELLED_EVENT,
        metadata: expect.objectContaining({
          invitationId: IDS.INVITATION,
          status: CLIENT_INVITATION_STATUSES.CANCELLED,
        }),
        user_id: 'admin-user',
      }),
    ])
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

    const generatedIds = [IDS.PROFILE, IDS.USER, IDS.PASSWORD_SALT, IDS.PASSWORD_CREDENTIAL, IDS.MEMBERSHIP]
    const result = acceptClientInvitation({
      activityIdGenerator: () => IDS.INVITATION_ACCEPTED_EVENT,
      confirmPassword: 'secure-password',
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      password: 'secure-password',
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
    expect(repositories.authCredentials.list()).toEqual([
      expect.objectContaining({
        algorithm: 'local-demo-password-v1',
        id: IDS.PASSWORD_CREDENTIAL,
        type: 'password',
        user_id: IDS.USER,
      }),
    ])
    expect(authenticateWithEmail({
      email: 'owner@example.com',
      password: 'secure-password',
      repositories,
      storage: createMemoryStorage(),
    }).userId).toBe(IDS.USER)
    expect(repositories.clientInvitations.findById(IDS.INVITATION)).toMatchObject({
      status: CLIENT_INVITATION_STATUSES.ACCEPTED,
    })
    expect(repositories.activityEvents.list()).toEqual([
      expect.objectContaining({
        client_id: IDS.CLIENT,
        event_type: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_ACCEPTED,
        id: IDS.INVITATION_ACCEPTED_EVENT,
        metadata: expect.objectContaining({
          invitationId: IDS.INVITATION,
          status: CLIENT_INVITATION_STATUSES.ACCEPTED,
        }),
        user_id: IDS.USER,
      }),
    ])
    expect(storage.getItem('agency-reports.auth-session')).toContain(IDS.USER)
  })

  it('requires a password pair for new invite-created accounts', () => {
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

    expect(() => acceptClientInvitation({
      confirmPassword: 'different-password',
      email: 'owner@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Owner Name',
      password: 'secure-password',
      repositories,
      token: 'invite-token',
    })).toThrow('Password confirmation does not match.')
  })

  it('keeps seeded users on demo password fallback when no credential exists', () => {
    const repositories = createRepositories()

    repositories.profiles.upsert({
      agency_id: IDS.AGENCY,
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'seeded@example.com',
      id: IDS.PROFILE,
      name: 'Seeded Client',
      role: USER_ROLES.CLIENT_USER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
    repositories.clientMemberships.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      id: IDS.MEMBERSHIP,
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })

    expect(authenticateWithEmail({
      email: 'seeded@example.com',
      password: DEMO_AUTH_PASSWORD,
      repositories,
      storage: createMemoryStorage(),
    }).userId).toBe(IDS.USER)
  })

  it('creates a separate one-time access token for no-token recovery without rotating the invite token', () => {
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

    const generatedIds = ['access-token-id', 'recovery-token']
    const result = requestClientInvitationAccessLink({
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
    })

    expect(result).toMatchObject({
      message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
      sent: true,
    })
    expect(result.accessToken).toMatchObject({
      client_id: IDS.CLIENT,
      expires_at: '2026-05-09T10:15:00.000Z',
      invitation_id: IDS.INVITATION,
      status: 'pending',
      token: 'recoverytoken',
    })
    expect(repositories.clientInvitations.findById(IDS.INVITATION).token).toBe('invite-token')
    expect(getClientInvitationByToken({
      repositories,
      token: 'invite-token',
    }).invitation.id).toBe(IDS.INVITATION)
  })

  it('returns a neutral recovery response when no active invitation can be sent', () => {
    const repositories = createRepositories()

    expect(requestClientInvitationAccessLink({
      email: 'missing@example.com',
      idGenerator: () => crypto.randomUUID(),
      repositories,
    })).toEqual({
      message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
      sent: false,
    })

    repositories.clientInvitations.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'expired@example.com',
      expires_at: '2026-05-01T00:00:00.000Z',
      id: 'expired-recovery-invite',
      name: 'Expired',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'expired-recovery-token',
      updated_at: '2026-05-09T10:00:00.000Z',
    })

    expect(requestClientInvitationAccessLink({
      email: 'expired@example.com',
      idGenerator: () => crypto.randomUUID(),
      now: () => '2026-05-12T00:00:00.000Z',
      repositories,
    })).toEqual({
      message: INVITATION_ACCESS_LINK_SENT_MESSAGE,
      sent: false,
    })
    expect(repositories.invitationAccessTokens.list()).toEqual([])
  })

  it('consumes a one-time access token after successful acceptance', () => {
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
    repositories.invitationAccessTokens.upsert({
      client_id: IDS.CLIENT,
      created_at: '2026-05-09T10:00:00.000Z',
      expires_at: '2026-05-09T10:15:00.000Z',
      id: 'access-token-id',
      invitation_id: IDS.INVITATION,
      status: 'pending',
      token: 'recovery-token',
      updated_at: '2026-05-09T10:00:00.000Z',
      used_at: null,
    })

    const generatedIds = [IDS.PROFILE, IDS.USER, IDS.PASSWORD_SALT, IDS.PASSWORD_CREDENTIAL, IDS.MEMBERSHIP]
    acceptClientInvitation({
      confirmPassword: 'secure-password',
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      now: () => '2026-05-09T10:05:00.000Z',
      password: 'secure-password',
      repositories,
      storage: createMemoryStorage(),
      token: 'recovery-token',
    })

    expect(repositories.invitationAccessTokens.findById('access-token-id')).toMatchObject({
      status: 'used',
      used_at: '2026-05-09T10:05:00.000Z',
    })
    expect(() => getClientInvitationByToken({
      repositories,
      token: 'recovery-token',
    })).toThrow('Invitation access link was already used.')
  })

  it('requires matching authenticated users for invitations targeting existing profiles', () => {
    const repositories = createRepositories()

    repositories.profiles.upsert({
      agency_id: IDS.AGENCY,
      client_id: null,
      created_at: '2026-05-09T10:00:00.000Z',
      email: 'owner@example.com',
      id: IDS.PROFILE,
      name: 'Existing Owner',
      role: USER_ROLES.CLIENT_USER,
      updated_at: '2026-05-09T10:00:00.000Z',
      user_id: IDS.USER,
    })
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

    expect(() => acceptClientInvitation({
      email: 'owner@example.com',
      idGenerator: () => crypto.randomUUID(),
      name: 'Owner Name',
      repositories,
      token: 'invite-token',
    })).toThrow('Sign in to accept this invitation.')

    acceptClientInvitation({
      email: 'owner@example.com',
      idGenerator: () => IDS.MEMBERSHIP,
      name: 'Owner Name',
      repositories,
      storage: createMemoryStorage(),
      token: 'invite-token',
      viewer: {
        role: USER_ROLES.CLIENT_USER,
        userId: IDS.USER,
      },
    })

    expect(repositories.clientMemberships.list()).toEqual([
      expect.objectContaining({
        client_id: IDS.CLIENT,
        user_id: IDS.USER,
      }),
    ])
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
