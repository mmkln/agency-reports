import { describe, expect, it } from 'vitest'

import { normalizeContactCollection } from './apiContract'

describe('contact collection API contract', () => {
  it('normalizes a paginated contact collection', () => {
    expect(normalizeContactCollection({
      collection: {
        grain: 'opportunity',
        key: 'leads.created',
        title: 'Total leads',
        total_records: 2,
        unique_contacts: 1,
      },
      items: [{
        contact: {
          external_id: 'contact-1',
          external_url: 'https://app.gohighlevel.com/v2/location/location-1/contacts/detail/contact-1',
          name: 'Lauren Dwyer',
        },
        context: { external_id: 'opportunity-1', label: 'Veneers', type: 'opportunity' },
        details: [{ key: 'patient_type', label: 'Patient type', value: 'New' }],
        id: 'opportunity:opportunity-1',
        occurred_at: '2026-10-20T12:00:00Z',
        source: { detail: '$199 Offer', key: 'meta', label: 'Meta Ads' },
        status: { key: 'booked', label: 'Booked' },
      }],
      pagination: { page: 1, page_size: 25, total_items: 2, total_pages: 1 },
    })).toEqual({
      grain: 'opportunity',
      items: [{
        contact: {
          externalId: 'contact-1',
          externalUrl: 'https://app.gohighlevel.com/v2/location/location-1/contacts/detail/contact-1',
          name: 'Lauren Dwyer',
        },
        context: { externalId: 'opportunity-1', label: 'Veneers', type: 'opportunity' },
        details: [{ key: 'patient_type', label: 'Patient type', value: 'New' }],
        id: 'opportunity:opportunity-1',
        occurredAt: '2026-10-20T12:00:00Z',
        source: { detail: '$199 Offer', key: 'meta', label: 'Meta Ads' },
        status: { key: 'booked', label: 'Booked' },
      }],
      key: 'leads.created',
      pagination: { page: 1, pageSize: 25, totalItems: 2, totalPages: 1 },
      title: 'Total leads',
      totalRecords: 2,
      uniqueContacts: 1,
    })
  })

  it('rejects a payload without collection identity', () => {
    expect(() => normalizeContactCollection({ items: [] })).toThrow('invalid payload')
  })
})
