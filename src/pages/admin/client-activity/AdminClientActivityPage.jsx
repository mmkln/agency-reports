import {
  CardContent,
  PageShell,
  PrimitiveCard as Card,
} from '@/shared/ui'

import { listAdminClients } from '../../../domain/services/adminClientService'
import { RecentClientActivityPanel } from '../../../features/admin-client-activity'
import { AdminClientWorkspaceHeader } from '../../../features/admin-client-workspace'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'

function loadAdminClient(clientId, runtime) {
  const client = listAdminClients({
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  }).find((record) => record.id === clientId)

  if (!client) {
    throw new Error('Client was not found.')
  }

  return client
}

function WorkspaceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="min-h-[260px] animate-pulse" />
      </Card>
    </PageShell>
  )
}

function WorkspaceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter">
      <Card className="bg-block shadow-none">
        <CardContent className="flex min-h-[260px] items-center justify-center text-ui text-destructive">
          {message}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function AdminClientActivityPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const clientResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-activity:${clientId ?? ''}`,
    initialData: null,
    load: () => runtime.dataClient.read((repositories) => loadAdminClient(clientId, {
      ...runtime,
      repositories,
    })),
  })

  if (clientResource.status === 'loading') {
    return <WorkspaceLoadingState />
  }

  if (clientResource.status === 'error' || !clientResource.data) {
    return <WorkspaceErrorState message={clientResource.error || 'Client was not found.'} />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        client={clientResource.data}
        currentPage="activity"
        eyebrow="Client activity"
      />

      <PageShell className="px-app-gutter py-content-gutter">
        <RecentClientActivityPanel clientId={clientId} runtime={runtime} />
      </PageShell>
    </>
  )
}
