import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  deleteAdminClient,
  listAdminClientPendingInvitations,
  listAdminClients,
} from '../../../domain/services/adminClientService'
import {
  ClientsTable,
  ClientsTableSkeleton,
  CreateClientModal,
  EmptyClientsState,
  useCreateClientForm,
  useEditClientForm,
} from '../../../features/admin-client-setup'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import { ErrorBlock } from '@/shared/ui'

function createUuid() {
  return crypto.randomUUID()
}

function EditClientModalController({
  client,
  clients,
  dataClient,
  onClose,
  onUpdated,
  viewer,
}) {
  const editClientForm = useEditClientForm({
    client,
    dataClient,
    existingClients: clients,
    onUpdated,
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
  const navigate = useNavigate()
  const toast = useToast()
  const clientsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-clients`,
    initialData: {
      clients: [],
      pendingInvitationsByClientId: {},
    },
    load: () => runtime.dataClient.read((repositories) => {
      const clients = listAdminClients({
        repositories,
        viewer: runtime.viewer,
      })
      const pendingInvitationsByClientId = Object.fromEntries(
        listAdminClientPendingInvitations({
          repositories,
          viewer: runtime.viewer,
        }).map((invitation) => [invitation.client_id, invitation]),
      )

      return {
        clients,
        pendingInvitationsByClientId,
      }
    }),
  })
  const clients = clientsResource.data?.clients ?? []
  const pendingInvitationsByClientId = clientsResource.data?.pendingInvitationsByClientId ?? {}
  const createClientForm = useCreateClientForm({
    activityIdGenerator: createUuid,
    dataClient: runtime.dataClient,
    existingClients: clients,
    idGenerator: createUuid,
    onCreated: (client) => {
      void clientsResource.reload()
      toast.success('Account created', `${client.name} is ready in the admin workspace.`)
      navigate('/admin/clients', { replace: true })
    },
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
        <ErrorBlock title="Accounts could not be loaded">
          {clientsResource.error}
        </ErrorBlock>
      ) : clients.length > 0 ? (
        <ClientsTable
          clients={clients}
          onDeleteClient={(clientId) => {
            const deletedClient = clients.find((client) => client.id === clientId)

            void runtime.dataClient.write((repositories) => deleteAdminClient({
              clientId,
              repositories,
              viewer: runtime.viewer,
            }))
              .then(() => {
                refreshClients()
                toast.success('Account deleted', `${deletedClient?.name ?? 'Account'} was removed from local demo data.`)
              })
              .catch((error) => {
                toast.error('Account could not be deleted', error.message)
              })
          }}
          onEditClient={setClientPendingEdit}
          pendingInvitationsByClientId={pendingInvitationsByClientId}
        />
      ) : (
        <EmptyClientsState />
      )}
      <CreateClientModal
        error={createClientForm.error}
        form={createClientForm.form}
        isOpen={isCreateModalOpen}
        lastCreatedClient={createClientForm.lastCreatedClient}
        onClose={() => navigate('/admin/clients', { replace: true })}
        onSubmit={createClientForm.handleSubmit}
        onUpdateField={createClientForm.updateField}
        slugIssue={createClientForm.slugIssue}
      />
      {clientPendingEdit ? (
        <EditClientModalController
          client={clientPendingEdit}
          clients={clients}
          dataClient={runtime.dataClient}
          key={clientPendingEdit.id}
          onClose={() => setClientPendingEdit(null)}
          onUpdated={(client) => {
            void clientsResource.reload()
            toast.success('Account updated', `${client.name} workspace details were saved.`)
            setClientPendingEdit(null)
          }}
          viewer={runtime.viewer}
        />
      ) : null}
    </>
  )
}
