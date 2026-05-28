import {
  normalizeGhlConversationMessageSyncResult,
  normalizeGhlConversationSyncResult,
} from '../../entities/ghl-integration'

function requireId(value, label) {
  if (!value) {
    throw new Error(`${label} is required.`)
  }
}

function encodePathValue(value) {
  return encodeURIComponent(String(value))
}

function createSourceConnectionPath({ sourceConnectionId, workspaceId }) {
  requireId(workspaceId, 'workspaceId')
  requireId(sourceConnectionId, 'sourceConnectionId')

  return `/api/workspaces/${encodePathValue(workspaceId)}/source-connections/${encodePathValue(sourceConnectionId)}`
}

export async function syncGhlConversationsFromApi({
  apiClient,
  limit = 20,
  sourceConnectionId,
  workspaceId,
}) {
  const payload = await apiClient.post(
    `${createSourceConnectionPath({ sourceConnectionId, workspaceId })}/ghl/conversations/sync/`,
    { limit },
  )

  return normalizeGhlConversationSyncResult(payload)
}

export async function syncGhlConversationMessagesFromApi({
  apiClient,
  conversationId,
  limit = 20,
  sourceConnectionId,
  workspaceId,
}) {
  requireId(conversationId, 'conversationId')

  const payload = await apiClient.post(
    `${createSourceConnectionPath({ sourceConnectionId, workspaceId })}/ghl/conversations/${encodePathValue(conversationId)}/messages/sync/`,
    { limit },
  )

  return normalizeGhlConversationMessageSyncResult(payload)
}
