import {
  Button,
  PageShell,
  Skeleton,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  ClinicClientPreviewLinks,
} from '../../admin-client-workspace'
import { useAdminClinicMetricsWorkflow } from '../useAdminClinicMetricsWorkflow'
import { CallBookingMetricsCard } from './CallBookingMetricsCard'
import { PatientAcquisitionMetricsCard } from './PatientAcquisitionMetricsCard'
import { ServiceLinePerformanceCard } from './ServiceLinePerformanceCard'

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
    createdBookingActionKeys,
    createBookingSuggestionAction,
    creatingBookingActionKey,
    draft,
    error,
    isDirty,
    page,
    publishMetricRecord,
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
            <ClinicClientPreviewLinks
              clientId={page.client.id}
              links={[
                {
                  href: '/admin/client-patient-acquisition-preview',
                  label: 'Published acquisition',
                },
                {
                  href: '/admin/client-patient-acquisition-preview',
                  label: 'Draft acquisition',
                  source: 'draft',
                },
                {
                  href: '/admin/client-calls-bookings-preview',
                  label: 'Published calls',
                },
                {
                  href: '/admin/client-calls-bookings-preview',
                  label: 'Draft calls',
                  source: 'draft',
                },
                {
                  href: '/admin/client-service-lines-preview',
                  label: 'Published services',
                },
                {
                  href: '/admin/client-service-lines-preview',
                  label: 'Draft services',
                  source: 'draft',
                },
              ]}
            />
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
            They should describe patient demand, booked appointments, service-line performance, and front desk leakage
            without storing PHI.
          </div>

          <PatientAcquisitionMetricsCard
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onPublish={publishMetricRecord}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
          <CallBookingMetricsCard
            createdActionKeys={createdBookingActionKeys}
            creatingActionKey={creatingBookingActionKey}
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onCreateSuggestedAction={createBookingSuggestionAction}
            onPublish={publishMetricRecord}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
          <ServiceLinePerformanceCard
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onPublish={publishMetricRecord}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
        </form>
      </PageShell>
    </>
  )
}
