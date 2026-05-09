import { useState } from 'react'

import { deleteAdminClient, listAdminClients } from '../../../domain/services/adminClientService'
import { CLIENT_STATUSES } from '../../../entities/client'
import {
  ClientsTable,
  ClientsTableSkeleton,
  CreateClientDrawer,
  EmptyClientsState,
} from '../../../features/admin-client-setup/components'
import { useCreateClientForm } from '../../../features/admin-client-setup/model'
import { useToast } from '../../../shared/notifications'

const statusOptions = [
  CLIENT_STATUSES.ON_TRACK,
  CLIENT_STATUSES.NEEDS_ATTENTION,
  CLIENT_STATUSES.WAITING_CLIENT,
  CLIENT_STATUSES.BLOCKED,
  CLIENT_STATUSES.PAUSED,
]

function closeCreateClientDrawer() {
  window.location.hash = 'admin-clients'
}

function createUuid() {
  return crypto.randomUUID()
}

export function AdminClientsPage({ routeParams = {}, runtime }) {
  const isCreateDrawerOpen = routeParams.newClient === 'true'
  const isLoading = false
  const toast = useToast()
  const [clients, setClients] = useState(() => listAdminClients({
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }))
  const createClientForm = useCreateClientForm({
    idGenerator: createUuid,
    onCreated: (client) => {
      setClients(listAdminClients({
        repositories: runtime.repositories,
        viewer: runtime.viewer,
      }))
      toast.success('Client created', `${client.name} is ready in the admin workspace.`)
      closeCreateClientDrawer()
    },
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  function refreshClients() {
    setClients(listAdminClients({
      repositories: runtime.repositories,
      viewer: runtime.viewer,
    }))
  }

  return (
    <>
      {isLoading ? (
        <ClientsTableSkeleton />
      ) : clients.length > 0 ? (
        <ClientsTable
          clients={clients}
          onDeleteClient={(clientId) => {
            const deletedClient = clients.find((client) => client.id === clientId)

            deleteAdminClient({
              clientId,
              repositories: runtime.repositories,
              viewer: runtime.viewer,
            })
            refreshClients()
            toast.success('Client deleted', `${deletedClient?.name ?? 'Client'} was removed from local demo data.`)
          }}
          repositories={runtime.repositories}
        />
      ) : (
        <EmptyClientsState />
      )}
      <CreateClientDrawer
        error={createClientForm.error}
        form={createClientForm.form}
        isOpen={isCreateDrawerOpen}
        lastCreatedClient={createClientForm.lastCreatedClient}
        onClose={closeCreateClientDrawer}
        onSubmit={createClientForm.handleSubmit}
        onUpdateField={createClientForm.updateField}
        slugIssue={createClientForm.slugIssue}
        statusOptions={statusOptions}
      />
    </>
  )
}
