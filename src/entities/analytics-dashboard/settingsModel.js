export const LIFECYCLE_STATUS_OPTIONS = [
  { key: 'booked', label: 'Booked' },
  { key: 'active_nurture', label: 'Active nurture' },
  { key: 'long_term_nurture', label: 'Long-term nurture' },
  { key: 'closed_out', label: 'Closed out' },
]

export function stageAssignmentsFromGroups(groups = {}) {
  return Object.fromEntries(
    LIFECYCLE_STATUS_OPTIONS.flatMap(({ key }) => (
      Array.isArray(groups[key])
        ? groups[key].map((stageId) => [stageId, key])
        : []
    )),
  )
}

export function lifecycleGroupsFromAssignments(assignments = {}) {
  const groups = Object.fromEntries(
    LIFECYCLE_STATUS_OPTIONS.map(({ key }) => [key, []]),
  )
  Object.entries(assignments).forEach(([stageId, statusKey]) => {
    if (groups[statusKey]) groups[statusKey].push(stageId)
  })
  return groups
}

function normalizeVisibilityItems(items) {
  return Array.isArray(items)
    ? items.filter((item) => item?.id || item?.key).map((item) => ({
        id: item.id ?? item.key,
        isVisible: item.is_visible !== false,
        label: item.label ?? item.id ?? item.key,
      }))
    : []
}

export function normalizeAnalyticsDashboardSettings(settings = {}) {
  return {
    dashboardKey: settings.dashboard_key ?? '',
    definitionKey: settings.definition_key ?? '',
    overviewMetrics: normalizeVisibilityItems(settings.overview_metrics),
    pipelineIds: Array.isArray(settings.pipeline_ids) ? settings.pipeline_ids : [],
    pipelineOptions: Array.isArray(settings.pipeline_options) ? settings.pipeline_options : [],
    sequenceActiveTagNames: Array.isArray(settings.sequence_active_tag_names)
      ? settings.sequence_active_tag_names
      : [],
    sections: normalizeVisibilityItems(settings.sections),
    sourceMappings: Array.isArray(settings.source_mappings)
      ? settings.source_mappings.map((mapping) => ({
          detail: mapping.detail ?? '',
          key: mapping.key ?? '',
          label: mapping.label ?? mapping.key ?? '',
          priority: mapping.priority ?? 0,
          tagNames: Array.isArray(mapping.tag_names) ? mapping.tag_names : [],
        }))
      : [],
    sourceConnection: settings.source_connection
      ? {
          externalAccountId: settings.source_connection.external_account_id ?? '',
          id: settings.source_connection.id ?? '',
          provider: settings.source_connection.provider ?? '',
          status: settings.source_connection.status ?? '',
        }
      : null,
    stageAssignments: stageAssignmentsFromGroups(settings.lifecycle_stage_ids),
    tagOptions: Array.isArray(settings.tag_options)
      ? settings.tag_options
      : Array.isArray(settings.sequence_tag_options)
        ? settings.sequence_tag_options
        : [],
  }
}

export function hiddenIdsFromVisibility(items = []) {
  return items.filter((item) => !item.isVisible).map((item) => item.id)
}

function normalizedStringList(values = []) {
  return [...values].map(String).sort((left, right) => left.localeCompare(right))
}

function displayPatchFromSettings(settings) {
  return {
    hidden_metric_keys: normalizedStringList(hiddenIdsFromVisibility(settings.overviewMetrics)),
    hidden_widget_ids: normalizedStringList(hiddenIdsFromVisibility(settings.sections)),
  }
}

function calculationPatchFromSettings(settings) {
  const lifecycleStageIds = lifecycleGroupsFromAssignments(settings.stageAssignments)
  return {
    lifecycle_stage_ids: Object.fromEntries(
      Object.entries(lifecycleStageIds).map(([key, values]) => [key, normalizedStringList(values)]),
    ),
    pipeline_ids: normalizedStringList(settings.pipelineIds),
    sequence_active_tag_names: normalizedStringList(settings.sequenceActiveTagNames),
    source_mappings: settings.sourceMappings
      .map(({ key, tagNames }) => ({
        key,
        tag_names: normalizedStringList(tagNames),
      }))
      .sort((left, right) => left.key.localeCompare(right.key)),
  }
}

export function buildAnalyticsDashboardSettingsPatch(initialSettings, currentSettings) {
  const initialDisplay = displayPatchFromSettings(initialSettings)
  const currentDisplay = displayPatchFromSettings(currentSettings)
  const initialCalculation = calculationPatchFromSettings(initialSettings)
  const currentCalculation = calculationPatchFromSettings(currentSettings)
  const patch = {}

  if (JSON.stringify(initialDisplay) !== JSON.stringify(currentDisplay)) {
    patch.display = currentDisplay
  }
  if (JSON.stringify(initialCalculation) !== JSON.stringify(currentCalculation)) {
    patch.calculation = currentCalculation
  }
  return patch
}
