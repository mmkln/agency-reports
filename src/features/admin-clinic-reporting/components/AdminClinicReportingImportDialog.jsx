import { NativeSelect } from '@/shared/ui'

import { AdminClinicJsonImportDialog } from '../../admin-clinic-import'

function formatStatusLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function AdminClinicReportingImportDialog({
  importError,
  importLayer,
  importPlan,
  isOpen,
  layerOptions,
  onApply,
  onClose,
  onLayerChange,
  onPreview,
  onRawJsonChange,
  rawJson,
}) {
  const period = importPlan?.period
  const selectedLayer = layerOptions.find((layer) => layer.id === importLayer)
  const periodLabel = period?.period_label ?? period?.label
  const publishState = period?.publish_state
  const freshnessSource = period?.source_trust?.[0] ?? period?.data_sources?.[0]

  return (
    <AdminClinicJsonImportDialog
      description="Paste one normalized reporting record. Imports always save as draft."
      headerControl={(
        <label className="grid gap-2 text-ui text-text-primary">
          Reporting layer
          <NativeSelect
            aria-label="Reporting layer"
            onChange={(event) => onLayerChange(event.target.value)}
            value={importLayer}
          >
            {layerOptions.map((layer) => (
              <option key={layer.id} value={layer.id}>{layer.label}</option>
            ))}
          </NativeSelect>
        </label>
      )}
      detailItems={[
        { label: 'Layer', value: selectedLayer?.label ?? period?.layer },
        { label: 'Period', value: periodLabel },
        { label: 'Status after import', value: publishState },
      ]}
      emptyPreviewMessage="Preview JSON to validate the record before saving it as a draft."
      importError={importError}
      importPlan={importPlan}
      isOpen={isOpen}
      onApply={onApply}
      onClose={onClose}
      onPreview={onPreview}
      onRawJsonChange={onRawJsonChange}
      rawJson={rawJson}
      safetyDescription="Client-facing and Dental Growth Review imports reject patient-level fields. Layer 1 rows remain protected by service and route capabilities."
      safetyTitle="Draft-only import with visibility checks"
      summaryItems={[
        { label: 'Validation', value: importPlan?.isValid ? 'Valid' : 'Not previewed' },
        { label: 'Record', value: period?.title ?? 'None' },
        {
          label: 'Freshness',
          value: freshnessSource
            ? `${formatStatusLabel(freshnessSource.freshness_status)} | ${freshnessSource.last_updated_at || 'Not recorded'}`
            : 'Not recorded',
        },
      ]}
      textareaId="clinic-reporting-import-json"
      textareaLabel="Clinic reporting JSON"
      title="Import reporting JSON"
    />
  )
}
