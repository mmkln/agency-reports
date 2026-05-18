import { AdminClinicJsonImportDialog } from '../../admin-clinic-import'

function createSummaryItems(importPlan) {
  const summary = importPlan?.summary

  if (!summary) {
    return []
  }

  return [
    { label: 'Patient acquisition', value: summary.patientAcquisitionCount },
    { label: 'Calls & bookings', value: summary.callBookingCount },
    { label: 'Service lines', value: summary.serviceLinePerformanceCount },
  ]
}

function createDetailItems(importPlan) {
  const summary = importPlan?.summary

  if (!summary) {
    return []
  }

  return [
    {
      label: 'Periods',
      value: summary.periods.length ? summary.periods.join(', ') : '',
    },
    {
      label: 'Campaigns',
      value: summary.campaignNames.length ? summary.campaignNames.join(', ') : '',
    },
  ]
}

export function ClinicMetricsImportDialog(props) {
  return (
    <AdminClinicJsonImportDialog
      {...props}
      description="Paste aggregate clinic metrics from call tracking, spreadsheets, or connector exports. Patient-level identifiers are blocked by the import contract."
      detailItems={createDetailItems(props.importPlan)}
      emptyPreviewMessage="Preview the JSON to validate aggregate-only clinic metrics before applying them to the draft."
      safetyDescription="Import accepts patient acquisition, calls/bookings, and service-line performance records for the current clinic workspace only. Do not include names, phones, emails, appointment notes, diagnoses, or other PHI."
      safetyTitle="Aggregate-only clinic contract"
      summaryItems={createSummaryItems(props.importPlan)}
      textareaId="clinic-metrics-import-json"
      textareaLabel="Clinic metrics JSON *"
      title="Import clinic metrics JSON"
    />
  )
}
