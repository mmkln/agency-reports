import { describe, expect, it } from 'vitest'

import {
  createNormalizedBookingFromGhlEvent,
  createNormalizedContactEventFromGhlEvent,
  createNormalizedLeadFromGhlEvent,
  GHL_GROWTH_REVIEW_EVENT_TYPES,
  normalizeClinicSource,
  normalizeGhlGrowthReviewEvent,
} from './model'

describe('ghl integration model', () => {
  it('normalizes messy GHL source values into controlled clinic sources', () => {
    expect(normalizeClinicSource({
      rawSource: 'FB Lead Form',
      tags: ['Track C winback'],
    })).toBe('meta')

    expect(normalizeClinicSource({
      rawSource: 'Google Ads - emergency dentist',
    })).toBe('google_ads')
  })

  it('normalizes raw GHL payloads and keeps patient-safe analytics fields', () => {
    const event = normalizeGhlGrowthReviewEvent({
      client_id: 'client-1',
      contact_id: 'contact-1',
      event_id: 'evt-1',
      event_type: GHL_GROWTH_REVIEW_EVENT_TYPES.CONVERSATION_MESSAGE,
      occurred_at: '2026-05-12T10:00:00.000Z',
      payload: {
        channel: 'sms',
        direction: 'outbound',
        source: 'facebook lead',
        tags: ['Track A'],
      },
    })

    expect(event).toMatchObject({
      client_id: 'client-1',
      contact_id: 'contact-1',
      event_type: GHL_GROWTH_REVIEW_EVENT_TYPES.CONVERSATION_MESSAGE,
      normalized_source: 'meta',
      reactivation_track: 'A',
      source_system: 'ghl',
    })
    expect(event.payload_hash).toMatch(/^hash-/)
  })

  it('derives canonical clinic records from raw GHL events', () => {
    const event = normalizeGhlGrowthReviewEvent({
      appointment_id: 'appt-1',
      client_id: 'client-1',
      contact_id: 'contact-1',
      event_id: 'evt-1',
      event_type: GHL_GROWTH_REVIEW_EVENT_TYPES.APPOINTMENT_CREATED,
      occurred_at: '2026-05-12T10:00:00.000Z',
      payload: {
        appointment_status: 'booked',
        source: 'reactivation',
      },
    })
    const lead = createNormalizedLeadFromGhlEvent(event)
    const booking = createNormalizedBookingFromGhlEvent(event)

    expect(lead).toMatchObject({
      client_id: 'client-1',
      contact_id: 'contact-1',
      normalized_source: 'reactivation',
    })
    expect(booking).toMatchObject({
      appointment_id: 'appt-1',
      appointment_status: 'booked',
      client_id: 'client-1',
    })
  })

  it('creates contact events only from conversation messages', () => {
    const event = normalizeGhlGrowthReviewEvent({
      client_id: 'client-1',
      contact_id: 'contact-1',
      event_id: 'msg-1',
      event_type: GHL_GROWTH_REVIEW_EVENT_TYPES.CONVERSATION_MESSAGE,
      occurred_at: '2026-05-12T10:00:00.000Z',
      payload: {
        channel: 'sms',
        direction: 'inbound',
      },
    })

    expect(createNormalizedContactEventFromGhlEvent(event)).toMatchObject({
      channel: 'sms',
      direction: 'inbound',
    })
  })
})
