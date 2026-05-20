import {
  Button,
  PageShell,
} from '@/shared/ui'

import {
  AdminClientWorkspaceHeader,
  ClinicClientPreviewLinks,
  WorkspaceState,
} from '../../admin-client-workspace'
import { useAdminClinicComplianceWorkflow } from '../useAdminClinicComplianceWorkflow'
import { ClinicComplianceImportDialog } from './ClinicComplianceImportDialog'
import { ComplianceReviewsCard } from './ComplianceReviewsCard'
import { MedicalApprovalsCard } from './MedicalApprovalsCard'

function ClinicComplianceLoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function ClinicComplianceErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message || 'Clinic compliance could not be loaded.'} status="error" />
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

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        {status === 'error' && error ? (
          <WorkspaceState message={error} status="error" />
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
