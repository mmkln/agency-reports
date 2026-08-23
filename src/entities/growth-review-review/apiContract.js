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

function normalizeGrowthReviewTrackSignal(source = {}) {
  return {
    entity: normalizeText(source.entity),
    expectedValues: normalizeArray(source.expected_values).map(normalizeText).filter(Boolean),
    fieldId: normalizeText(source.field_id),
    fieldKey: normalizeText(source.field_key),
    id: normalizeText(source.id),
    isActive: source.is_active !== false,
    priority: Number.isFinite(Number(source.priority)) ? Number(source.priority) : 0,
    source: normalizeText(source.source),
  }
}

function normalizeGrowthReviewTrack(source = {}) {
  return {
    id: normalizeText(source.id),
    isActive: source.is_active !== false,
    key: normalizeText(source.key),
    label: normalizeText(source.label),
    priority: Number.isFinite(Number(source.priority)) ? Number(source.priority) : 0,
    signals: normalizeArray(source.signals).map(normalizeGrowthReviewTrackSignal),
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
      trackCount: Number(configuration.track_count ?? configuration.trackCount ?? 0),
      tracksConfigured: configuration.tracks_configured === true || configuration.tracksConfigured === true,
      touchSourceConfigured: configuration.touch_source_configured === true
        || configuration.touchSourceConfigured === true,
    },
    externalCampaignKey: normalizeText(source.external_campaign_key),
    createdAt: normalizeText(source.created_at ?? source.createdAt),
    id: normalizeText(source.id),
    isDefault: source.is_default === true || source.isDefault === true,
    name: normalizeText(source.name),
    pipelineId: normalizeText(source.pipeline_id ?? source.pipelineId),
    signals: normalizeArray(source.signals).map(normalizeGrowthReviewReviewSignal),
    tracks: normalizeArray(source.tracks).map(normalizeGrowthReviewTrack),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    status: normalizeText(source.status) || 'draft',
    touchCampaignKey: normalizeText(source.touch_campaign_key ?? source.touchCampaignKey),
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
    externalId: normalizeText(source.external_id ?? source.externalId),
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

function toGrowthReviewTrackSignalInput(signal) {
  return {
    entity: normalizeText(signal.entity),
    expected_values: normalizeArray(signal.expectedValues).map(normalizeText).filter(Boolean),
    field_id: normalizeText(signal.fieldId),
    field_key: normalizeText(signal.fieldKey),
    is_active: signal.isActive !== false,
    priority: Number.isFinite(Number(signal.priority)) ? Number(signal.priority) : 0,
    source: normalizeText(signal.source),
  }
}

function toGrowthReviewTrackInput(track) {
  return {
    is_active: track.isActive !== false,
    key: normalizeText(track.key),
    label: normalizeText(track.label),
    priority: Number.isFinite(Number(track.priority)) ? Number(track.priority) : 0,
    signals: normalizeArray(track.signals).map(toGrowthReviewTrackSignalInput),
  }
}

export function toGrowthReviewReviewInput(draft) {
  return {
    activity_start_date: normalizeText(draft.activityStartDate),
    external_campaign_key: normalizeText(draft.externalCampaignKey),
    is_default: draft.isDefault === true,
    name: normalizeText(draft.name),
    pipeline_id: normalizeText(draft.pipelineId),
    signals: normalizeArray(draft.signals).map(toGrowthReviewSignalInput),
    tracks: normalizeArray(draft.tracks).map(toGrowthReviewTrackInput),
    source_connection_id: normalizeText(draft.sourceConnectionId),
    status: normalizeText(draft.status) || 'draft',
    touch_campaign_key: normalizeText(draft.touchCampaignKey),
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
    signals: normalizeArray(validation.signals).map((signal) => ({
      key: normalizeText(signal.key),
      matchCount: Number(signal.match_count ?? 0),
    })),
    tracks: {
      cohortCount: Number(validation.tracks?.cohort_count ?? 0),
      conflictCount: Number(validation.tracks?.conflict_count ?? 0),
      items: normalizeArray(validation.tracks?.items).map((track) => ({
        key: normalizeText(track.key),
        label: normalizeText(track.label),
        matchCount: Number(track.match_count ?? 0),
      })),
      unassignedCount: Number(validation.tracks?.unassigned_count ?? 0),
    },
    valid: validation.valid === true,
  }
}

export function normalizeGrowthReviewReviewValidationIssues(payload = {}) {
  return normalizeArray(payload.issues).map((issue) => ({
    code: normalizeText(issue.code),
    message: normalizeText(issue.message),
    meta: issue.meta && typeof issue.meta === 'object' && !Array.isArray(issue.meta)
      ? issue.meta
      : {},
    path: normalizeText(issue.path),
  })).filter((issue) => issue.path && issue.message)
}
