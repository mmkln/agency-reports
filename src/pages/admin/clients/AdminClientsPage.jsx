import { useState } from 'react'

import { deleteAdminClient, listAdminClients } from '../../../domain/services/adminClientService'
import {
  ClientsTable,
  ClientsTableSkeleton,
  CreateClientModal,
  EmptyClientsState,
} from '../../../features/admin-client-setup/components'
import { useCreateClientForm, useEditClientForm } from '../../../features/admin-client-setup/model'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

function closeCreateClientModal() {
  window.location.hash = 'admin-clients'
}

function createUuid() {
  return crypto.randomUUID()
}

function EditClientModalController({
  client,
  onClose,
  onUpdated,
  repositories,
  viewer,
}) {
  const editClientForm = useEditClientForm({
    client,
    onUpdated,
    repositories,
    viewer,
  })

  return (
    <CreateClientModal
      error={editClientForm.error}
      form={editClientForm.form}
      isOpen
      mode="edit"
      onClose={onClose}
      onSubmit={editClientForm.handleSubmit}
      onUpdateField={editClientForm.updateField}
      slugIssue={editClientForm.slugIssue}
    />
  )
}

export function AdminClientsPage({ routeParams = {}, runtime }) {
  const isCreateModalOpen = routeParams.newClient === 'true'
  const [clientPendingEdit, setClientPendingEdit] = useState(null)
  const toast = useToast()
  const clientsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-clients`,
    initialData: [],
    load: () => runtime.dataClient.read((repositories) => listAdminClients({
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const clients = clientsResource.data ?? []
  const createClientForm = useCreateClientForm({
    idGenerator: createUuid,
    onCreated: (client) => {
      void clientsResource.reload()
      toast.success('Client created', `${client.name} is ready in the admin workspace.`)
      closeCreateClientModal()
    },
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
  function refreshClients() {
    void clientsResource.reload()
  }

  return (
    <>
      {clientsResource.status === 'loading' ? (
        <ClientsTableSkeleton />
      ) : clientsResource.status === 'error' ? (
        <div className="rounded-block border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {clientsResource.error}
        </div>
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
          onEditClient={setClientPendingEdit}
          repositories={runtime.repositories}
        />
      ) : (
        <EmptyClientsState />
      )}
      <CreateClientModal
        error={createClientForm.error}
        form={createClientForm.form}
        isOpen={isCreateModalOpen}
        lastCreatedClient={createClientForm.lastCreatedClient}
        onClose={closeCreateClientModal}
        onSubmit={createClientForm.handleSubmit}
        onUpdateField={createClientForm.updateField}
        slugIssue={createClientForm.slugIssue}
      />
      {clientPendingEdit ? (
        <EditClientModalController
          client={clientPendingEdit}
          key={clientPendingEdit.id}
          onClose={() => setClientPendingEdit(null)}
          onUpdated={(client) => {
            void clientsResource.reload()
            toast.success('Client updated', `${client.name} workspace details were saved.`)
            setClientPendingEdit(null)
          }}
          repositories={runtime.repositories}
          viewer={runtime.viewer}
        />
      ) : null}
    </>
  )
}
