import { describe, expect, it } from 'vitest'

import {
  normalizeGhlConversationMessageRecord,
  normalizeGhlConversationMessageSyncResult,
  normalizeGhlConversationRecord,
  normalizeGhlConversationSyncResult,
} from './apiContract'

describe('ghl integration API contract', () => {
  it('normalizes conversation records from Django shape', () => {
    expect(normalizeGhlConversationRecord({
      contact_external_id: 'contact_123',
      external_id: 'conversation_123',
      last_message_at: '2026-05-28T10:00:00Z',
      last_message_direction: 'inbound',
      source_connection_id: 'source_123',
      workspace_id: 'workspace_123',
    })).toMatchObject({
      contactExternalId: 'contact_123',
      externalId: 'conversation_123',
      lastMessageAt: '2026-05-28T10:00:00Z',
      lastMessageDirection: 'inbound',
      sourceConnectionId: 'source_123',
      workspaceId: 'workspace_123',
    })
  })

  it('normalizes conversation message records without exposing message body', () => {
    const message = normalizeGhlConversationMessageRecord({
      body: 'Do not expose this.',
      body_stored: false,
      contact_external_id: 'contact_123',
      conversation_external_id: 'conversation_123',
      direction: 'outbound',
      external_id: 'message_123',
      message_at: '2026-05-28T10:02:00Z',
      message_status: 'delivered',
    })

    expect(message).toMatchObject({
      bodyStored: false,
      contactExternalId: 'contact_123',
      conversationExternalId: 'conversation_123',
      direction: 'outbound',
      externalId: 'message_123',
      messageAt: '2026-05-28T10:02:00Z',
      messageStatus: 'delivered',
    })
    expect(message).not.toHaveProperty('body')
  })

  it('normalizes conversation sync result counters and records', () => {
    expect(normalizeGhlConversationSyncResult({
      conversations: [{ external_id: 'conversation_123' }],
      conversations_created: 1,
      conversations_updated: 2,
      created: 3,
      duplicates: 4,
      fetched: 5,
      samples_created: 6,
      skipped: 7,
    })).toMatchObject({
      conversations: [{ externalId: 'conversation_123' }],
      conversationsCreated: 1,
      conversationsUpdated: 2,
      created: 3,
      duplicates: 4,
      fetched: 5,
      samplesCreated: 6,
      skipped: 7,
    })
  })

  it('normalizes conversation message sync result counters and records', () => {
    expect(normalizeGhlConversationMessageSyncResult({
      messages: [{ external_id: 'message_123' }],
      messages_created: 1,
      messages_updated: 2,
    })).toMatchObject({
      messages: [{ externalId: 'message_123' }],
      messagesCreated: 1,
      messagesUpdated: 2,
    })
  })
})
