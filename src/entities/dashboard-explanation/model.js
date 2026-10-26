function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeSource(value) {
  return Array.isArray(value) ? value.join(', ') : normalizeText(value)
}

export function normalizeDashboardExplanation(source = {}, explanationKey = '') {
  const value = isPlainObject(source) ? source : {}

  return {
    additionalNote: normalizeText(value.additional_note ?? value.additionalNote),
    calculationExplanation: normalizeText(
      value.calculation_explanation ?? value.calculationExplanation,
    ),
    dateField: normalizeText(value.date_field ?? value.dateField),
    definition: normalizeText(value.definition ?? value.description),
    explanationKey: normalizeText(
      value.explanation_key
      ?? value.explanationKey
      ?? value.chart_key
      ?? value.chartKey
      ?? explanationKey,
    ),
    isCustomized: value.is_customized === true || value.isCustomized === true,
    kind: normalizeText(value.kind) || 'chart',
    label: normalizeText(value.label),
    source: normalizeSource(value.source),
    updatedAt: normalizeText(value.updated_at ?? value.updatedAt),
    updatedBy: normalizeText(value.updated_by ?? value.updatedBy),
  }
}

export function normalizeDashboardExplanations(value = {}) {
  const source = isPlainObject(value) ? value : {}

  return Object.fromEntries(
    Object.entries(source).map(([explanationKey, explanation]) => [
      explanationKey,
      normalizeDashboardExplanation(explanation, explanationKey),
    ]),
  )
}
