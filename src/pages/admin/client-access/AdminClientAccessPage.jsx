import {
  PageShell,
} from '@/shared/ui'

import { listAdminClients } from '../../../domain/services/adminClientService'
import { AccessMembersPanel, InvitationsPanel } from '../../../features/admin-client-access'
import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../../features/admin-client-workspace'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function loadAdminClient({ clientId, repositories, viewer }) {
  const client = listAdminClients({
    repositories,
    viewer,
  }).find((record) => record.id === clientId)

  if (!client) {
    throw new Error('Account was not found.')
  }

  return client
}

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message} status="error" />
    </PageShell>
  )
}

export function AdminClientAccessPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const clientResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-access:${clientId ?? ''}`,
    initialData: null,
    load: () => runtime.dataClient.read((repositories) => loadAdminClient({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })

  if (clientResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (clientResource.status === 'error' || !clientResource.data) {
    return <WorkspaceErrorState message={clientResource.error || 'Account was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={clientResource.data}
        currentPage="access"
        eyebrow="Workspace access"
        width="content"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        <div className="grid gap-card lg:grid-cols-2 lg:items-start">
          <AccessMembersPanel clientId={clientId} runtime={runtime} />
          <InvitationsPanel clientId={clientId} runtime={runtime} />
        </div>
      </PageShell>
    </>
  )
}
