import { AdminClinicJsonImportDialog } from '../../admin-clinic-import'

function createSummaryItems(importPlan) {
  const summary = importPlan?.summary

  if (!summary) {
    return []
  }

  return [
    { label: 'Reputation snapshots', value: summary.reputationSnapshotCount },
  ]
}

function createDetailItems(importPlan) {
  const periods = importPlan?.summary?.periods ?? []

  if (!importPlan) {
    return []
  }

  return [
    {
      label: 'Periods',
      value: periods.length ? periods.join(', ') : '',
    },
  ]
}

export function ClinicReputationImportDialog(props) {
  return (
    <AdminClinicJsonImportDialog
      {...props}
      description="Paste aggregate reputation and local presence data from Google Business Profile, review tools, or connector exports."
      detailItems={createDetailItems(props.importPlan)}
      emptyPreviewMessage="Preview the JSON to validate aggregate-only reputation records before applying them to the draft."
      safetyDescription="Import accepts review counts, rating, GBP updates, review response work, and provider profile completeness for the current clinic workspace only. Do not include reviewer names, patient names, emails, phones, appointment notes, or other PHI."
      safetyTitle="Aggregate-only reputation contract"
      summaryItems={createSummaryItems(props.importPlan)}
      textareaId="clinic-reputation-import-json"
      textareaLabel="Clinic reputation JSON *"
      title="Import clinic reputation JSON"
    />
  )
}
