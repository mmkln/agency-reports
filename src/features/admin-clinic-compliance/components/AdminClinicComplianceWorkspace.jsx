import {
  Button,
  PageShell,
  Skeleton,
} from '@/shared/ui'

import { AdminClientWorkspaceHeader } from '../../admin-client-workspace'
import { useAdminClinicComplianceWorkflow } from '../useAdminClinicComplianceWorkflow'
import { ComplianceReviewsCard } from './ComplianceReviewsCard'
import { MedicalApprovalsCard } from './MedicalApprovalsCard'

function ClinicComplianceLoadingState() {
  return (
    <PageShell className="py-section" width="full">
      <div className="grid gap-card">
        <Skeleton className="h-28" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </PageShell>
  )
}

function ClinicComplianceErrorState({ message }) {
  return (
    <PageShell className="py-section" width="content">
      <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
        {message || 'Clinic compliance could not be loaded.'}
      </div>
    </PageShell>
  )
}

export function AdminClinicComplianceWorkspace({ routeParams = {}, runtime }) {
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
  } = useAdminClinicComplianceWorkflow({ clientId, runtime })

  if (status === 'error' && !page) {
    return <ClinicComplianceErrorState message={error} />
  }

  if (status === 'loading' || !page || !draft) {
    return <ClinicComplianceLoadingState />
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
            <Button disabled={!isDirty} form="admin-clinic-compliance-form" size="sm" type="submit">
              Save compliance
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-compliance"
        eyebrow="Clinic compliance"
      />

      <PageShell className="py-section" width="full">
        {status === 'error' && error ? (
          <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
            {error}
          </div>
        ) : null}

        <form
          className="grid gap-card"
          id="admin-clinic-compliance-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (event.currentTarget.reportValidity()) {
              saveDraft()
            }
          }}
        >
          <div className="rounded-control bg-surface-subtle px-4 py-3 text-ui text-text-secondary">
            These records feed the client Compliance & Approvals page. Keep them client-safe and aggregate:
            policy issues, medical claims, ad restrictions, and privacy/tracking status without PHI.
          </div>

          <ComplianceReviewsCard
            draft={draft}
            locations={page.locations}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
          <MedicalApprovalsCard
            draft={draft}
            locations={page.locations}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
        </form>
      </PageShell>
    </>
  )
}
