import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listAdminClients } from '../../../domain/services/adminClientService'
import {
  deleteAdminReport,
  listAdminReports,
  saveAdminReport,
  updateAdminReportStatus,
} from '../../../domain/services/adminReportService'
import {
  EmptyReportsState,
  ReportModal,
  ReportsTable,
  ReportsTableSkeleton,
  useReportForm,
} from '../../../features/admin-reports'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function ReportModalController({
  clients,
  defaultClientId,
  mode,
  onClose,
  onSaved,
  report,
  runtime,
}) {
  const reportForm = useReportForm({
    clientId: defaultClientId,
    report,
    onSubmit: (form) => runtime.dataClient.write((repositories) => saveAdminReport({
      idGenerator: createUuid,
      input: form,
      repositories,
      viewer: runtime.viewer,
    })).then(onSaved),
  })

  return (
    <ReportModal
      clients={clients}
      error={reportForm.error}
      form={reportForm.form}
      isOpen
      mode={mode}
      onClose={onClose}
      onSubmit={reportForm.handleSubmit}
      onUpdateField={reportForm.updateField}
    />
  )
}

export function AdminReportsPage({ routeParams = {}, runtime }) {
  const [reportPendingEdit, setReportPendingEdit] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()
  const isCreateModalOpen = routeParams.newReport === 'true'
  const reportsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-reports`,
    initialData: {
      clients: [],
      reports: [],
    },
    load: () => runtime.dataClient.read((repositories) => ({
      clients: listAdminClients({
        repositories,
        viewer: runtime.viewer,
      }),
      reports: listAdminReports({
        repositories,
        viewer: runtime.viewer,
      }),
    })),
  })
  const clients = reportsResource.data?.clients ?? []
  const reports = reportsResource.data?.reports ?? []
  const defaultClientId = routeParams.clientId || clients[0]?.id || ''

  function reloadReports() {
    void reportsResource.reload()
  }

  function closeCreateModal() {
    navigate('/admin/reports', { replace: true })
  }

  function handleSaved(report) {
    reloadReports()
    toast.success('Report saved', `${report.title} is saved as ${report.statusMeta.label}.`)
    closeCreateModal()
    setReportPendingEdit(null)
  }

  if (reportsResource.status === 'loading') {
    return <ReportsTableSkeleton />
  }

  if (reportsResource.status === 'error') {
    return (
      <div className="rounded-block border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {reportsResource.error}
      </div>
    )
  }

  return (
    <>
      {reports.length > 0 ? (
        <ReportsTable
          onDeleteReport={(reportId) => {
            const deletedReport = reports.find((report) => report.id === reportId)

            void runtime.dataClient.write((repositories) => deleteAdminReport({
              reportId,
              repositories,
              viewer: runtime.viewer,
            })).then(() => {
              reloadReports()
              toast.success('Report deleted', `${deletedReport?.title ?? 'Report'} was removed.`)
            }).catch((caughtError) => {
              toast.error('Report was not deleted', caughtError.message)
            })
          }}
          onEditReport={setReportPendingEdit}
          onUpdateStatus={(reportId, status) => {
            void runtime.dataClient.write((repositories) => updateAdminReportStatus({
              reportId,
              repositories,
              status,
              viewer: runtime.viewer,
            })).then((report) => {
              reloadReports()
              toast.success('Report status updated', `${report.title} is now ${report.statusMeta.label}.`)
            }).catch((caughtError) => {
              toast.error('Status was not updated', caughtError.message)
            })
          }}
          reports={reports}
        />
      ) : (
        <EmptyReportsState hasClients={clients.length > 0} />
      )}

      {isCreateModalOpen ? (
        <ReportModalController
          clients={clients}
          defaultClientId={defaultClientId}
          mode="create"
          onClose={closeCreateModal}
          onSaved={handleSaved}
          runtime={runtime}
        />
      ) : null}

      {reportPendingEdit ? (
        <ReportModalController
          clients={clients}
          defaultClientId={reportPendingEdit.clientId}
          key={reportPendingEdit.id}
          mode="edit"
          onClose={() => setReportPendingEdit(null)}
          onSaved={handleSaved}
          report={reportPendingEdit}
          runtime={runtime}
        />
      ) : null}
    </>
  )
}
