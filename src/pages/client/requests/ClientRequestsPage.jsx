import {
  ClientRequestDialog,
  useClientRequestsWorkflow,
} from '../../../features/client-requests'
import { getClientRequestsPage } from '../../../domain/services/clientRequestsService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  ClientRequestsList,
  ClientRequestsSummary,
} from '../../../widgets/client-requests'

export function ClientRequestsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const requestsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-initiated-requests:${clientId}`,
    initialData: {
      client: null,
      counts: {
        all: 0,
        open: 0,
      },
      requests: [],
    },
    load: () => runtime.dataClient.read((repositories) => getClientRequestsPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = requestsResource.data
  const workflow = useClientRequestsWorkflow({
    clientId,
    onCreated: () => {
      void requestsResource.reload()
    },
    runtime,
  })

  if (requestsResource.status === 'loading') {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (requestsResource.status === 'error' || page.status === 'error') {
    return <AccessDeniedState />
  }

  return (
    <div className="grid gap-6">
      <ClientRequestsSummary counts={page.counts} onCreate={workflow.openCreateDialog} />
      <ClientRequestsList counts={page.counts} requests={page.requests} />
      <ClientRequestDialog
        draft={workflow.requestDraft}
        error={workflow.requestError}
        isOpen={workflow.isCreateOpen}
        onChange={workflow.setRequestDraft}
        onClose={workflow.closeCreateDialog}
        onSubmit={workflow.submitRequest}
        saveState={workflow.requestSaveState}
      />
    </div>
  )
}
