import { describe, expect, it } from 'vitest'

import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_STATUSES,
  normalizeNeededAction,
} from './model'

describe('normalizeNeededAction', () => {
  it('normalizes UC-005 fields and keeps legacy response aliases compatible', () => {
    const action = normalizeNeededAction({
      client_id: ' client-id ',
      client_response: ' Approved ',
      client_responded_at: '2026-05-16T10:00:00.000Z',
      client_responded_by: 'client-user',
      due_date: ' 2026-05-20 ',
      id: ' action-id ',
      internal_notes: ' Internal only ',
      owner_name: ' Account Manager ',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_link: ' https://example.com ',
      status: NEEDED_ACTION_STATUSES.ANSWERED,
      title: ' Approve offer ',
    })

    expect(action).toMatchObject({
      client_id: 'client-id',
      client_response: 'Approved',
      client_responded_at: '2026-05-16T10:00:00.000Z',
      client_responded_by: 'client-user',
      due_date: '2026-05-20',
      id: 'action-id',
      internal_notes: 'Internal only',
      owner_name: 'Account Manager',
      priority: NEEDED_ACTION_PRIORITIES.HIGH,
      related_link: 'https://example.com',
      responded_at: '2026-05-16T10:00:00.000Z',
      responded_by: 'client-user',
      status: NEEDED_ACTION_STATUSES.ANSWERED,
      title: 'Approve offer',
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
