import { ErrorBlock } from '@/shared/ui'

import { useAdminReportsWorkspace, useReportForm } from '../model'
import { EmptyFilteredReportsState, EmptyReportsState } from './EmptyReportsState'
import { ReportModal } from './ReportModal'
import { ReportsFilters } from './ReportsFilters'
import { ReportsTable } from './ReportsTable'
import { ReportsTableSkeleton } from './ReportsTableSkeleton'

function ReportModalController({
  clients,
  defaultClientId,
  onGenerateClinicTemplate,
  mode,
  onClose,
  onSaved,
  onSubmitReport,
  report,
}) {
  const reportForm = useReportForm({
    clientId: defaultClientId,
    report,
    onSubmit: (form) => onSubmitReport(form).then(onSaved),
  })

  function applyClinicTemplate(clientId) {
    return onGenerateClinicTemplate(clientId)
      .then(reportForm.applyTemplate)
      .catch((caughtError) => {
        reportForm.setError(caughtError.message)
      })
  }

  return (
    <ReportModal
      clients={clients}
      error={reportForm.error}
      form={reportForm.form}
      isOpen
      mode={mode}
      onClose={onClose}
      onApplyClinicTemplate={applyClinicTemplate}
      onSubmit={reportForm.handleSubmit}
      onUpdateField={reportForm.updateField}
    />
  )
}

export function AdminReportsWorkspace({ routeParams = {}, runtime }) {
  const workspace = useAdminReportsWorkspace({ routeParams, runtime })

  if (workspace.status === 'loading') {
    return <ReportsTableSkeleton />
  }

  if (workspace.status === 'error') {
    return (
      <ErrorBlock title="Reports could not be loaded">
        {workspace.error}
      </ErrorBlock>
    )
  }

  return (
    <>
      {workspace.reports.length > 0 ? (
        <div className="grid gap-component">
          <ReportsFilters
            clients={workspace.clients}
            filters={workspace.filters}
            onReset={workspace.resetFilters}
            onUpdateFilter={workspace.updateFilter}
            reportingMonthOptions={workspace.reportingMonthOptions}
            resultCount={workspace.filteredReports.length}
            totalCount={workspace.reports.length}
          />

          {workspace.filteredReports.length > 0 ? (
            <ReportsTable
              onDeleteReport={workspace.deleteReport}
              onDuplicateReport={workspace.duplicateReport}
              onEditReport={workspace.setReportPendingEdit}
              onUpdateStatus={workspace.updateReportStatus}
              reports={workspace.filteredReports}
            />
          ) : (
            <EmptyFilteredReportsState onReset={workspace.resetFilters} />
          )}
        </div>
      ) : (
        <EmptyReportsState hasClients={workspace.clients.length > 0} />
      )}

      {workspace.isCreateModalOpen ? (
        <ReportModalController
          clients={workspace.clients}
          defaultClientId={workspace.defaultClientId}
          mode="create"
          onClose={workspace.closeCreateModal}
          onGenerateClinicTemplate={workspace.generateClinicReportTemplate}
          onSaved={workspace.handleSaved}
          onSubmitReport={workspace.saveReport}
        />
      ) : null}

      {workspace.reportPendingEdit ? (
        <ReportModalController
          clients={workspace.clients}
          defaultClientId={workspace.reportPendingEdit.clientId}
          key={workspace.reportPendingEdit.id}
          mode="edit"
          onClose={() => workspace.setReportPendingEdit(null)}
          onGenerateClinicTemplate={workspace.generateClinicReportTemplate}
          onSaved={workspace.handleSaved}
          onSubmitReport={workspace.saveReport}
          report={workspace.reportPendingEdit}
        />
      ) : null}
    </>
  )
}
