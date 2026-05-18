import {
  Button,
  PageShell,
  Skeleton,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  ClinicClientPreviewLinks,
} from '../../admin-client-workspace'
import { useAdminClinicComplianceWorkflow } from '../useAdminClinicComplianceWorkflow'
import { ClinicComplianceImportDialog } from './ClinicComplianceImportDialog'
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
    applyApprovalDecision,
    applyReviewStatus,
    createdComplianceActionKeys,
    createComplianceSuggestionAction,
    creatingComplianceActionKey,
    draft,
    error,
    importError,
    importPlan,
    importRawJson,
    isDirty,
    isImportOpen,
    openImportDialog,
    page,
    applyImport,
    closeImportDialog,
    previewImport,
    publishComplianceRecord,
    resetDraft,
    saveDraft,
    saveState,
    setImportRawJson,
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
            <ClinicClientPreviewLinks
              clientId={page.client.id}
              links={[
                {
                  href: '/admin/client-compliance-approvals-preview',
                  label: 'Published compliance',
                },
                {
                  href: '/admin/client-compliance-approvals-preview',
                  label: 'Draft compliance',
                  source: 'draft',
                },
              ]}
            />
            <Button disabled={!isDirty} onClick={resetDraft} size="sm" type="button" variant="outline">
              Reset
            </Button>
            <Button onClick={openImportDialog} size="sm" type="button" variant="outline">
              Import JSON
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
            policy issues, medical claims, ad restrictions, and privacy/tracking status without PHI. Use Import JSON
            for reviewed aggregate exports from policy checklists, privacy reviews, or ad-platform sources.
          </div>

          <ComplianceReviewsCard
            createdActionKeys={createdComplianceActionKeys}
            creatingActionKey={creatingComplianceActionKey}
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onApplyStatus={applyReviewStatus}
            onCreateSuggestedAction={createComplianceSuggestionAction}
            onPublish={publishComplianceRecord}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
          <MedicalApprovalsCard
            createdActionKeys={createdComplianceActionKeys}
            creatingActionKey={creatingComplianceActionKey}
            draft={draft}
            isDirty={isDirty}
            locations={page.locations}
            onApplyDecision={applyApprovalDecision}
            onCreateSuggestedAction={createComplianceSuggestionAction}
            onPublish={publishComplianceRecord}
            onUpdate={updateDraft}
            serviceLines={page.serviceLines}
          />
        </form>
      </PageShell>

      <ClinicComplianceImportDialog
        importError={importError}
        importPlan={importPlan}
        isOpen={isImportOpen}
        onApply={applyImport}
        onClose={closeImportDialog}
        onPreview={previewImport}
        onRawJsonChange={setImportRawJson}
        rawJson={importRawJson}
      />
    </>
  )
}
