import {
  Button,
  PageShell,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../admin-client-workspace'
import { useAdminClinicSetupWorkflow } from '../useAdminClinicSetupWorkflow'
import { ClinicProfileCard } from './ClinicProfileCard'

function ClinicSetupLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function ClinicSetupErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message || 'Clinic setup could not be loaded.'} status="error" />
    </PageShell>
  )
}

export function AdminClinicSetupWorkspace({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const {
    draft,
    error,
    isDirty,
    page,
    resetDraft,
    saveDraft,
    saveState,
    status,
    updateDraft,
  } = useAdminClinicSetupWorkflow({ clientId, runtime })

  if (status === 'error' && !page) {
    return <ClinicSetupErrorState message={error} />
  }

  if (status === 'loading' || !page || !draft) {
    return <ClinicSetupLoadingState />
  }

  return (
    <>
      <AdminClientWorkspaceHeader
        actions={(
          <>
            {saveState ? <span className="text-label text-text-muted">{saveState}</span> : null}
            <Button disabled={!isDirty} onClick={resetDraft} size="sm" type="button" variant="outline">
              Reset
            </Button>
            <Button disabled={!isDirty} onClick={saveDraft} size="sm" type="button">
              Save setup
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-setup"
        eyebrow="Client workspace"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        {status === 'error' && error ? (
          <WorkspaceState message={error} status="error" />
        ) : null}

        <div className="grid gap-card">
          <div className="rounded-control bg-surface-subtle px-4 py-3 text-ui text-text-secondary">
            This setup defines the aggregate clinic context behind Growth Review. Do not enter
            patient-level identifiers here.
          </div>

          <ClinicProfileCard draft={draft} onUpdate={updateDraft} />
        </div>
      </PageShell>
    </>
  )
}
