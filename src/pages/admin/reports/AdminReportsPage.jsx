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
import {
  EmptyFilteredReportsState,
  EmptyReportsState,
  REPORT_FILTER_ALL,
  ReportModal,
  ReportsFilters,
  ReportsTable,
  ReportsTableSkeleton,
  useReportForm,
} from '../../../features/admin-reports'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

const initialFilters = Object.freeze({
  clientId: REPORT_FILTER_ALL,
  period: '',
  search: '',
  status: REPORT_FILTER_ALL,
})

const reportingMonthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
})

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function monthRange(monthValue) {
  if (!monthValue) {
    return null
  }

  const [year, month] = monthValue.split('-').map(Number)

  if (!year || !month) {
    return null
  }

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  return { end, start }
}

function formatReportingMonth(monthValue) {
  const [year, month] = String(monthValue ?? '').split('-').map(Number)

  if (!year || !month) {
    return monthValue
  }

  return reportingMonthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}

function toMonthValue(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function getReportMonthOptions(reports) {
  const months = new Set()

  reports.forEach((report) => {
    const reportStart = new Date(report.periodStart)
    const reportEnd = new Date(report.periodEnd)

    if (Number.isNaN(reportStart.getTime()) || Number.isNaN(reportEnd.getTime()) || reportStart > reportEnd) {
      return
    }

    const cursor = new Date(Date.UTC(reportStart.getUTCFullYear(), reportStart.getUTCMonth(), 1))
    const end = new Date(Date.UTC(reportEnd.getUTCFullYear(), reportEnd.getUTCMonth(), 1))

    while (cursor <= end) {
      months.add(toMonthValue(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
  })

  return [...months]
    .sort((leftMonth, rightMonth) => rightMonth.localeCompare(leftMonth))
    .map((month) => ({
      label: formatReportingMonth(month),
      value: month,
    }))
}

function reportOverlapsMonth(report, monthValue) {
  const range = monthRange(monthValue)

  if (!range) {
    return true
  }

  const reportStart = new Date(report.periodStart)
  const reportEnd = new Date(report.periodEnd)

  if (Number.isNaN(reportStart.getTime()) || Number.isNaN(reportEnd.getTime())) {
    return false
  }

  return reportStart <= range.end && reportEnd >= range.start
}

function filterReports(reports, filters) {
  const search = normalizeSearchValue(filters.search)

  return reports.filter((report) => {
    if (filters.clientId !== REPORT_FILTER_ALL && report.clientId !== filters.clientId) {
      return false
    }

    if (filters.status !== REPORT_FILTER_ALL && report.status !== filters.status) {
      return false
    }

    if (!reportOverlapsMonth(report, filters.period)) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      report.client.name,
      report.client.portalSlug,
      report.clientDecisionsNeeded,
      report.nextActions,
      report.problems,
      report.results,
      report.summary,
      report.title,
      report.whatWeDid,
      report.wins,
    ].some((value) => normalizeSearchValue(value).includes(search))
  })
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
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    clientId: routeParams.clientId || REPORT_FILTER_ALL,
  }))
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
    setFilters({
      ...initialFilters,
      clientId: routeParams.clientId || REPORT_FILTER_ALL,
    })
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
        <div className="grid gap-component">
          <ReportsFilters
            clients={clients}
            filters={filters}
            onReset={resetFilters}
            onUpdateFilter={updateFilter}
            reportingMonthOptions={reportingMonthOptions}
            resultCount={filteredReports.length}
            totalCount={reports.length}
          />

          {filteredReports.length > 0 ? (
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
              onDuplicateReport={(reportId) => {
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
              reports={filteredReports}
            />
          ) : (
            <EmptyFilteredReportsState onReset={resetFilters} />
          )}
        </div>
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
