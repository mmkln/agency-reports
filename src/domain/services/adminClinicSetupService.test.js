import { describe, expect, it } from 'vitest'

import { CLIENT_STATUSES, CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_SERVICE_LINE_STATUSES,
} from '../../entities/clinic'
import { createAgencyAccessViewer } from '../test/accessViewerTestHelpers'
import {
  getAdminClinicSetupPage,
  saveAdminClinicSetup,
} from './adminClinicSetupService'

const IDS = Object.freeze({
  AGENCY_A: '11111111-1111-4111-8111-111111111111',
  AGENCY_B: '22222222-2222-4222-8222-222222222222',
  CLIENT_A: '33333333-3333-4333-8333-333333333333',
  CLIENT_B: '44444444-4444-4444-8444-444444444444',
  LOCATION_A: '55555555-5555-4555-8555-555555555555',
  PROFILE_A: '66666666-6666-4666-8666-666666666666',
  SERVICE_A: '77777777-7777-4777-8777-777777777777',
  NEW_LOCATION: '88888888-8888-4888-8888-888888888888',
  NEW_PROFILE: '99999999-9999-4999-8999-999999999999',
  NEW_SERVICE: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
})

function createRepository(initialRecords = []) {
  const records = [...initialRecords]

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByWorkspaceId(clientId) {
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
      const index = records.findIndex((record) => record.id === id)

      if (index < 0) {
        return false
      }

      records.splice(index, 1)
      return true
    },
  }
}

function createRepositories(overrides = {}) {
  return {
    get workspaces() {
      return this.clients
    },
    clients: createRepository([
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_A,
        name: 'Green Dental Clinic',
        portal_slug: 'green-dental',
        primary_contact_email: 'owner@green.test',
        primary_contact_name: 'Owner',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.CLINIC,
      },
      {
        agency_id: IDS.AGENCY_A,
        id: IDS.CLIENT_B,
        name: 'Generic Client',
        status: CLIENT_STATUSES.SETUP,
        type: CLIENT_TYPES.GENERIC,
      },
    ]),
    clinicLocations: createRepository([]),
    clinicProfiles: createRepository([]),
    clinicServiceLines: createRepository([]),
    ...overrides,
  }
}

function createAdminViewer(agencyId = IDS.AGENCY_A) {
  return createAgencyAccessViewer({
    agencyId,
    managedWorkspaceIds: agencyId === IDS.AGENCY_A ? [IDS.CLIENT_A, IDS.CLIENT_B] : [],
    userId: 'admin-user-id',
  })
}

describe('adminClinicSetupService', () => {
  it('reads clinic setup for agency admins only', () => {
    const repositories = createRepositories({
      clinicLocations: createRepository([
        {
          address: '1 Main Street',
          city: 'Austin',
          client_id: IDS.CLIENT_A,
          display_order: 10,
          id: IDS.LOCATION_A,
          is_active: true,
          name: 'Main Clinic',
        },
      ]),
      clinicProfiles: createRepository([
        {
          capacity_notes: 'Two implant days per week.',
          client_id: IDS.CLIENT_A,
          id: IDS.PROFILE_A,
          insurance_model: 'Private pay',
          primary_goal: 'Increase implant consults',
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
        },
      ]),
      clinicServiceLines: createRepository([
        {
          average_value: 4200,
          capacity_note: '8 consults per month',
          client_id: IDS.CLIENT_A,
          display_order: 10,
          id: IDS.SERVICE_A,
          location_ids: [IDS.LOCATION_A],
          name: 'Dental Implants',
          primary_channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
          status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
          target_monthly_bookings: 20,
        },
      ]),
    })

    const page = getAdminClinicSetupPage({
      clientId: IDS.CLIENT_A,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.client).toMatchObject({
      id: IDS.CLIENT_A,
      name: 'Green Dental Clinic',
      type: CLIENT_TYPES.CLINIC,
    })
    expect(page.profile.specialty).toBe(CLINIC_PROFILE_SPECIALTIES.DENTAL)
    expect(page.locations).toHaveLength(1)
    expect(page.serviceLines[0]).toMatchObject({
      location_ids: [IDS.LOCATION_A],
      name: 'Dental Implants',
      status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
    })
  })

  it('saves aggregate clinic profile, locations, and service lines', () => {
    const repositories = createRepositories()
    const generatedIds = [IDS.NEW_PROFILE, IDS.NEW_LOCATION, IDS.NEW_SERVICE]

    const page = saveAdminClinicSetup({
      clientId: IDS.CLIENT_A,
      idGenerator: () => generatedIds.shift(),
      input: {
        locations: [
          {
            address: '1 Main Street',
            city: 'Austin',
            is_active: true,
            name: 'Main Clinic',
          },
        ],
        profile: {
          capacity_notes: 'Open capacity on Fridays.',
          insurance_model: 'Private pay',
          primary_goal: 'Increase booked implant consultations',
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
        },
        serviceLines: [
          {
            average_value: '4200',
            capacity_note: 'Doctor can handle 20 consults.',
            location_ids: [IDS.NEW_LOCATION],
            name: 'Dental Implants',
            primary_channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
            status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
            target_monthly_bookings: '20',
          },
        ],
      },
      now: () => '2026-05-17T10:00:00.000Z',
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.profile).toMatchObject({
      id: IDS.NEW_PROFILE,
      primary_goal: 'Increase booked implant consultations',
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
      updated_at: '2026-05-17T10:00:00.000Z',
    })
    expect(page.locations[0]).toMatchObject({
      id: IDS.NEW_LOCATION,
      name: 'Main Clinic',
    })
    expect(page.serviceLines[0]).toMatchObject({
      average_value: 4200,
      id: IDS.NEW_SERVICE,
      location_ids: [IDS.NEW_LOCATION],
      target_monthly_bookings: 20,
    })
  })

  it('removes clinic foundation records omitted from the saved setup', () => {
    const repositories = createRepositories({
      clinicLocations: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.LOCATION_A,
          is_active: true,
          name: 'Old Clinic',
        },
      ]),
      clinicProfiles: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.PROFILE_A,
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
        },
      ]),
      clinicServiceLines: createRepository([
        {
          client_id: IDS.CLIENT_A,
          id: IDS.SERVICE_A,
          name: 'Old Service',
        },
      ]),
    })

    const page = saveAdminClinicSetup({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.NEW_PROFILE,
      input: {
        locations: [],
        profile: {
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
        },
        serviceLines: [],
      },
      repositories,
      viewer: createAdminViewer(),
    })

    expect(page.locations).toEqual([])
    expect(page.serviceLines).toEqual([])
  })

  it('blocks generic clients, other agencies, and client users', () => {
    expect(() => getAdminClinicSetupPage({
      clientId: IDS.CLIENT_B,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Clinic setup is only available for clinic clients.')

    expect(() => getAdminClinicSetupPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: createAdminViewer(IDS.AGENCY_B),
    })).toThrow('Clinic setup is not available for this admin.')

    expect(() => getAdminClinicSetupPage({
      clientId: IDS.CLIENT_A,
      repositories: createRepositories(),
      viewer: {},
    })).toThrow('Only admins can manage clinic setup.')
  })

  it('rejects patient-level fields in clinic setup records', () => {
    expect(() => saveAdminClinicSetup({
      clientId: IDS.CLIENT_A,
      idGenerator: () => IDS.NEW_PROFILE,
      input: {
        locations: [],
        profile: {
          patient_name: 'Jane Patient',
          specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
        },
        serviceLines: [],
      },
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })).toThrow('Clinic profile must stay aggregate-only.')
  })
})
