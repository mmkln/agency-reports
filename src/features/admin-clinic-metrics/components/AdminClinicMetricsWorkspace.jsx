import {
  Button,
  PageShell,
  Skeleton,
} from '@/shared/ui'

import { AdminClientWorkspaceHeader } from '../../admin-client-workspace'
import { useAdminClinicMetricsWorkflow } from '../useAdminClinicMetricsWorkflow'
import { CallBookingMetricsCard } from './CallBookingMetricsCard'
import { PatientAcquisitionMetricsCard } from './PatientAcquisitionMetricsCard'

function ClinicMetricsLoadingState() {
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

function ClinicMetricsErrorState({ message }) {
  return (
    <PageShell className="py-section" width="content">
      <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
        {message || 'Clinic metrics could not be loaded.'}
      </div>
    </PageShell>
  )
}

export function AdminClinicMetricsWorkspace({ routeParams = {}, runtime }) {
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
  } = useAdminClinicMetricsWorkflow({ clientId, runtime })

  if (status === 'error' && !page) {
    return <ClinicMetricsErrorState message={error} />
  }

  if (status === 'loading' || !page || !draft) {
    return <ClinicMetricsLoadingState />
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
            <Button disabled={!isDirty} form="admin-clinic-metrics-form" size="sm" type="submit">
              Save metrics
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-metrics"
        eyebrow="Clinic metrics"
      />

      <PageShell className="py-section" width="full">
        {status === 'error' && error ? (
          <div className="rounded-control bg-destructive/10 px-4 py-3 text-ui text-destructive">
            {error}
          </div>
        ) : null}

        <form
          className="grid gap-card"
          id="admin-clinic-metrics-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (event.currentTarget.reportValidity()) {
              saveDraft()
            }
          }}
        >
          <div className="rounded-control bg-surface-subtle px-4 py-3 text-ui text-text-secondary">
            These records are the aggregate source for the client Patient Acquisition and Calls & Bookings pages.
            They should describe patient demand, booked appointments, and front desk leakage without storing PHI.
          </div>

          <PatientAcquisitionMetricsCard
            draft={draft}
            locations={page.locations}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
          <CallBookingMetricsCard
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
