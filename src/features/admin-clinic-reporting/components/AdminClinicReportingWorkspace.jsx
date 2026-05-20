import { Link } from 'react-router-dom'

import {
  Button,
  PageShell,
  TableBadge,
  TablePanel,
} from '@/shared/ui'

import { CLINIC_REPORTING_PUBLISH_STATES } from '../../../entities/clinic-reporting'
import { DENTAL_GROWTH_REVIEW_LAYER } from '../../../entities/dental-growth-review'
import {
  AdminClientWorkspaceHeader,
  ClinicClientPreviewLinks,
  WorkspaceState,
} from '../../admin-client-workspace'
import { useAdminClinicReportingWorkflow } from '../useAdminClinicReportingWorkflow'
import { AdminDentalGrowthReviewEditorDialog } from './AdminDentalGrowthReviewEditorDialog'
import { AdminClinicReportingImportDialog } from './AdminClinicReportingImportDialog'

function LoadingState() {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState />
    </PageShell>
  )
}

function ErrorState({ message }) {
  return (
    <PageShell className="px-app-gutter py-content-gutter" width="content">
      <WorkspaceState message={message || 'Clinic reporting could not be loaded.'} status="error" />
    </PageShell>
  )
}

function formatStatusLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function freshnessLabel(record) {
  const firstSource = record.sourceTrust?.[0]

  if (!firstSource?.last_updated_at) {
    return formatStatusLabel(firstSource?.freshness_status ?? 'missing')
  }

  return `${formatStatusLabel(firstSource.freshness_status)} | ${new Date(firstSource.last_updated_at).toLocaleDateString()}`
}

function publishStateTone(publishState) {
  if (publishState === CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED) {
    return 'green'
  }

  if (publishState === CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED) {
    return 'blue'
  }

  return 'yellow'
}

function growthReviewHref(row, clientId) {
  const search = new URLSearchParams({
    clientId,
    periodId: row.id,
  })

  if (row.publishState === CLINIC_REPORTING_PUBLISH_STATES.DRAFT) {
    search.set('preview', 'draft')
  }

  return `/dashboards/dental-growth-review?${search.toString()}`
}

function growthReviewPreviewLabel(row) {
  return row.publishState === CLINIC_REPORTING_PUBLISH_STATES.DRAFT
    ? 'Preview draft'
    : 'Open dashboard'
}

export function AdminClinicReportingWorkspace({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId
  const {
    error,
    importError,
    importLayer,
    importPlan,
    importRawJson,
    isImportOpen,
    isReviewEditorOpen,
    layerOptions,
    openImportDialog,
    openReviewEditor,
    page,
    applyImport,
    closeImportDialog,
    closeReviewEditor,
    createGrowthReviewDraft,
    previewImport,
    reviewEditorError,
    reviewEditorPeriod,
    saveState,
    saveGrowthReviewDraft,
    setImportLayer,
    setImportRawJson,
    status,
    updatePublishState,
  } = useAdminClinicReportingWorkflow({ clientId, runtime })

  if (status === 'error' && !page) {
    return <ErrorState message={error} />
  }

  if (status === 'loading' || !page) {
    return <LoadingState />
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
                { href: '/dashboards/dental-growth-review', label: 'Growth Review' },
                { href: '/client/executive-performance', label: 'Executive dashboard' },
                { href: '/client/monthly-strategy', label: 'Monthly strategy' },
                { href: '/clinic/daily-ops', label: 'Daily ops' },
                { href: '/team/clinic-operator', label: 'Weekly operator' },
              ]}
            />
            <Button onClick={createGrowthReviewDraft} size="sm" type="button" variant="outline">
              New Growth Review
            </Button>
            <Button onClick={openImportDialog} size="sm" type="button">
              Import JSON
            </Button>
          </>
        )}
        client={page.client}
        currentPage="clinic-reporting"
        eyebrow="Clinic reporting"
      />

      <PageShell className="px-app-gutter py-content-gutter" width="content">
        {status === 'error' && error ? (
          <WorkspaceState message={error} status="error" />
        ) : null}

        <TablePanel
          columns={[
            {
              key: 'layer',
              label: 'Layer',
              render: (row) => row.layerMeta?.label ?? row.layer,
            },
            { key: 'title', label: 'Record' },
            { key: 'periodLabel', label: 'Period' },
            {
              key: 'publishState',
              label: 'Status',
              render: (row) => (
                <TableBadge tone={publishStateTone(row.publishState)}>
                  {formatStatusLabel(row.publishState)}
                </TableBadge>
              ),
            },
            {
              key: 'freshness',
              label: 'Freshness',
              render: freshnessLabel,
            },
            {
              key: 'validation',
              label: 'Validation',
              render: () => <TableBadge tone="green">valid</TableBadge>,
            },
            {
              isAction: true,
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap justify-end gap-tag">
                  {row.layer === DENTAL_GROWTH_REVIEW_LAYER ? (
                    <>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <Link to={growthReviewHref(row, page.client.id)}>
                          {growthReviewPreviewLabel(row)}
                        </Link>
                      </Button>
                      <Button
                        onClick={() => openReviewEditor(row.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Edit
                      </Button>
                    </>
                  ) : null}
                  <Button
                    disabled={row.publishState === CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED}
                    onClick={() => updatePublishState({
                      layer: row.layer,
                      periodId: row.id,
                      publishState: CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED,
                    })}
                    title={row.publishState === CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED ? 'Already published' : undefined}
                    size="sm"
                    type="button"
                    variant={row.publishState === CLINIC_REPORTING_PUBLISH_STATES.DRAFT ? 'primary' : 'outline'}
                  >
                    Publish
                  </Button>
                  <Button
                    disabled={row.publishState === CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED}
                    onClick={() => updatePublishState({
                      layer: row.layer,
                      periodId: row.id,
                      publishState: CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED,
                    })}
                    title={row.publishState === CLINIC_REPORTING_PUBLISH_STATES.ARCHIVED ? 'Already archived' : undefined}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Archive
                  </Button>
                </div>
              ),
            },
          ]}
          rows={page.records}
          title="Reporting Records"
        />
      </PageShell>

      <AdminClinicReportingImportDialog
        importError={importError}
        importLayer={importLayer}
        importPlan={importPlan}
        isOpen={isImportOpen}
        layerOptions={layerOptions}
        onApply={applyImport}
        onClose={closeImportDialog}
        onLayerChange={setImportLayer}
        onPreview={previewImport}
        onRawJsonChange={setImportRawJson}
        rawJson={importRawJson}
      />
      <AdminDentalGrowthReviewEditorDialog
        error={reviewEditorError}
        isOpen={isReviewEditorOpen}
        key={reviewEditorPeriod?.id ?? 'growth-review-editor'}
        onClose={closeReviewEditor}
        onSave={saveGrowthReviewDraft}
        period={reviewEditorPeriod}
      />
    </>
  )
}
