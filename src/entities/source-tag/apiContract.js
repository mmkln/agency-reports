function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeSourceConnection(source = {}) {
  return {
    externalAccountId: normalizeText(source.external_account_id ?? source.externalAccountId),
    id: normalizeText(source.id),
    provider: normalizeText(source.provider),
  }
}

function normalizeTagUsage(source = {}) {
  return {
    campaignId: normalizeText(source.campaign_id ?? source.campaignId),
    campaignName: normalizeText(source.campaign_name ?? source.campaignName),
    campaignStatus: normalizeText(source.campaign_status ?? source.campaignStatus),
    signalKey: normalizeText(source.signal_key ?? source.signalKey),
    signalLabel: normalizeText(source.signal_label ?? source.signalLabel),
    signalId: normalizeText(source.signal_id ?? source.signalId),
  }
}

function normalizeSourceTag(source = {}) {
  return {
    externalId: normalizeText(source.external_id ?? source.externalId),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    sourceConnection: normalizeSourceConnection(
      source.source_connection ?? source.sourceConnection,
    ),
    updatedAt: normalizeText(source.updated_at ?? source.updatedAt),
    usages: normalizeArray(source.usages).map(normalizeTagUsage),
  }
}

export function normalizeSourceTagCatalog(payload = {}) {
  return {
    sourceConnections: normalizeArray(payload.source_connections ?? payload.sourceConnections)
      .map(normalizeSourceConnection),
    tags: normalizeArray(payload.tags).map(normalizeSourceTag),
  }
}
