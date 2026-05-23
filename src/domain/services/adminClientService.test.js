import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import { AGENCY_CAPABILITIES, AGENCY_ROLES } from '../../entities/agency-membership'
import {
  createAdminClient,
  deleteAdminClient,
  getPortalSlugIssue,
  getPortalSlugIssueFromClients,
  listAdminClientPendingInvitations,
  listAdminClients,
  normalizePortalSlug,
  updateAdminClient,
} from './adminClientService'
import { ACTIVITY_EVENT_TYPES } from './activityTrackingService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  NEW_CLIENT: '55555555-5555-4555-8555-555555555555',
  NEW_INVITATION: '66666666-6666-4666-8666-666666666666',
  NEW_INVITATION_EVENT: '88888888-8888-4888-8888-888888888888',
  NEW_INVITATION_TOKEN: '77777777-7777-4777-8777-777777777777',
})

function createClientsRepository(initialClients = []) {
  const records = [...initialClients]

  return {
    list() {
      return records
    },
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

      return record
    },
    deleteById(id) {
      const index = records.findIndex((item) => item.id === id)

      if (index === -1) {
        return false
      }

      records.splice(index, 1)
      return true
    },
  }
}

function createWorkspaceMembershipRepository(initialMemberships = []) {
  const repository = createClientsRepository(initialMemberships)

  return {
    ...repository,
    listByWorkspaceId(workspaceId) {
      return repository.list().filter((record) => record.workspace_id === workspaceId || record.client_id === workspaceId)
    },
  }
}

function createRepositories(initialClients, overrides = {}) {
  const clients = createClientsRepository(initialClients)

  return {
    activityEvents: createClientsRepository([]),
    agencyWorkspaceRelationships: createClientsRepository([]),
    clients,
    workspaceInvitations: createClientsRepository([]),
    clinicLocations: createClientsRepository([]),
    clinicProfiles: createClientsRepository([]),
    clinicServiceLines: createClientsRepository([]),
    dashboardLinks: createClientsRepository([]),
    neededFromClient: createClientsRepository([]),
    projects: createClientsRepository([]),
    reports: createClientsRepository([]),
    serviceLinePerformance: createClientsRepository([]),
    tasks: createClientsRepository([]),
    updates: createClientsRepository([]),
    workspaceMemberships: createWorkspaceMembershipRepository([]),
    workspaces: clients,
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    activeAgencyId: agencyId,
    agencyId,
    agencyMemberships: [{
      agencyId,
      capabilities: [
        AGENCY_CAPABILITIES.CREATE_WORKSPACE,
        AGENCY_CAPABILITIES.MANAGE_WORKSPACE_ACCESS,
      ],
      role: AGENCY_ROLES.ADMIN,
    }],
    managedWorkspaceRelationships: [
      {
        agencyId,
        workspaceId: IDS.CLIENT_A,
      },
      {
        agencyId,
        workspaceId: IDS.NEW_CLIENT,
      },
    ],
    userId: 'admin-user-id',
  }
}

