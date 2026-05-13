import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES } from '../../entities/client'
import { USER_ROLES } from '../../entities/profile'
import {
  createAdminClient,
  getPortalSlugIssue,
  listAdminClients,
  normalizePortalSlug,
  updateAdminClient,
} from './adminClientService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  NEW_CLIENT: '55555555-5555-4555-8555-555555555555',
  NEW_INVITATION: '66666666-6666-4666-8666-666666666666',
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
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

      return record
    },
  }
}

function createRepositories(initialClients) {
  return {
    clients: createClientsRepository(initialClients),
    clientInvitations: createClientsRepository([]),
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return {
    agencyId,
    role: USER_ROLES.AGENCY_ADMIN,
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
    })
    expect(result.invitation).toMatchObject({
      client_id: IDS.NEW_CLIENT,
      email: 'owner@example.com',
      status: 'pending',
    })
    expect(repositories.clients.list()).toHaveLength(1)
    expect(repositories.clientInvitations.list()).toHaveLength(1)
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
    expect(repositories.clients.findById(IDS.CLIENT_A).name).toBe('Existing Client Updated')
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
        clientId: IDS.CLIENT_A,
        role: USER_ROLES.CLIENT_USER,
      },
    })).toThrow('Only agency admins can manage clients.')
  })
})
