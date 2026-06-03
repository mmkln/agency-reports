function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeNullableText(value) {
  const text = normalizeText(value)
  return text || null
}

export const GROWTH_REVIEW_FUNNEL_CALCULATION_MODES = Object.freeze({
  CURRENT_STAGE_COUNT: 'current_stage_count',
  REACHED_STEP_COUNT: 'reached_step_count',
})

export function normalizeGrowthReviewSourceConnection(source = {}) {
  return {
    credential: {
      hasToken: source.credential?.has_token === true || source.credential?.hasToken === true,
      tokenLast4: normalizeText(source.credential?.token_last4 ?? source.credential?.tokenLast4),
    },
    externalAccountId: normalizeText(source.external_account_id ?? source.externalAccountId),
    id: normalizeText(source.id),
    provider: normalizeText(source.provider),
    status: normalizeText(source.status),
  }
}

export function normalizeGrowthReviewPipelineStage(source = {}) {
  return {
    externalId: normalizeText(source.external_id ?? source.externalId),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    position: source.position ?? null,
  }
}

export function normalizeGrowthReviewPipeline(source = {}) {
  return {
    externalId: normalizeText(source.external_id ?? source.externalId),
    id: normalizeText(source.id),
    name: normalizeText(source.name),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    stages: normalizeArray(source.stages).map(normalizeGrowthReviewPipelineStage),
  }
}

export function normalizeGrowthReviewFunnelStep(source = {}) {
  return {
    calculationMode: normalizeText(source.calculation_mode ?? source.calculationMode)
      || GROWTH_REVIEW_FUNNEL_CALCULATION_MODES.REACHED_STEP_COUNT,
    displayOrder: Number(source.display_order ?? source.displayOrder ?? 0),
    id: normalizeNullableText(source.id),
    isBookedStep: source.is_booked_step === true || source.isBookedStep === true,
    isVisible: source.is_visible !== false && source.isVisible !== false,
    key: normalizeText(source.key),
    label: normalizeText(source.label),
    stageIds: normalizeArray(source.stage_ids ?? source.stageIds).map(normalizeText).filter(Boolean),
  }
}

export function normalizeGrowthReviewSettings(source = {}) {
  if (!source) {
    return null
  }

  return {
    bookedStageId: normalizeText(source.booked_stage_id ?? source.bookedStageId),
    funnelPipelineId: normalizeText(source.funnel_pipeline_id ?? source.funnelPipelineId),
    funnelSteps: normalizeArray(source.funnel_steps ?? source.funnelSteps).map(normalizeGrowthReviewFunnelStep),
    id: normalizeText(source.id),
    sourceConnectionId: normalizeText(source.source_connection_id ?? source.sourceConnectionId),
    workspaceId: normalizeText(source.workspace_id ?? source.workspaceId),
  }
}

export function normalizeGrowthReviewSettingsPayload(payload = {}) {
  const options = payload.options ?? {}

  return {
    options: {
      pipelines: normalizeArray(options.pipelines).map(normalizeGrowthReviewPipeline),
      sourceConnections: normalizeArray(options.source_connections ?? options.sourceConnections)
        .map(normalizeGrowthReviewSourceConnection),
    },
    settings: normalizeGrowthReviewSettings(payload.settings),
  }
}

export function toGrowthReviewSettingsApiInput(draft) {
  return {
    booked_stage_id: draft.bookedStageId,
    funnel_pipeline_id: draft.funnelPipelineId,
    funnel_steps: normalizeArray(draft.funnelSteps).map((step, index) => ({
      calculation_mode: step.calculationMode,
      display_order: index,
      is_booked_step: step.isBookedStep === true,
      is_visible: step.isVisible !== false,
      key: step.key,
      label: step.label,
      stage_ids: normalizeArray(step.stageIds).filter(Boolean),
    })),
    source_connection_id: draft.sourceConnectionId,
  }
}
