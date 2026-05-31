function createDetailRow(label, value) {
  return { label, value }
}

function hasDisplayValue(value) {
  return value === 0 || String(value ?? '').trim() !== ''
}

function createDetailSection(id, title, rows) {
  const visibleRows = rows.filter((row) => hasDisplayValue(row.value))

  if (!visibleRows.length) {
    return null
  }

  return {
    id,
    rows: visibleRows,
    title,
  }
}

export function createGrowthReviewMetricDetailViewModel({
  formatMetricValue,
  getDeltaText,
  getStatusSummary,
  getTitle,
  metric,
}) {
  const deltaText = getDeltaText(metric)
  const comparisonSection = createDetailSection('period-comparison', 'Period comparison', [
    createDetailRow('Current period', formatMetricValue(metric)),
    createDetailRow('Previous period', metric.prior_period_value),
    createDetailRow('Change', deltaText),
  ])

  return {
    deltaText,
    sections: [comparisonSection].filter(Boolean),
    status: metric.status,
    statusSummary: getStatusSummary(metric),
    title: getTitle(metric),
    value: formatMetricValue(metric),
  }
}
