import { describe, expect, it } from 'vitest'

import {
  ingestGhlGrowthReviewEvent,
  saveGhlGrowthReviewSnapshot,
} from './ghlGrowthReviewIntegrationService'

function createRepository(records = []) {
  const items = [...records]

  return {
    findById(id) {
      return items.find((record) => record.id === id) ?? null
    },
    list() {
      return items
    },
    listByClientId(clientId) {
      return this.listByWorkspaceId(clientId)
    },
    listByWorkspaceId(clientId) {
      return items.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      const index = items.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        items[index] = { ...items[index], ...record }
      } else {
        items.push(record)
      }

      return record
    },
  }
}

function createRepositories() {
  return {
    dentalGrowthReviewPeriods: createRepository(),
    growthReviewSnapshots: createRepository(),
    normalizedBookings: createRepository(),
    normalizedContactEvents: createRepository(),
    normalizedLeads: createRepository(),
    rawGhlEvents: createRepository(),
  }
}

describe('ghlGrowthReviewIntegrationService', () => {
  it('stores raw events, derives normalized records, and recalculates a Growth Review period', () => {
    const repositories = createRepositories()
    const basePayload = {
      client_id: 'client-1',
      period_end: '2026-05-17',
      period_start: '2026-05-11',
    }

    ingestGhlGrowthReviewEvent({
      payload: {
        ...basePayload,
        contact_id: 'contact-1',
        event_id: 'contact-1-created',
        event_type: 'contact_created',
        occurred_at: '2026-05-11T09:00:00.000Z',
        source: 'FB Lead',
      },
      repositories,
    })
    ingestGhlGrowthReviewEvent({
      payload: {
        ...basePayload,
        contact_id: 'contact-1',
        event_id: 'contact-1-inbound',
        event_type: 'conversation_message',
        occurred_at: '2026-05-11T09:05:00.000Z',
        payload: {
          channel: 'sms',
          direction: 'inbound',
        },
      },
      repositories,
    })
    ingestGhlGrowthReviewEvent({
      payload: {
        ...basePayload,
        contact_id: 'contact-1',
        event_id: 'contact-1-outbound',
        event_type: 'conversation_message',
        occurred_at: '2026-05-11T09:08:00.000Z',
        payload: {
          channel: 'sms',
          direction: 'outbound',
        },
      },
      repositories,
    })
    const result = ingestGhlGrowthReviewEvent({
      payload: {
        ...basePayload,
        appointment_id: 'appt-1',
        contact_id: 'contact-1',
        event_id: 'appt-1-created',
        event_type: 'appointment_created',
        occurred_at: '2026-05-11T09:10:00.000Z',
      },
      repositories,
    })

    expect(repositories.rawGhlEvents.list()).toHaveLength(4)
    expect(repositories.normalizedLeads.listByWorkspaceId('client-1')).toHaveLength(1)
    expect(repositories.normalizedContactEvents.listByWorkspaceId('client-1')).toHaveLength(2)
    expect(repositories.normalizedBookings.listByWorkspaceId('client-1')).toHaveLength(1)
    expect(result.period.content.hero_metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'bookings',
          value: '1',
        }),
        expect.objectContaining({
          id: 'median-first-reply',
          value: '3m',
        }),
        expect.objectContaining({
          confidence: 'unavailable',
          id: 'attended-appointments',
        }),
      ]),
    )
    expect(result.period.content.funnel).toEqual([
      expect.objectContaining({ id: 'leads-received', stage_count: 1 }),
      expect.objectContaining({ id: 'contacted', conversion_rate: 100 }),
      expect.objectContaining({ id: 'booked', conversion_rate: 100 }),
    ])
  })

  it('can calculate a snapshot for an arbitrary requested date range', () => {
    const repositories = createRepositories()

    repositories.normalizedLeads.upsert({
      client_id: 'client-1',
      contact_id: 'contact-1',
      created_at: '2026-05-12T09:00:00.000Z',
      id: 'lead-1',
      normalized_source: 'meta',
      source_system: 'ghl',
    })

    const { period, snapshot } = saveGhlGrowthReviewSnapshot({
      clientId: 'client-1',
      periodEnd: '2026-05-17',
      periodStart: '2026-05-11',
      repositories,
    })

    expect(period).toMatchObject({
      calculation_version: 'growth-review-ghl-v1',
      client_id: 'client-1',
      publish_state: 'published',
    })
    expect(snapshot).toMatchObject({
      client_id: 'client-1',
      period_end: '2026-05-17',
      period_start: '2026-05-11',
    })
    expect(repositories.dentalGrowthReviewPeriods.listByWorkspaceId('client-1')).toHaveLength(1)
  })
})
