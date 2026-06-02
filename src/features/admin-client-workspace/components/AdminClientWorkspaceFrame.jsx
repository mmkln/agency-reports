import { normalizeBackendWorkspacesPayload } from '@/entities/workspace'
import { PageShell } from '@/shared/ui'
import { useAsyncResource } from '@/shared/data/useAsyncResource'

import { resolveRouteWorkspaceId } from '../model'
import { AdminClientWorkspaceHeader } from './AdminClientWorkspaceHeader'
import { WorkspaceState } from './WorkspaceCard'

function loadWorkspace({ apiClient, workspaceId }) {
  if (!workspaceId) {
    return Promise.resolve(null)
  }

  return apiClient.get('/api/workspaces/')
    .then((payload) => normalizeBackendWorkspacesPayload(payload).workspaces
      .find((workspace) => workspace.id === workspaceId) ?? null)
}

function WorkspaceFrameState({ message, status }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message} status={status} />
    </PageShell>
  )
}

export function AdminClientWorkspaceFrame({
  actions,
  children,
  currentPage,
  primaryAction,
  routeParams = {},
  runtime,
  width = 'content',
}) {
  const workspaceId = resolveRouteWorkspaceId({ routeParams, runtime })
  const workspaceResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-workspace-frame:${workspaceId ?? ''}`,
    initialData: null,
    load: () => loadWorkspace({
      apiClient: runtime.apiClient,
      workspaceId,
    }),
  })

  if (!workspaceId) {
    return <WorkspaceFrameState message="Choose a workspace before opening this page." status="error" />
  }

  if (workspaceResource.status === 'loading') {
    return <WorkspaceFrameState status="loading" />
  }

  if (workspaceResource.status === 'error' || !workspaceResource.data) {
    return (
      <WorkspaceFrameState
        message={workspaceResource.error || 'Workspace was not found.'}
        status="error"
      />
    )
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={actions}
        client={workspaceResource.data}
        currentPage={currentPage}
        eyebrow={workspaceResource.data.clientName ? 'Client workspace' : 'Workspace'}
        primaryAction={primaryAction}
        width="full"
      />
      <PageShell className="px-app-gutter py-content-gutter" width={width}>
        {typeof children === 'function'
          ? children({ workspace: workspaceResource.data, workspaceId })
          : children}
      </PageShell>
    </>
  )
}
