import { Link } from 'react-router-dom'

import {
  Button,
  PageShell,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  WorkspaceState,
} from '../../admin-client-workspace'
import { useAdminClinicSetupWorkflow } from '../useAdminClinicSetupWorkflow'
import { ClinicLocationsCard } from './ClinicLocationsCard'
import { ClinicProfileCard } from './ClinicProfileCard'
import { ClinicServiceLinesCard } from './ClinicServiceLinesCard'

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
              Save clinic setup
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-setup"
        eyebrow="Clinic setup"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        {status === 'error' && error ? (
          <WorkspaceState message={error} status="error" />
        ) : null}

        <div className="grid gap-card">
          <div className="rounded-control bg-surface-subtle px-4 py-3 text-ui text-text-secondary">
            This setup defines the aggregate clinic context behind patient acquisition, calls, bookings,
            reputation, compliance, and client action workflows. Do not enter patient-level identifiers here.
            <Button asChild className="ml-2 h-auto p-0 text-link" size="sm" variant="link">
              <Link to={`/admin/client-reports-dashboards?clientId=${clientId}`}>Manage clinic results</Link>
            </Button>
          </div>

          <ClinicProfileCard draft={draft} onUpdate={updateDraft} />
          <ClinicLocationsCard draft={draft} onUpdate={updateDraft} />
          <ClinicServiceLinesCard draft={draft} onUpdate={updateDraft} />
        </div>
      </PageShell>
    </>
  )
}
