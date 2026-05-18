import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listAdminClients } from '../../../domain/services/adminClientService'
import {
  deleteAdminReport,
  duplicateAdminReport,
  listAdminReports,
  saveAdminReport,
  updateAdminReportStatus,
} from '../../../domain/services/adminReportService'
import { buildClinicReportDraftFromClientData } from '../../../domain/services/clinicReportTemplateService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import { createInitialReportFilters, filterReports, getReportMonthOptions } from './reportFilters'

function createUuid() {
  return crypto.randomUUID()
}

export function useAdminReportsWorkspace({ routeParams = {}, runtime }) {
  const [reportPendingEdit, setReportPendingEdit] = useState(null)
  const [filters, setFilters] = useState(() => createInitialReportFilters(routeParams.clientId))
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
  const reportingMonthOptions = getReportMonthOptions(reports)
  const filteredReports = filterReports(reports, filters)
  const defaultClientId = routeParams.clientId || clients[0]?.id || ''

  function updateFilter(filterName, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }))
  }

  function resetFilters() {
    setFilters(createInitialReportFilters(routeParams.clientId))
  }

  function reloadReports() {
    void reportsResource.reload()
  }

  function closeCreateModal() {
    navigate(routeParams.clientId ? `/admin/reports?clientId=${routeParams.clientId}` : '/admin/reports', { replace: true })
  }

  function handleSaved(report) {
    reloadReports()
    toast.success('Report saved', `${report.title} is saved as ${report.statusMeta.label}.`)
    closeCreateModal()
    setReportPendingEdit(null)
  }

  function saveReport(form) {
    return runtime.dataClient.write((repositories) => saveAdminReport({
      idGenerator: createUuid,
      input: form,
      repositories,
      viewer: runtime.viewer,
    }))
  }

  function generateClinicReportTemplate(clientId) {
    return runtime.dataClient.read((repositories) => buildClinicReportDraftFromClientData({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
  }

  function deleteReport(reportId) {
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
  }

  function duplicateReport(reportId) {
    void runtime.dataClient.write((repositories) => duplicateAdminReport({
      idGenerator: createUuid,
      reportId,
      repositories,
      viewer: runtime.viewer,
    })).then((report) => {
      reloadReports()
      setReportPendingEdit(report)
      toast.success('Report duplicated', `${report.title} was created as a draft.`)
    }).catch((caughtError) => {
      toast.error('Report was not duplicated', caughtError.message)
    })
  }

  function updateReportStatus(reportId, status) {
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
  }

  return {
    clients,
    closeCreateModal,
    defaultClientId,
    deleteReport,
    duplicateReport,
    error: reportsResource.error,
    filteredReports,
    filters,
    generateClinicReportTemplate,
    handleSaved,
    isCreateModalOpen,
    reportPendingEdit,
    reportingMonthOptions,
    reports,
    resetFilters,
    saveReport,
    setReportPendingEdit,
    status: reportsResource.status,
    updateFilter,
    updateReportStatus,
  }
}
