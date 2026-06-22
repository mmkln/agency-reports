import { Link } from 'react-router-dom'

import {
  Button,
  StatusBadge,
} from '@/shared/ui'

import {
  PERFORMANCE_DASHBOARD_STATUS_META,
  PERFORMANCE_DATA_MODE_META,
} from '../../../entities/performance-dashboard'
import { Icon } from '../../../shared/icons'
import {
  formatPeriod,
  useAdminPerformanceDashboardEditorWorkflow,
} from '../model'
import { IssueList } from './editor/AdminPerformanceDashboardEditorPrimitives'
import {
  AppendixTablesSection,
  AgencyWorkSection,
  ChannelBreakdownSection,
  ClientPeriodDataTrustSection,
  EditorInspector,
  ExecutiveSummarySection,
  FunnelSection,
  GoalsSection,
  HeroMetricSection,
  InsightsSection,
  KpiCardsSection,
  NextActionsSection,
  ServiceSectionsSection,
  TrendSeriesSection,
} from './editor/AdminPerformanceDashboardEditorSections'

export function AdminPerformanceDashboardEditor({
  clients,
  initialPeriod,
  runtime,
  toast,
}) {
  const editor = useAdminPerformanceDashboardEditorWorkflow({
    clients,
    initialPeriod,
    runtime,
    toast,
  })
  const {
    addAppendixColumn,
    addAppendixRow,
    addNestedArrayItem,
    form,
    isPublishing,
    isSaving,
    publishDraft,
    removeAppendixColumn,
    removeAppendixRow,
    removeArrayItem,
    removeNestedArrayItem,
    saveDraft,
    selectedClient,
    updateAppendixCell,
    updateArrayItem,
    updateContent,
    updateExecutiveSummary,
    updateForm,
    updateHeroMetric,
    updateNestedArrayItem,
    validateDraft,
    validation,
  } = editor
  const previewHref = `/admin/client-performance-preview?clientId=${form.clientId}&performancePeriodId=${form.id}`

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-app-gutter py-6">
      <section className="rounded-block border border-control-border bg-block shadow-card">
        <div className="flex flex-col gap-4 border-b border-separator px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-label font-normal text-text-muted">
              <Link className="font-medium text-action hover:underline" to="/admin/performance-dashboards">
                Performance Dashboards
              </Link>
              <span>/</span>
              <span>{selectedClient?.name ?? 'Account'}</span>
            </div>
            <h1 className="mt-2 truncate text-heading text-text-primary">{form.title}</h1>
            <p className="mt-1 text-ui text-text-muted">{formatPeriod(form)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={PERFORMANCE_DASHBOARD_STATUS_META[form.status]} />
            <StatusBadge meta={PERFORMANCE_DATA_MODE_META[form.dataMode]} />
            <Button asChild size="sm" type="button" variant="outline">
              <Link to={previewHref}>
                <Icon name="eye" size={15} />
                Preview
              </Link>
            </Button>
            <Button disabled={isSaving || isPublishing} onClick={() => void validateDraft()} size="sm" type="button" variant="outline">
              Validate
            </Button>
            <Button disabled={isSaving || isPublishing} onClick={() => void saveDraft()} size="sm" type="button" variant="outline">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button disabled={isSaving || isPublishing} onClick={() => void publishDraft()} size="sm" type="button">
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
        {validation ? (
          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <IssueList issues={validation.errors} title="Blocking errors" tone="error" />
            <IssueList issues={validation.warnings} title="Warnings" tone="warning" />
            {validation.isValid && validation.warnings.length === 0 ? (
              <div className="rounded-control border border-success/20 bg-success/10 px-3 py-2 text-label text-success">
                Dashboard passes publish validation with no warnings.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <ClientPeriodDataTrustSection
            clients={clients}
            form={form}
            updateForm={updateForm}
          />
          <ExecutiveSummarySection
            form={form}
            updateExecutiveSummary={updateExecutiveSummary}
          />
          <HeroMetricSection
            form={form}
            updateHeroMetric={updateHeroMetric}
          />
          <FunnelSection
            form={form}
            updateContent={updateContent}
          />
          <TrendSeriesSection
            addNestedArrayItem={addNestedArrayItem}
            form={form}
            removeNestedArrayItem={removeNestedArrayItem}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
            updateNestedArrayItem={updateNestedArrayItem}
          />
          <ChannelBreakdownSection
            form={form}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
          <ServiceSectionsSection
            addNestedArrayItem={addNestedArrayItem}
            form={form}
            removeNestedArrayItem={removeNestedArrayItem}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
            updateNestedArrayItem={updateNestedArrayItem}
          />
          <AgencyWorkSection
            form={form}
            updateContent={updateContent}
          />
          <KpiCardsSection
            form={form}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
          <GoalsSection
            form={form}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
          <InsightsSection
            form={form}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
          <NextActionsSection
            form={form}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
          <AppendixTablesSection
            addAppendixColumn={addAppendixColumn}
            addAppendixRow={addAppendixRow}
            form={form}
            removeAppendixColumn={removeAppendixColumn}
            removeAppendixRow={removeAppendixRow}
            removeArrayItem={removeArrayItem}
            updateAppendixCell={updateAppendixCell}
            updateArrayItem={updateArrayItem}
            updateContent={updateContent}
          />
        </div>

        <EditorInspector form={form} selectedClient={selectedClient} />
      </div>
    </div>
  )
}