describe('adminClientService', () => {
  it('normalizes portal slugs for client portal URLs', () => {
    expect(normalizePortalSlug('  Green Dental Clinic! 2026  ')).toBe('green-dental-clinic-2026')
  })

  it('lists only clients that belong to the admin agency', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Zulu Client',
      },
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.NEW_CLIENT,
        name: 'Alpha Client',
      },
      {
        agency_id: IDS.AGENCY_B,
        id: IDS.CLIENT_B,
        name: 'Other Agency Client',
      },
    ])

    const clients = listAdminClients({
      repositories,
      viewer: createAdminViewer(),
    })

    expect(clients.map((client) => client.name)).toEqual(['Alpha Client', 'Zulu Client'])
  })

  it('creates clients with UUID string ids and empty overview data', () => {
    const repositories = createRepositories([])

    const generatedIds = [IDS.NEW_CLIENT, IDS.NEW_INVITATION, IDS.NEW_INVITATION_TOKEN]
    const result = createAdminClient({
      activityIdGenerator: () => IDS.NEW_INVITATION_EVENT,
      idGenerator: () => generatedIds.shift(),
      input: {
        logoUrl: 'https://cdn.example.com/new-client-logo.png',
        name: 'New Client',
        portalSlug: '',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
      },
      now: () => '2026-05-09T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.client).toMatchObject({
      agency_id: IDS.AGENCY_A,
      current_focus: [],
      id: IDS.NEW_CLIENT,
      logo_url: 'https://cdn.example.com/new-client-logo.png',
      name: 'New Client',
      portal_slug: 'new-client',
      primary_contact_email: 'owner@example.com',
      primary_contact_name: 'Owner Name',
      status: CLIENT_STATUSES.SETUP,
      type: CLIENT_TYPES.GENERIC,
    })
    expect(result.invitation).toMatchObject({
      client_id: IDS.NEW_CLIENT,
      email: 'owner@example.com',
      status: 'pending',
    })
    expect(repositories.workspaces.list()).toHaveLength(1)
    expect(repositories.agencyWorkspaceRelationships.list()).toEqual([
      expect.objectContaining({
        agency_id: IDS.AGENCY_A,
        status: 'active',
        workspace_id: IDS.NEW_CLIENT,
      }),
    ])
    expect(repositories.workspaceInvitations.list()).toHaveLength(1)
    expect(repositories.activityEvents.list()).toEqual([
      expect.objectContaining({
        client_id: IDS.NEW_CLIENT,
        event_type: ACTIVITY_EVENT_TYPES.CLIENT_INVITATION_CREATED,
        id: IDS.NEW_INVITATION_EVENT,
        metadata: expect.objectContaining({
          invitationId: IDS.NEW_INVITATION,
          status: 'pending',
        }),
      }),
    ])
  })

  it('creates clinic clients when a clinic type is requested', () => {
    const repositories = createRepositories([])

    const generatedIds = [IDS.NEW_CLIENT, IDS.NEW_INVITATION, IDS.NEW_INVITATION_TOKEN]
    const result = createAdminClient({
      idGenerator: () => generatedIds.shift(),
      input: {
        name: 'Clinic Client',
        portalSlug: '',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
        type: CLIENT_TYPES.CLINIC,
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(result.client.type).toBe(CLIENT_TYPES.CLINIC)
  })

  it('rejects duplicate portal slugs in the same agency', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Existing Client',
        portal_slug: 'existing-client',
      },
    ])

    expect(getPortalSlugIssue({
      portalSlug: 'existing-client',
      repositories,
      viewer: createAdminViewer(),
    })).toBe('This portal slug is already used by another client.')

    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        name: 'New Client',
        portalSlug: 'existing-client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('This portal slug is already used by another client.')
  })

  it('validates portal slug issues from an already-loaded client list', () => {
    const clients = [
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        portal_slug: 'existing-client',
      },
      {
        agency_id: IDS.AGENCY_B,
        id: IDS.CLIENT_B,
        portal_slug: 'existing-client',
      },
    ]

    expect(getPortalSlugIssueFromClients({
      clients,
      portalSlug: 'existing-client',
      viewer: createAdminViewer(),
    })).toBe('This portal slug is already used by another client.')

    expect(getPortalSlugIssueFromClients({
      clients,
      ignoreClientId: IDS.CLIENT_A,
      portalSlug: 'existing-client',
      viewer: createAdminViewer(),
    })).toBe('')
  })

  it('lists pending invitations only for clients owned by the admin agency', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Agency A Client',
      },
      {
        agency_id: IDS.AGENCY_B,
        id: IDS.CLIENT_B,
        name: 'Agency B Client',
      },
    ], {
      workspaceInvitations: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          created_at: '2026-05-10T10:00:00.000Z',
          id: IDS.NEW_INVITATION,
          status: 'pending',
        },
        {
          client_id: IDS.CLIENT_A,
          created_at: '2026-05-11T10:00:00.000Z',
          id: '99999999-9999-4999-8999-999999999999',
          status: 'accepted',
        },
        {
          client_id: IDS.CLIENT_B,
          created_at: '2026-05-12T10:00:00.000Z',
          id: '10101010-1010-4010-8010-101010101010',
          status: 'pending',
        },
      ]),
    })

    expect(listAdminClientPendingInvitations({
      repositories,
      viewer: createAdminViewer(),
    }).map((invitation) => invitation.id)).toEqual([IDS.NEW_INVITATION])
  })

  it('updates client workspace details without treating its own portal slug as duplicate', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        created_at: '2026-05-01T10:00:00.000Z',
        id: IDS.CLIENT_A,
        logo_url: '',
        name: 'Existing Client',
        portal_slug: 'existing-client',
        primary_contact_email: 'old@example.com',
        primary_contact_name: 'Old Owner',
        status: CLIENT_STATUSES.SETUP,
        updated_at: '2026-05-01T10:00:00.000Z',
      },
    ])

    const updatedClient = updateAdminClient({
      clientId: IDS.CLIENT_A,
      input: {
        logoUrl: 'https://cdn.example.com/updated-logo.png',
        name: 'Existing Client Updated',
        portalSlug: 'existing-client',
        primaryContactEmail: 'new@example.com',
        primaryContactName: 'New Owner',
        status: CLIENT_STATUSES.ON_TRACK,
      },
      now: () => '2026-05-10T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(updatedClient).toMatchObject({
      created_at: '2026-05-01T10:00:00.000Z',
      id: IDS.CLIENT_A,
      logo_url: 'https://cdn.example.com/updated-logo.png',
      name: 'Existing Client Updated',
      portal_slug: 'existing-client',
      primary_contact_email: 'new@example.com',
      primary_contact_name: 'New Owner',
      status: CLIENT_STATUSES.ON_TRACK,
      updated_at: '2026-05-10T10:00:00.000Z',
    })
    expect(repositories.workspaces.findById(IDS.CLIENT_A).name).toBe('Existing Client Updated')
  })

  it('rejects updates that reuse another client portal slug', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Existing Client',
        portal_slug: 'existing-client',
      },
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.NEW_CLIENT,
        name: 'Other Client',
        portal_slug: 'other-client',
      },
    ])

    expect(() => updateAdminClient({
      clientId: IDS.CLIENT_A,
      input: {
        name: 'Existing Client',
        portalSlug: 'other-client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
      },
      repositories,
      viewer: createAdminViewer(),
    })).toThrow('This portal slug is already used by another client.')
  })

  it('rejects invalid email, logo, and status values', () => {
    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        name: 'New Client',
        primaryContactEmail: 'not-an-email',
        primaryContactName: 'Owner Name',
      },
      repositories: createRepositories([]),
      viewer: createAdminViewer(),
    })).toThrow('Primary contact email must be a valid email address.')

    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        logoUrl: 'ftp://example.com/logo.png',
        name: 'New Client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
      },
      repositories: createRepositories([]),
      viewer: createAdminViewer(),
    })).toThrow('Logo must be an image upload or a valid http(s) URL.')

    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        name: 'New Client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
        status: 'unknown_status',
      },
      repositories: createRepositories([]),
      viewer: createAdminViewer(),
    })).toThrow('Client status is invalid.')

    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        name: 'New Client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
        type: 'hospitality',
      },
      repositories: createRepositories([]),
      viewer: createAdminViewer(),
    })).toThrow('Account type is invalid.')
  })

  it('rejects non-admin viewers', () => {
    expect(() => createAdminClient({
      idGenerator: () => IDS.NEW_CLIENT,
      input: {
        name: 'New Client',
        primaryContactEmail: 'owner@example.com',
        primaryContactName: 'Owner Name',
      },
      repositories: createRepositories([]),
      viewer: {
        activeWorkspaceId: IDS.CLIENT_A,
        workspaceMemberships: [{
          workspaceId: IDS.CLIENT_A,
        }],
      },
    })).toThrow('Only admins can manage accounts.')
  })

  it('deletes clinic foundation records when deleting a client', () => {
    const repositories = createRepositories([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Clinic Client',
      },
    ], {
      clinicLocations: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '77777777-7777-4777-8777-777777777777',
          name: 'Main Clinic',
        },
      ]),
      clinicProfiles: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '88888888-8888-4888-8888-888888888888',
          specialty: 'dental',
        },
      ]),
      clinicServiceLines: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '99999999-9999-4999-8999-999999999999',
          name: 'Dental Implants',
        },
      ]),
      bookingPipelineSnapshots: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '11111111-2222-4222-8222-111111111111',
          qualified_inquiries: 21,
        },
      ]),
      locationPerformance: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '22222222-3333-4333-8333-222222222222',
          location_id: '77777777-7777-4777-8777-777777777777',
        },
      ]),
      serviceLinePerformance: createClientsRepository([
        {
          client_id: IDS.CLIENT_A,
          id: '10101010-1010-4010-8010-101010101010',
          service_line_id: '99999999-9999-4999-8999-999999999999',
        },
      ]),
    })

    expect(deleteAdminClient({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })).toBe(true)

    expect(repositories.workspaces.findById(IDS.CLIENT_A)).toBeNull()
    expect(repositories.clinicProfiles.listByClientId(IDS.CLIENT_A)).toEqual([])
    expect(repositories.clinicLocations.listByClientId(IDS.CLIENT_A)).toEqual([])
    expect(repositories.clinicServiceLines.listByClientId(IDS.CLIENT_A)).toEqual([])
    expect(repositories.bookingPipelineSnapshots.listByClientId(IDS.CLIENT_A)).toEqual([])
    expect(repositories.locationPerformance.listByClientId(IDS.CLIENT_A)).toEqual([])
    expect(repositories.serviceLinePerformance.listByClientId(IDS.CLIENT_A)).toEqual([])
  })
})
