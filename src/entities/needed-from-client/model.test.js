import { describe, expect, it } from 'vitest'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
  normalizeNeededAction,
} from './model'

describe('normalizeNeededAction', () => {
  it('normalizes UC-005 fields and keeps legacy response aliases compatible', () => {
    const action = normalizeNeededAction({
      client_id: ' client-id ',
      client_owner: ' Sarah Client ',
      client_response: ' Approved ',
      client_responded_at: '2026-05-16T10:00:00.000Z',
      client_responded_by: 'client-user',
      due_date: ' 2026-05-20 ',
      id: ' action-id ',
      impact_if_delayed: ' Launch moves back ',
      internal_notes: ' Internal only ',
      last_reminded_at: '2026-05-15T10:00:00.000Z',
      owner_name: ' Account Manager ',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_link: ' https://example.com ',
      status: NEEDED_ACTION_STATUSES.ANSWERED,
      title: ' Approve offer ',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      why_needed: ' Needed before launch ',
    })

    expect(action).toMatchObject({
      agency_owner: 'Account Manager',
      client_id: 'client-id',
      client_owner: 'Sarah Client',
      client_response: 'Approved',
      client_responded_at: '2026-05-16T10:00:00.000Z',
      client_responded_by: 'client-user',
      due_date: '2026-05-20',
      id: 'action-id',
      impact_if_delayed: 'Launch moves back',
      internal_notes: 'Internal only',
      last_reminded_at: '2026-05-15T10:00:00.000Z',
      owner_name: 'Account Manager',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_link: 'https://example.com',
      responded_at: '2026-05-16T10:00:00.000Z',
      responded_by: 'client-user',
      status: NEEDED_ACTION_STATUSES.ANSWERED,
      title: 'Approve offer',
      type: NEEDED_ACTION_TYPES.APPROVAL,
      why_needed: 'Needed before launch',
    })
  })

  it('falls back to safe default status and priority', () => {
    const action = normalizeNeededAction({
      priority: 'urgent',
      status: 'waiting',
    })

    expect(action.status).toBe(NEEDED_ACTION_STATUSES.PENDING)
    expect(action.priority).toBe(NEEDED_ACTION_PRIORITIES.MEDIUM)
  })

  it('reads legacy response fields into canonical client response fields', () => {
    const action = normalizeNeededAction({
      responded_at: '2026-05-16T11:00:00.000Z',
      responded_by: 'legacy-client',
    })

    expect(action.client_responded_at).toBe('2026-05-16T11:00:00.000Z')
    expect(action.client_responded_by).toBe('legacy-client')
  })
})
