import {
  Button,
  PageShell,
  Skeleton,
} from '@/shared/ui'

import { AdminClientWorkspaceHeader } from '../../admin-client-workspace'
import { useAdminClinicReputationWorkflow } from '../useAdminClinicReputationWorkflow'
import { ReputationSnapshotsCard } from './ReputationSnapshotsCard'

function ClinicReputationLoadingState() {
  return (
    <PageShell className="py-section" width="full">
      <div className="grid gap-card">
        <Skeleton className="h-28" />
        <Skeleton className="h-80" />
      </div>
    </PageShell>
  )
}

function ClinicReputationErrorState({ message }) {
  return (
    <PageShell className="py-section" width="content">
      <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
        {message || 'Clinic reputation could not be loaded.'}
      </div>
    </PageShell>
  )
}

export function AdminClinicReputationWorkspace({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const {
    draft,
    error,
    isDirty,
    page,
    publishReputationRecord,
    resetDraft,
    saveDraft,
    saveState,
    status,
    updateDraft,
  } = useAdminClinicReputationWorkflow({ clientId, runtime })

  if (status === 'error' && !page) {
    return <ClinicReputationErrorState message={error} />
  }

  if (status === 'loading' || !page || !draft) {
    return <ClinicReputationLoadingState />
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
            <Button disabled={!isDirty} form="admin-clinic-reputation-form" size="sm" type="submit">
              Save reputation
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-reputation"
        eyebrow="Clinic reputation"
      />

      <PageShell className="py-section" width="full">
        {status === 'error' && error ? (
          <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
            {error}
          </div>
        ) : null}

        <form
          className="grid gap-card"
          id="admin-clinic-reputation-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (event.currentTarget.reportValidity()) {
              saveDraft()
            }
          }}
        >
          <div className="rounded-control bg-surface-subtle px-4 py-3 text-ui text-text-secondary">
            These records feed the client Reputation page and should summarize Google reviews, response work,
            local visibility, and GBP updates without storing reviewer or patient identifiers.
          </div>

          <ReputationSnapshotsCard
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onPublish={publishReputationRecord}
            onUpdate={updateDraft}
          />
        </form>
      </PageShell>
    </>
  )
}
