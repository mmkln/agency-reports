import { describe, expect, it, vi } from 'vitest'

import {
  syncGhlConversationMessagesFromApi,
  syncGhlConversationsFromApi,
} from './ghlIntegrationApiService'

describe('ghlIntegrationApiService', () => {
  it('syncs GHL conversations through the workspace source connection endpoint', async () => {
    const apiClient = {
      post: vi.fn().mockResolvedValue({
        conversations: [{ external_id: 'conversation_123' }],
        conversations_created: 1,
        fetched: 1,
      }),
    }

    const result = await syncGhlConversationsFromApi({
      apiClient,
      limit: 10,
      sourceConnectionId: 'source-1',
      workspaceId: 'workspace-1',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/source-connections/source-1/ghl/conversations/sync/',
      { limit: 10 },
    )
    expect(result).toMatchObject({
      conversations: [{ externalId: 'conversation_123' }],
      conversationsCreated: 1,
      fetched: 1,
    })
  })

  it('syncs GHL conversation messages for a specific conversation', async () => {
    const apiClient = {
      post: vi.fn().mockResolvedValue({
        messages: [{ external_id: 'message_123' }],
        messages_created: 1,
      }),
    }

    const result = await syncGhlConversationMessagesFromApi({
      apiClient,
      conversationId: 'conversation-1',
      limit: 25,
      sourceConnectionId: 'source-1',
      workspaceId: 'workspace-1',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/workspaces/workspace-1/source-connections/source-1/ghl/conversations/conversation-1/messages/sync/',
      { limit: 25 },
    )
    expect(result).toMatchObject({
      messages: [{ externalId: 'message_123' }],
      messagesCreated: 1,
    })
  })

  it('requires source, workspace, and conversation identifiers', async () => {
    const apiClient = {
      post: vi.fn(),
    }

    await expect(syncGhlConversationsFromApi({
      apiClient,
      sourceConnectionId: '',
      workspaceId: 'workspace-1',
    })).rejects.toThrow('sourceConnectionId is required.')

    await expect(syncGhlConversationMessagesFromApi({
      apiClient,
      conversationId: '',
      sourceConnectionId: 'source-1',
      workspaceId: 'workspace-1',
    })).rejects.toThrow('conversationId is required.')
  })
})
