import { describe, expect, it } from 'vitest'

import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import { getClientClinicFoundationPage } from './clinicClientService'

const IDS = Object.freeze({
  AGENCY: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  CLIENT_A: '11111111-1111-4111-8111-111111111111',
  CLIENT_B: '22222222-2222-4222-8222-222222222222',
  GENERIC_CLIENT: '33333333-3333-4333-8333-333333333333',
  LOCATION: '44444444-4444-4444-8444-444444444444',
  PROFILE: '55555555-5555-4555-8555-555555555555',
  SERVICE_LINE: '66666666-6666-4666-8666-666666666666',
})

function createEntityRepository(records = []) {
  const storedRecords = records.map((record) => ({ ...record }))

  return {
    findById(id) {
      return storedRecords.find((record) => record.id === id) ?? null
    },
    list() {
      return storedRecords
    },
    listByClientId(clientId) {
      return storedRecords.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      storedRecords.push(record)
      return record
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_A,
        name: 'Clinic A',
        portal_slug: 'clinic-a',
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT_B,
        name: 'Clinic B',
        portal_slug: 'clinic-b',
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY,
        id: IDS.GENERIC_CLIENT,
        name: 'Generic Client',
        portal_slug: 'generic-client',
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    clinicLocations: createEntityRepository([
      {
        address: '1 Main Street',
        city: 'Austin',
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.LOCATION,
        is_active: true,
        name: 'Main Clinic',
      },
    ]),
    clinicProfiles: createEntityRepository([
      {
        capacity_notes: 'Two implant consult slots remain open weekly.',
        client_id: IDS.CLIENT_A,
        id: IDS.PROFILE,
        insurance_model: 'Mixed insurance and private pay.',
        primary_goal: 'Increase booked new patient appointments.',
        specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
      },
    ]),
    clinicServiceLines: createEntityRepository([
      {
        average_value: 4200,
        capacity_note: 'Keep qualification strict before scaling.',
        client_id: IDS.CLIENT_A,
        display_order: 10,
        id: IDS.SERVICE_LINE,
        location_ids: [IDS.LOCATION],
        name: 'Dental Implants',
        primary_channel: 'google_ads',
        status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
        target_monthly_bookings: 24,
      },
    ]),
    ...overrides,
  }
}

function createClientViewer(clientId = IDS.CLIENT_A) {
  return {
    clientIds: [clientId],
    role: USER_ROLES.CLIENT_USER,
  }
}

function createAdminViewer() {
  return {
    agencyId: IDS.AGENCY,
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

function createOtherAgencyAdminViewer() {
  return {
    agencyId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    role: USER_ROLES.AGENCY_ADMIN,
  }
}

describe('clinicClientService', () => {
  it('returns clinic profile, locations, and service lines for an authorized clinic client', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createClientViewer(),
    })

    expect(page.status).toBe('ready')
    expect(page.client).toMatchObject({
      id: IDS.CLIENT_A,
      type: CLIENT_TYPES.CLINIC,
      typeMeta: {
        label: 'Clinic',
      },
    })
    expect(page.profile).toMatchObject({
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
      specialtyMeta: {
        label: 'Dental',
      },
    })
    expect(page.locations.map((location) => location.name)).toEqual(['Main Clinic'])
    expect(page.serviceLines[0]).toMatchObject({
      locations: [expect.objectContaining({ name: 'Main Clinic' })],
      name: 'Dental Implants',
      statusMeta: {
        label: 'Active',
      },
      targetMonthlyBookings: 24,
    })
  })

  it('denies cross-client clinic access', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createClientViewer(IDS.CLIENT_A),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('does not expose generic clients through the clinic foundation read model', () => {
    const page = getClientClinicFoundationPage({
      clientId: IDS.GENERIC_CLIENT,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(page).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('allows agency admins to read clinic records only for their own agency', () => {
    const allowedPage = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })
    const deniedPage = getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createOtherAgencyAdminViewer(),
    })

    expect(allowedPage.status).toBe('ready')
    expect(deniedPage).toEqual({
      reason: 'access_denied',
      status: 'error',
    })
  })

  it('blocks patient-level fields from clinic MVP read models', () => {
    const repositories = createRepositories({
      clinicServiceLines: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SERVICE_LINE,
          name: 'Dental Implants',
          patient_name: 'Jane Patient',
          status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
        },
      ]),
    })

    expect(() => getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Clinic service line must stay aggregate-only')
  })

  it('blocks nested patient-level fields from clinic profile data', () => {
    const repositories = createRepositories({
      clinicProfiles: createEntityRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.PROFILE,
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
          tracking_note: {
            patient_email: 'jane@example.com',
          },
        },
      ]),
    })

    expect(() => getClientClinicFoundationPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createClientViewer(),
    })).toThrow('Clinic profile must stay aggregate-only')
  })
})
