import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listAdminClients } from '../../../domain/services/adminClientService'
import {
  duplicateAdminPerformanceDashboardPeriod,
  importAdminPerformanceDashboardJson,
  listAdminPerformanceDashboardPeriods,
  saveAdminPerformanceDashboardPeriod,
  updateAdminPerformanceDashboardPeriodStatus,
} from '../../../domain/services/adminPerformanceDashboardService'
import {
  EmptyPerformanceDashboardsState,
  PerformanceDashboardJsonImportModal,
  PerformanceDashboardPeriodModal,
  PerformanceDashboardsTable,
  PerformanceDashboardsTableSkeleton,
  usePerformanceDashboardPeriodForm,
} from '../../../features/admin-performance-dashboards'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function PerformanceDashboardModalController({
  clients,
  defaultClientId,
  mode,
  onClose,
  onSaved,
  period,
  runtime,
}) {
  const formState = usePerformanceDashboardPeriodForm({
    clientId: defaultClientId,
    period,
    onSubmit: (form) => runtime.dataClient.write((repositories) => saveAdminPerformanceDashboardPeriod({
      idGenerator: createUuid,
      input: form,
      repositories,
      viewer: runtime.viewer,
    })).then(onSaved),
  })

  return (
    <PerformanceDashboardPeriodModal
      clients={clients}
      error={formState.error}
      form={formState.form}
      isOpen
      mode={mode}
      onClose={onClose}
      onSubmit={formState.handleSubmit}
      onUpdateField={formState.updateField}
    />
  )
}

export function AdminPerformanceDashboardsPage({ routeParams = {}, runtime }) {
  const [importResult, setImportResult] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()
  const isCreateModalOpen = routeParams.newPerformanceDashboard === 'true'
  const isImportModalOpen = routeParams.importPerformanceDashboard === 'true'
  const dashboardsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-performance-dashboards`,
    initialData: {
      clients: [],
      periods: [],
    },
    load: () => runtime.dataClient.read((repositories) => ({
      clients: listAdminClients({
        repositories,
        viewer: runtime.viewer,
      }),
      periods: listAdminPerformanceDashboardPeriods({
        repositories,
        viewer: runtime.viewer,
      }),
    })),
  })
  const clients = dashboardsResource.data?.clients ?? []
  const periods = dashboardsResource.data?.periods ?? []
  const visiblePeriods = routeParams.clientId
    ? periods.filter((period) => period.clientId === routeParams.clientId)
    : periods
  const defaultClientId = routeParams.clientId || clients[0]?.id || ''

  function reloadDashboards() {
    void dashboardsResource.reload()
  }

  function closeCreateModal() {
    navigate(
      routeParams.clientId
        ? `/admin/performance-dashboards?clientId=${routeParams.clientId}`
        : '/admin/performance-dashboards',
      { replace: true },
    )
  }

  function closeImportModal() {
    setImportResult(null)
    navigate(
      routeParams.clientId
        ? `/admin/performance-dashboards?clientId=${routeParams.clientId}`
        : '/admin/performance-dashboards',
      { replace: true },
    )
  }

  function handleSaved(period) {
    reloadDashboards()
    toast.success('Performance dashboard saved', `${period.title} is saved as ${period.statusMeta.label}.`)
    navigate(`/admin/performance-dashboard-editor?periodId=${period.id}`)
  }

  if (dashboardsResource.status === 'loading') {
    return <PerformanceDashboardsTableSkeleton />
  }

  if (dashboardsResource.status === 'error') {
    return (
      <div className="rounded-block border border-destructive/20 bg-destructive/10 px-4 py-3 text-ui text-destructive">
        {dashboardsResource.error}
      </div>
    )
  }

  return (
    <>
      {visiblePeriods.length > 0 ? (
        <PerformanceDashboardsTable
          onDuplicatePeriod={(periodId) => {
            void runtime.dataClient.write((repositories) => duplicateAdminPerformanceDashboardPeriod({
              idGenerator: createUuid,
              periodId,
              repositories,
              viewer: runtime.viewer,
            })).then((period) => {
              reloadDashboards()
              navigate(`/admin/performance-dashboard-editor?periodId=${period.id}`)
              toast.success('Dashboard duplicated', `${period.title} was created as a draft.`)
            }).catch((caughtError) => {
              toast.error('Dashboard was not duplicated', caughtError.message)
            })
          }}
          onEditPeriod={(period) => navigate(`/admin/performance-dashboard-editor?periodId=${period.id}`)}
          onUpdateStatus={(periodId, status) => {
            void runtime.dataClient.write((repositories) => updateAdminPerformanceDashboardPeriodStatus({
              periodId,
              repositories,
              status,
              viewer: runtime.viewer,
            })).then((period) => {
              reloadDashboards()
              toast.success('Dashboard status updated', `${period.title} is now ${period.statusMeta.label}.`)
            }).catch((caughtError) => {
              toast.error('Status was not updated', caughtError.message)
            })
          }}
          periods={visiblePeriods}
        />
      ) : (
        <EmptyPerformanceDashboardsState hasClients={clients.length > 0} />
      )}

      {isCreateModalOpen ? (
        <PerformanceDashboardModalController
          clients={clients}
          defaultClientId={defaultClientId}
          mode="create"
          onClose={closeCreateModal}
          onSaved={handleSaved}
          runtime={runtime}
        />
      ) : null}

      {isImportModalOpen ? (
        <PerformanceDashboardJsonImportModal
          clients={clients}
          defaultClientId={defaultClientId}
          importResult={importResult}
          isOpen
          onClose={closeImportModal}
          onSubmit={({ clientId, rawJson }) => {
            const result = runtime.dataClient.write((repositories) => importAdminPerformanceDashboardJson({
              idGenerator: createUuid,
              input: {
                clientId,
              },
              rawJson,
              repositories,
              viewer: runtime.viewer,
            }))

            Promise.resolve(result).then((importedResult) => {
              setImportResult(importedResult)

              if (!importedResult.isValid || !importedResult.period) {
                toast.error('Import failed', 'Fix the validation errors and try again.')
                return
              }

              reloadDashboards()
              closeImportModal()
              navigate(`/admin/performance-dashboard-editor?periodId=${importedResult.period.id}`)

              if (importedResult.warnings?.length) {
                toast.warning('Dashboard imported with warnings', 'Review warnings before publishing.')
              } else {
                toast.success('Dashboard imported', `${importedResult.period.title} was created as a draft.`)
              }
            }).catch((caughtError) => {
              toast.error('Import failed', caughtError.message)
            })
          }}
        />
      ) : null}

    </>
  )
}
