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
    sequenceTagOptions: Array.isArray(settings.sequence_tag_options)
      ? settings.sequence_tag_options
      : [],
    sections: normalizeVisibilityItems(settings.sections),
    sourceConnection: settings.source_connection
      ? {
          externalAccountId: settings.source_connection.external_account_id ?? '',
          id: settings.source_connection.id ?? '',
          provider: settings.source_connection.provider ?? '',
          status: settings.source_connection.status ?? '',
        }
      : null,
    stageAssignments: stageAssignmentsFromGroups(settings.lifecycle_stage_ids),
  }
}

export function hiddenIdsFromVisibility(items = []) {
  return items.filter((item) => !item.isVisible).map((item) => item.id)
}
