import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { CLIENT_MEMBERSHIP_ROLES, CLIENT_MEMBERSHIP_STATUSES } from '../../entities/client-membership'
import { USER_ROLES } from '../../entities/profile'
import { createLocalStoragePortalRepository } from '../../app/providers/repositories/createLocalStoragePortalRepository'
import {
  addClientMember,
  leaveClientWorkspace,
  listClientMembers,
  removeClientMembership,
  updateClientMembershipRole,
} from './clientMembershipService'
import { buildViewerFromProfile } from './authService'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  MEMBERSHIP: '33333333-3333-4333-8333-333333333333',
  MEMBERSHIP_OTHER_OWNER: '77777777-7777-4777-8777-777777777777',
  PROFILE: '44444444-4444-4444-8444-444444444444',
  USER: '55555555-5555-4555-8555-555555555555',
  USER_OTHER_OWNER: '88888888-8888-4888-8888-888888888888',
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
        created_at: '2026-05-12T10:00:00.000Z',
        id: IDS.CLIENT,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental-clinic',
        primary_contact_email: 'owner@example.com',
        primary_contact_name: 'Owner Name',
        status: CLIENT_STATUSES.ON_TRACK,
        updated_at: '2026-05-12T10:00:00.000Z',
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

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
    userId: 'admin-user',
  }
}

function createClientViewer({ role = USER_ROLES.CLIENT_TEAM, userId = IDS.USER } = {}) {
  return {
    clientId: IDS.CLIENT,
    clientIds: [IDS.CLIENT],
    role,
    userId,
  }
}

function addMembership(repositories, {
  id = IDS.MEMBERSHIP,
  role = CLIENT_MEMBERSHIP_ROLES.VIEWER,
  userId = IDS.USER,
} = {}) {
  repositories.clientMemberships.upsert({
    client_id: IDS.CLIENT,
    id,
    role,
    user_id: userId,
  })
}

describe('clientMembershipService', () => {
  it('adds, lists, updates, and removes client members', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.PROFILE, IDS.USER, IDS.MEMBERSHIP]

    const member = addClientMember({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      repositories,
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      viewer: createAdminViewer(),
    })

    expect(member).toMatchObject({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      name: 'Owner Name',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      userId: IDS.USER,
    })
    expect(listClientMembers({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })).toHaveLength(1)
    addMembership(repositories, {
      id: 'membership-backup-owner',
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      userId: 'backup-owner-user',
    })

    expect(updateClientMembershipRole({
      membershipId: IDS.MEMBERSHIP,
      repositories,
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      viewer: createAdminViewer(),
    })).toMatchObject({
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
    })

    expect(removeClientMembership({
      membershipId: IDS.MEMBERSHIP,
      repositories,
      viewer: createAdminViewer(),
    })).toBe(true)
    expect(listClientMembers({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })).toHaveLength(1)
  })

  it('uses memberships as the client user access source', () => {
    const repositories = createRepositories()
    repositories.profiles.upsert({
      agency_id: IDS.AGENCY,
      client_id: IDS.CLIENT,
      email: 'owner@example.com',
      id: IDS.PROFILE,
      name: 'Owner Name',
      role: USER_ROLES.CLIENT_USER,
      user_id: IDS.USER,
    })

    const viewer = buildViewerFromProfile({
      profile: repositories.profiles.findByUserId(IDS.USER),
      repositories,
    })

    expect(viewer.clientId).toBeNull()
    expect(viewer.clientIds).toEqual([])
  })

  it('rejects duplicate memberships for the same client', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.PROFILE, IDS.USER, IDS.MEMBERSHIP]

    addClientMember({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      idGenerator: () => generatedIds.shift(),
      name: 'Owner Name',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(() => addClientMember({
      clientId: IDS.CLIENT,
      email: 'owner@example.com',
      idGenerator: () => 'new-id',
      name: 'Owner Name',
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('This user already has access to the client.')
  })

  it('lets a client team member leave their workspace', () => {
    const repositories = createRepositories()
    addMembership(repositories)

    expect(leaveClientWorkspace({
      clientId: IDS.CLIENT,
      now: () => '2026-05-20T12:00:00.000Z',
      repositories,
      viewer: createClientViewer(),
    })).toBe(true)
    expect(listClientMembers({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })).toHaveLength(0)
    expect(repositories.clientMemberships.findById(IDS.MEMBERSHIP)).toMatchObject({
      removed_at: '2026-05-20T12:00:00.000Z',
      removed_by: IDS.USER,
      status: CLIENT_MEMBERSHIP_STATUSES.REMOVED,
    })
  })

  it('blocks the last owner from leaving a workspace', () => {
    const repositories = createRepositories()
    addMembership(repositories, {
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
    })

    expect(() => leaveClientWorkspace({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer({ role: USER_ROLES.CLIENT_ADMIN }),
    })).toThrow('Transfer ownership before leaving this workspace.')
  })

  it('lets an owner leave when another owner remains', () => {
    const repositories = createRepositories()
    addMembership(repositories, {
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
    })
    addMembership(repositories, {
      id: IDS.MEMBERSHIP_OTHER_OWNER,
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      userId: IDS.USER_OTHER_OWNER,
    })

    expect(leaveClientWorkspace({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createClientViewer({ role: USER_ROLES.CLIENT_ADMIN }),
    })).toBe(true)
    expect(listClientMembers({
      clientId: IDS.CLIENT,
      repositories,
      viewer: createAdminViewer(),
    })).toEqual([
      expect.objectContaining({
        id: IDS.MEMBERSHIP_OTHER_OWNER,
        userId: IDS.USER_OTHER_OWNER,
      }),
    ])
  })
})
