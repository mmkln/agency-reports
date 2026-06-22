import { CLINIC_COMPLIANCE_STATUS_META } from '../../../entities/clinic'
import { AdminClinicJsonImportDialog } from '../../admin-clinic-import'

function createSummaryItems(importPlan) {
  const summary = importPlan?.summary

  if (!summary) {
    return []
  }

  return [
    { label: 'Compliance reviews', value: summary.complianceReviewCount },
  ]
}

function createDetailItems(importPlan) {
  const summary = importPlan?.summary

  if (!summary) {
    return []
  }

  return [
    {
      label: 'Platforms',
      value: summary.platforms.length ? summary.platforms.join(', ') : '',
    },
    {
      label: 'Statuses',
      value: summary.statuses.length
        ? summary.statuses.map((status) => CLINIC_COMPLIANCE_STATUS_META[status]?.label ?? status).join(', ')
        : '',
    },
  ]
}

export function ClinicComplianceImportDialog(props) {
  return (
    <AdminClinicJsonImportDialog
      {...props}
      description="Paste aggregate compliance review data from policy checklists, privacy reviews, ad platforms, or connector exports."
      detailItems={createDetailItems(props.importPlan)}
      emptyPreviewMessage="Preview the JSON to validate aggregate-only compliance reviews before applying them to the draft."
      safetyDescription="Import accepts policy, claims, privacy, tracking, and ad-platform review summaries for the current clinic workspace only. Do not include patient identifiers, medical details, appointment notes, or other PHI."
      safetyTitle="Aggregate-only compliance contract"
      summaryItems={createSummaryItems(props.importPlan)}
      textareaId="clinic-compliance-import-json"
      textareaLabel="Clinic compliance JSON *"
      title="Import clinic compliance JSON"
    />
  )
}
