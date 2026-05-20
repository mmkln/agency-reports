import { AdminClinicJsonImportDialog } from '../../admin-clinic-import'

function formatMetricValue(metric) {
  if (!metric) {
    return 'Not calculated'
  }

  return `${metric.value} | ${metric.status}`
}

function formatReadinessSummary(sourceReadiness = []) {
  if (!sourceReadiness.length) {
    return 'Not previewed'
  }

  const readyCount = sourceReadiness.filter((section) => section.status === 'ready').length

  return `${readyCount}/${sourceReadiness.length} ready`
}

function formatReadinessGaps(sourceReadiness = []) {
  const gaps = sourceReadiness
    .filter((section) => section.status !== 'ready')
    .map((section) => `${section.label}: ${section.status}`)

  return gaps.length ? gaps.join('; ') : 'All calculated sections have source data.'
}

export function AdminDentalGrowthReviewSourceDialog({
  importError,
  importPlan,
  isOpen,
  onApply,
  onClose,
  onPreview,
  onRawJsonChange,
  rawJson,
}) {
  const sourceBatch = importPlan?.sourceBatch
  const generatedPeriod = importPlan?.generatedPeriod
  const heroMetrics = generatedPeriod?.content?.hero_metrics ?? []
  const sourceReadiness = importPlan?.sourceReadiness ?? []

  return (
    <AdminClinicJsonImportDialog
      applyLabel="Generate draft"
      description="Paste normalized source data from JSON, webhook replay, or API export. The dashboard draft is calculated from this payload."
      detailItems={[
        { label: 'Source batch', value: sourceBatch?.id },
        { label: 'Generated draft', value: generatedPeriod?.title },
        { label: 'Period type', value: sourceBatch?.period_type },
        { label: 'Readiness gaps', value: formatReadinessGaps(sourceReadiness) },
      ]}
      emptyPreviewMessage="Preview source data to validate it and see the calculated dashboard draft before saving."
      importError={importError}
      importPlan={importPlan}
      isOpen={isOpen}
      onApply={onApply}
      onClose={onClose}
      onPreview={onPreview}
      onRawJsonChange={onRawJsonChange}
      rawJson={rawJson}
      safetyDescription="Source imports create a source batch and a generated draft only. Client users cannot see the draft until an admin explicitly publishes it."
      safetyTitle="Calculated draft from source data"
      summaryItems={[
        { label: 'Validation', value: importPlan?.isValid ? 'Valid' : 'Not previewed' },
        { label: 'Section readiness', value: formatReadinessSummary(sourceReadiness) },
        { label: 'Period', value: sourceBatch ? `${sourceBatch.period_start} to ${sourceBatch.period_end}` : 'None' },
        { label: 'Bookings', value: formatMetricValue(heroMetrics.find((metric) => metric.id === 'bookings')) },
        { label: 'Biggest leak', value: formatMetricValue(heroMetrics.find((metric) => metric.id === 'biggest-leak')) },
      ]}
      textareaId="dental-growth-source-json"
      textareaLabel="Dental Growth source JSON"
      title="Import Dental Growth source data"
    />
  )
}
