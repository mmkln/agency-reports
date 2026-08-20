function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

export function normalizeGrowthReviewReviewSignal(source = {}) {
  return {
    confidence: normalizeText(source.confidence) || 'medium',
    entity: normalizeText(source.entity),
    expectedValues: normalizeArray(source.expected_values)
      .map(normalizeText)
      .filter(Boolean),
    fieldId: normalizeText(source.field_id),
    fieldKey: normalizeText(source.field_key),
    id: normalizeText(source.id),
    isActive: source.is_active !== false,
    key: normalizeText(source.key),
    label: normalizeText(source.label),
    priority: Number.isFinite(Number(source.priority)) ? Number(source.priority) : 0,
    source: normalizeText(source.source),
  }
}

export function normalizeGrowthReviewReview(source = {}) {
  const configuration = source.configuration ?? {}

  return {
    activityStartDate: normalizeText(source.activity_start_date ?? source.activityStartDate),
    allowedStatuses: normalizeArray(source.allowed_statuses ?? source.allowedStatuses)
      .map(normalizeText)
      .filter(Boolean),
    configuration: {
      configuredCount: Number(configuration.configured_count ?? configuration.configuredCount ?? 0),
      isComplete: configuration.is_complete === true || configuration.isComplete === true,
      missingKeys: normalizeArray(configuration.missing_keys ?? configuration.missingKeys)
        .map(normalizeText)
        .filter(Boolean),
      requiredCount: Number(configuration.required_count ?? configuration.requiredCount ?? 0),
    },
    externalCampaignKey: normalizeText(source.external_campaign_key),
    createdAt: normalizeText(source.created_at ?? source.createdAt),
    id: normalizeText(source.id),
    isDefault: source.is_default === true || source.isDefault === true,
    name: normalizeText(source.name),
    pipelineId: normalizeText(source.pipeline_id ?? source.pipelineId),
    sequenceActiveStageId: normalizeText(source.sequence_active_stage_id),
    signals: normalizeArray(source.signals).map(normalizeGrowthReviewReviewSignal),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    status: normalizeText(source.status) || 'draft',
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

function normalizeCustomField(source = {}) {
  return {
    dataType: normalizeText(source.data_type),
    entity: normalizeText(source.entity),
    fieldKey: normalizeText(source.field_key),
    id: normalizeText(source.id),
    label: normalizeText(source.label),
    sourceConnectionId: normalizeText(source.source_connection_id),
  }
}

function normalizeTag(source = {}) {
  return {
    label: normalizeText(source.label),
    sourceConnectionId: normalizeText(source.source_connection_id),
    value: normalizeText(source.value),
  }
}

function normalizeSignalKey(source = {}) {
  return {
    label: normalizeText(source.label),
    required: source.required === true,
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
    customFields: normalizeArray(options.custom_fields).map(normalizeCustomField),
    pipelines: normalizeArray(options.pipelines).map(normalizePipeline),
    signalKeys: normalizeArray(options.signal_keys).map(normalizeSignalKey),
    sourceConnections: normalizeArray(options.source_connections ?? options.sourceConnections)
      .map(normalizeSourceConnection),
    statuses: normalizeArray(options.statuses).map(normalizeStatus),
    tags: normalizeArray(options.tags).map(normalizeTag),
  }
}

function toGrowthReviewSignalInput(signal) {
  return {
    confidence: normalizeText(signal.confidence) || 'medium',
    entity: normalizeText(signal.entity),
    expected_values: normalizeArray(signal.expectedValues).map(normalizeText).filter(Boolean),
    field_id: normalizeText(signal.fieldId),
    field_key: normalizeText(signal.fieldKey),
    is_active: signal.isActive !== false,
    key: normalizeText(signal.key),
    label: normalizeText(signal.label),
    priority: Number.isFinite(Number(signal.priority)) ? Number(signal.priority) : 0,
    source: normalizeText(signal.source),
  }
}

export function toGrowthReviewReviewInput(draft) {
  return {
    activity_start_date: normalizeText(draft.activityStartDate),
    external_campaign_key: normalizeText(draft.externalCampaignKey),
    is_default: draft.isDefault === true,
    name: normalizeText(draft.name),
    pipeline_id: normalizeText(draft.pipelineId),
    sequence_active_stage_id: normalizeText(draft.sequenceActiveStageId),
    signals: normalizeArray(draft.signals).map(toGrowthReviewSignalInput),
    source_connection_id: normalizeText(draft.sourceConnectionId),
    status: normalizeText(draft.status) || 'draft',
  }
}

export function toGrowthReviewReviewValidationInput(draft, reviewId = '') {
  return {
    ...toGrowthReviewReviewInput(draft),
    review_id: normalizeText(reviewId),
  }
}

export function normalizeGrowthReviewReviewValidation(payload = {}) {
  const validation = payload.validation ?? payload
  return {
    sequenceActiveStage: {
      id: normalizeText(validation.sequence_active_stage?.id),
      label: normalizeText(validation.sequence_active_stage?.label),
      matchCount: Number(validation.sequence_active_stage?.match_count ?? 0),
    },
    signals: normalizeArray(validation.signals).map((signal) => ({
      key: normalizeText(signal.key),
      matchCount: Number(signal.match_count ?? 0),
    })),
    valid: validation.valid === true,
  }
}
