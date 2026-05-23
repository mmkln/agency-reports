import { describe, expect, it } from 'vitest'

import { CLIENT_REQUEST_STATUSES, CLIENT_REQUEST_TYPES } from '../../entities/client-request'
import { WORKSPACE_CAPABILITIES, WORKSPACE_ROLES } from '../../entities/workspace-membership'
import { getClientSettingsPage } from './clientSettingsService'

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
  const workspaceMemberships = createEntityRepository([
    {
      client_id: IDS.CLIENT_A,
      id: IDS.MEMBERSHIP_A,
      role: WORKSPACE_ROLES.OWNER,
      user_id: IDS.USER_A,
      workspace_id: IDS.CLIENT_A,
    },
    {
      client_id: IDS.CLIENT_A,
      id: IDS.MEMBERSHIP_B,
      role: WORKSPACE_ROLES.VIEWER,
      user_id: IDS.USER_B,
      workspace_id: IDS.CLIENT_A,
    },
  ])
  const clients = createEntityRepository([
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
  ])

  return {
    clientRequests: createEntityRepository([]),
    clients,
    profiles: {
      records: [
          {
            email: 'owner@example.com',
            id: 'profile-a',
            name: 'Owner User',
            user_id: IDS.USER_A,
          },
          {
            email: 'viewer@example.com',
            id: 'profile-b',
            name: 'Viewer User',
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
    workspaceMemberships: {
      ...workspaceMemberships,
      listByWorkspaceId: (workspaceId) => workspaceMemberships.listByClientId(workspaceId),
    },
    workspaces: clients,
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    activeWorkspaceId: clientId,
    email: 'owner@example.com',
    name: 'Owner User',
    userId: IDS.USER_A,
    workspaceMemberships: [{
      capabilities: [
        WORKSPACE_CAPABILITIES.VIEW_PORTAL,
        WORKSPACE_CAPABILITIES.MANAGE_MEMBERS,
        WORKSPACE_CAPABILITIES.REQUEST_DELETION,
      ],
      workspaceId: clientId,
    }],
  }
}

describe('getClientSettingsPage', () => {
  it('returns company, access, and member settings for the current client', () => {
    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.profile).toBeUndefined()
    expect(page.currentMembership).toMatchObject({
      role: WORKSPACE_ROLES.OWNER,
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
    expect(page.sections.notifications).toBeUndefined()
    expect(page.sections.security).toBeUndefined()
    expect(page.sections.team).toMatchObject({
      allowedInviteRoles: [WORKSPACE_ROLES.VIEWER],
      canManage: true,
    })
  })

  it('marks team management unavailable for client team members', () => {
    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: {
        activeWorkspaceId: IDS.CLIENT_A,
        email: 'viewer@example.com',
        name: 'Viewer User',
        userId: IDS.USER_B,
        workspaceMemberships: [{
          capabilities: [WORKSPACE_CAPABILITIES.VIEW_PORTAL],
          workspaceId: IDS.CLIENT_A,
        }],
      },
    })

    expect(page.status).toBe('ready')
    expect(page.sections.team.canManage).toBe(false)
  })

  it('exposes an open business deletion request in access settings', () => {
    const repositories = createRepositories()

    repositories.clientRequests.upsert({
      client_id: IDS.CLIENT_A,
      created_at: '2026-05-20T12:00:00.000Z',
      description: 'Please delete this business workspace.',
      id: '77777777-7777-4777-8777-777777777777',
      request_type: CLIENT_REQUEST_TYPES.BUSINESS_DELETION,
      status: CLIENT_REQUEST_STATUSES.SUBMITTED,
      title: 'Business deletion request - Client A',
    })

    const page = getClientSettingsPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })

    expect(page.sections.access).toMatchObject({
      businessDeletionRequest: {
        id: '77777777-7777-4777-8777-777777777777',
        status: CLIENT_REQUEST_STATUSES.SUBMITTED,
        title: 'Business deletion request - Client A',
      },
      canRequestBusinessDeletion: true,
    })
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

})
