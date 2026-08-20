function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

export function normalizeGrowthReviewReviewSignal(source = {}) {
  return {
    confidence: normalizeText(source.confidence) || 'medium',
    expectedValues: normalizeArray(source.expected_values ?? source.expectedValues)
      .map(normalizeText)
      .filter(Boolean),
    id: normalizeText(source.id),
    isActive: source.is_active !== false && source.isActive !== false,
    key: normalizeText(source.key),
    label: normalizeText(source.label),
  }
}

export function normalizeGrowthReviewReview(source = {}) {
  return {
    activityStartDate: normalizeText(source.activity_start_date ?? source.activityStartDate),
    campaignKey: normalizeText(source.campaign_key ?? source.campaignKey ?? source.campaign_value),
    createdAt: normalizeText(source.created_at ?? source.createdAt),
    id: normalizeText(source.id),
    isDefault: source.is_default === true || source.isDefault === true,
    name: normalizeText(source.name),
    pipelineId: normalizeText(source.pipeline_id ?? source.pipelineId),
    signals: normalizeArray(source.signals).map(normalizeGrowthReviewReviewSignal),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    status: normalizeText(source.status) || 'active',
    updatedAt: normalizeText(source.updated_at ?? source.updatedAt),
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
  }
}

function normalizeSourceConnection(source = {}) {
  return {
    externalAccountId: normalizeText(source.external_account_id ?? source.externalAccountId),
    id: normalizeText(source.id),
    provider: normalizeText(source.provider),
    status: normalizeText(source.status),
  }
}

function normalizePipelineStage(source = {}) {
  return {
    externalId: normalizeText(source.external_id ?? source.externalId),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    position: source.position ?? null,
  }
}

function normalizePipeline(source = {}) {
  return {
    externalId: normalizeText(source.external_id ?? source.externalId),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    stages: normalizeArray(source.stages).map(normalizePipelineStage),
  }
}

function normalizeStatus(source = {}) {
  return {
    label: normalizeText(source.label),
    value: normalizeText(source.value),
  }
}

export function normalizeGrowthReviewReviewsPayload(payload = {}) {
  return {
    defaultReviewId: normalizeText(payload.default_review_id ?? payload.defaultReviewId),
    reviews: normalizeArray(payload.reviews).map(normalizeGrowthReviewReview),
  }
}

export function normalizeGrowthReviewReviewOptionsPayload(payload = {}) {
  const options = payload.options ?? payload

  return {
    pipelines: normalizeArray(options.pipelines).map(normalizePipeline),
    sourceConnections: normalizeArray(options.source_connections ?? options.sourceConnections)
      .map(normalizeSourceConnection),
    statuses: normalizeArray(options.statuses).map(normalizeStatus),
  }
}

export function toGrowthReviewReviewInput(draft) {
  return {
    activity_start_date: normalizeText(draft.activityStartDate),
    campaign_key: normalizeText(draft.campaignKey),
    is_default: draft.isDefault === true,
    name: normalizeText(draft.name),
    pipeline_id: normalizeText(draft.pipelineId),
    source_connection_id: normalizeText(draft.sourceConnectionId),
    status: normalizeText(draft.status) || 'active',
  }
}
