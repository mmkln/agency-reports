import { describe, expect, it } from 'vitest'

import {
  CLINIC_PROFILE_SPECIALTIES,
  CLINIC_ACQUISITION_CHANNELS,
  CLINIC_SERVICE_LINE_STATUSES,
  assertClinicAggregateRecord,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
  normalizePatientAcquisitionSnapshot,
} from './model'

describe('clinic entity model', () => {
  it('normalizes clinic foundation records for aggregate client-facing read models', () => {
    expect(normalizeClinicProfile({
      client_id: 'client-a',
      id: 'profile-a',
      primary_goal: '  Increase booked appointments.  ',
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
    })).toMatchObject({
      client_id: 'client-a',
      id: 'profile-a',
      primary_goal: 'Increase booked appointments.',
      specialty: CLINIC_PROFILE_SPECIALTIES.DENTAL,
    })

    expect(normalizeClinicLocation({
      client_id: 'client-a',
      display_order: '20',
      id: 'location-a',
      is_active: false,
      name: '  Downtown Clinic  ',
    })).toMatchObject({
      display_order: 20,
      is_active: false,
      name: 'Downtown Clinic',
    })

    expect(normalizeClinicServiceLine({
      average_value: '4200',
      client_id: 'client-a',
      id: 'service-line-a',
      location_ids: [' location-a ', '', null],
      name: 'Dental Implants',
      status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      target_monthly_bookings: '24',
    })).toMatchObject({
      average_value: 4200,
      location_ids: ['location-a'],
      status: CLINIC_SERVICE_LINE_STATUSES.ACTIVE,
      target_monthly_bookings: 24,
    })
  })

  it('normalizes aggregate patient acquisition snapshots', () => {
    expect(normalizePatientAcquisitionSnapshot({
      booked_appointments: '14',
      calls: '18',
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
      chats: '3',
      clicks: '240',
      forms: '9',
      impressions: '12800',
      landing_page_visits: '211',
      qualified_inquiries: '21',
      spend: '1860',
    })).toMatchObject({
      booked_appointments: 14,
      calls: 18,
      channel: CLINIC_ACQUISITION_CHANNELS.GOOGLE_ADS,
      chats: 3,
      clicks: 240,
      forms: 9,
      impressions: 12800,
      landing_page_visits: 211,
      qualified_inquiries: 21,
      spend: 1860,
    })
  })

  it('falls back to safe defaults for unknown clinic enum values', () => {
    expect(normalizeClinicProfile({
      specialty: 'hospital',
    }).specialty).toBe(CLINIC_PROFILE_SPECIALTIES.OTHER)

    expect(normalizeClinicServiceLine({
      status: 'launched',
    }).status).toBe(CLINIC_SERVICE_LINE_STATUSES.PLANNED)

    expect(normalizePatientAcquisitionSnapshot({
      channel: 'print',
    }).channel).toBe(CLINIC_ACQUISITION_CHANNELS.OTHER)
  })

  it('rejects patient-level keys anywhere in clinic aggregate records', () => {
    expect(() => assertClinicAggregateRecord({
      metrics: [
        {
          patient_phone: '+1 555 0100',
        },
      ],
    }, 'Clinic test record')).toThrow('Clinic test record must stay aggregate-only')
  })
})
