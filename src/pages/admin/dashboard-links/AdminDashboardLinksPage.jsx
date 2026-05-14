import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { listAdminClients } from '../../../domain/services/adminClientService'
import {
  deleteAdminDashboardLink,
  listAdminDashboardLinks,
  saveAdminDashboardLink,
  updateAdminDashboardLinkStatus,
} from '../../../domain/services/dashboardLinkService'
import {
  DashboardLinkModal,
  DashboardLinksTable,
  DashboardLinksTableSkeleton,
  EmptyDashboardLinksState,
  useDashboardLinkForm,
} from '../../../features/admin-dashboard-links'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function DashboardLinkModalController({
  clients,
  dashboardLink,
  defaultClientId,
  mode,
  onClose,
  onSaved,
  runtime,
}) {
  const dashboardLinkForm = useDashboardLinkForm({
    clientId: defaultClientId,
    dashboardLink,
    onSubmit: (form) => runtime.dataClient.write((repositories) => saveAdminDashboardLink({
      idGenerator: createUuid,
      input: form,
      repositories,
      viewer: runtime.viewer,
    })).then(onSaved),
  })

  return (
    <DashboardLinkModal
      clients={clients}
      error={dashboardLinkForm.error}
      form={dashboardLinkForm.form}
      isOpen
      mode={mode}
      onClose={onClose}
      onSubmit={dashboardLinkForm.handleSubmit}
      onUpdateField={dashboardLinkForm.updateField}
    />
  )
}

export function AdminDashboardLinksPage({ routeParams = {}, runtime }) {
  const [dashboardLinkPendingEdit, setDashboardLinkPendingEdit] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()
  const isCreateModalOpen = routeParams.newDashboard === 'true'
  const dashboardLinksResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-dashboard-links`,
    initialData: {
      clients: [],
      dashboardLinks: [],
    },
    load: () => runtime.dataClient.read((repositories) => ({
      clients: listAdminClients({
        repositories,
        viewer: runtime.viewer,
      }),
      dashboardLinks: listAdminDashboardLinks({
        repositories,
        viewer: runtime.viewer,
      }),
    })),
  })
  const clients = dashboardLinksResource.data?.clients ?? []
  const dashboardLinks = dashboardLinksResource.data?.dashboardLinks ?? []
  const visibleDashboardLinks = routeParams.clientId
    ? dashboardLinks.filter((dashboardLink) => dashboardLink.clientId === routeParams.clientId)
    : dashboardLinks
  const defaultClientId = routeParams.clientId || clients[0]?.id || ''

  function reloadDashboardLinks() {
    void dashboardLinksResource.reload()
  }

  function closeCreateModal() {
    navigate(routeParams.clientId ? `/admin/dashboard-links?clientId=${routeParams.clientId}` : '/admin/dashboard-links', { replace: true })
  }

  function handleSaved(dashboardLink) {
    reloadDashboardLinks()
    toast.success('Dashboard saved', `${dashboardLink.name} is ready in dashboard links.`)
    closeCreateModal()
    setDashboardLinkPendingEdit(null)
  }

  if (dashboardLinksResource.status === 'loading') {
    return <DashboardLinksTableSkeleton />
  }

  if (dashboardLinksResource.status === 'error') {
    return (
      <div className="rounded-block border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {dashboardLinksResource.error}
      </div>
    )
  }

  return (
    <>
      {visibleDashboardLinks.length > 0 ? (
        <DashboardLinksTable
          dashboardLinks={visibleDashboardLinks}
          onDeleteDashboardLink={(dashboardLinkId) => {
            const deletedDashboard = dashboardLinks.find((dashboardLink) => dashboardLink.id === dashboardLinkId)

            void runtime.dataClient.write((repositories) => deleteAdminDashboardLink({
              dashboardLinkId,
              repositories,
              viewer: runtime.viewer,
            })).then(() => {
              reloadDashboardLinks()
              toast.success('Dashboard deleted', `${deletedDashboard?.name ?? 'Dashboard'} was removed.`)
            }).catch((caughtError) => {
              toast.error('Dashboard was not deleted', caughtError.message)
            })
          }}
          onEditDashboardLink={setDashboardLinkPendingEdit}
          onUpdateStatus={(dashboardLinkId, status) => {
            void runtime.dataClient.write((repositories) => updateAdminDashboardLinkStatus({
              dashboardLinkId,
              repositories,
              status,
              viewer: runtime.viewer,
            })).then((dashboardLink) => {
              reloadDashboardLinks()
              toast.success('Dashboard status updated', `${dashboardLink.name} is now ${dashboardLink.statusMeta.label}.`)
            }).catch((caughtError) => {
              toast.error('Status was not updated', caughtError.message)
            })
          }}
        />
      ) : (
        <EmptyDashboardLinksState hasClients={clients.length > 0} />
      )}

      {isCreateModalOpen ? (
        <DashboardLinkModalController
          clients={clients}
          defaultClientId={defaultClientId}
          mode="create"
          onClose={closeCreateModal}
          onSaved={handleSaved}
          runtime={runtime}
        />
      ) : null}

      {dashboardLinkPendingEdit ? (
        <DashboardLinkModalController
          clients={clients}
          dashboardLink={dashboardLinkPendingEdit}
          defaultClientId={dashboardLinkPendingEdit.clientId}
          key={dashboardLinkPendingEdit.id}
          mode="edit"
          onClose={() => setDashboardLinkPendingEdit(null)}
          onSaved={handleSaved}
          runtime={runtime}
        />
      ) : null}
    </>
  )
}
