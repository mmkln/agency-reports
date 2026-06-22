function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeGhlConversationRecord(input = {}) {
  const source = isPlainObject(input) ? input : {}

  return {
    assignedToExternalId: normalizeText(source.assigned_to_external_id ?? source.assignedToExternalId),
    channel: normalizeText(source.channel),
    contactExternalId: normalizeText(source.contact_external_id ?? source.contactExternalId),
    dateAdded: normalizeText(source.date_added ?? source.dateAdded),
    dateUpdated: normalizeText(source.date_updated ?? source.dateUpdated),
    externalId: normalizeText(source.external_id ?? source.externalId ?? source.id),
    id: normalizeText(source.id),
    lastMessageAt: normalizeText(source.last_message_at ?? source.lastMessageAt),
    lastMessageDirection: normalizeText(source.last_message_direction ?? source.lastMessageDirection),
    lastMessageStatus: normalizeText(source.last_message_status ?? source.lastMessageStatus),
    lastMessageType: normalizeText(source.last_message_type ?? source.lastMessageType),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
  }
}

export function normalizeGhlConversationMessageRecord(input = {}) {
  const source = isPlainObject(input) ? input : {}

  return {
    bodyStored: normalizeBoolean(source.body_stored ?? source.bodyStored),
    channel: normalizeText(source.channel),
    contactExternalId: normalizeText(source.contact_external_id ?? source.contactExternalId),
    conversationExternalId: normalizeText(source.conversation_external_id ?? source.conversationExternalId),
    dateAdded: normalizeText(source.date_added ?? source.dateAdded),
    dateUpdated: normalizeText(source.date_updated ?? source.dateUpdated),
    direction: normalizeText(source.direction),
    externalId: normalizeText(source.external_id ?? source.externalId ?? source.id),
    id: normalizeText(source.id),
    messageAt: normalizeText(source.message_at ?? source.messageAt),
    messageStatus: normalizeText(source.message_status ?? source.messageStatus),
    messageType: normalizeText(source.message_type ?? source.messageType),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    userExternalId: normalizeText(source.user_external_id ?? source.userExternalId),
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
  }
}

export function normalizeGhlConversationSyncResult(input = {}) {
  const source = isPlainObject(input) ? input : {}
  const conversations = Array.isArray(source.conversations) ? source.conversations : []

  return {
    conversations: conversations.map(normalizeGhlConversationRecord),
    conversationsCreated: normalizeNumber(source.conversations_created ?? source.conversationsCreated),
    conversationsUpdated: normalizeNumber(source.conversations_updated ?? source.conversationsUpdated),
    created: normalizeNumber(source.created),
    duplicates: normalizeNumber(source.duplicates),
    fetched: normalizeNumber(source.fetched),
    samplesCreated: normalizeNumber(source.samples_created ?? source.samplesCreated),
    skipped: normalizeNumber(source.skipped),
  }
}

export function normalizeGhlConversationMessageSyncResult(input = {}) {
  const source = isPlainObject(input) ? input : {}
  const messages = Array.isArray(source.messages) ? source.messages : []

  return {
    created: normalizeNumber(source.created),
    duplicates: normalizeNumber(source.duplicates),
    fetched: normalizeNumber(source.fetched),
    messages: messages.map(normalizeGhlConversationMessageRecord),
    messagesCreated: normalizeNumber(source.messages_created ?? source.messagesCreated),
    messagesUpdated: normalizeNumber(source.messages_updated ?? source.messagesUpdated),
    samplesCreated: normalizeNumber(source.samples_created ?? source.samplesCreated),
    skipped: normalizeNumber(source.skipped),
  }
}
