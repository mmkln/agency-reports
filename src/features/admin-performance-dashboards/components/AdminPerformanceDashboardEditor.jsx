import { useMemo, useState } from 'react'
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
  createAppendixCell,
  createAppendixColumn,
  createAppendixRow,
  formatPeriod,
  periodToForm,
  useAdminPerformanceDashboardEditorActions,
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
  const [form, setForm] = useState(() => periodToForm(initialPeriod))
  const [validation, setValidation] = useState(null)
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId) ?? initialPeriod.client,
    [clients, form.clientId, initialPeriod.client],
  )
  const { isPublishing, isSaving, publishDraft, saveDraft, validateDraft } = useAdminPerformanceDashboardEditorActions({
    form,
    runtime,
    setForm,
    setValidation,
    toast,
  })
  const previewHref = `/admin/client-performance-preview?clientId=${form.clientId}&performancePeriodId=${form.id}`

  function updateForm(patch) {
    setForm((currentForm) => ({
      ...currentForm,
      ...patch,
    }))
  }

  function updateContent(path, valueOrUpdater) {
    setForm((currentForm) => ({
      ...currentForm,
      content: {
        ...currentForm.content,
        [path]: typeof valueOrUpdater === 'function'
          ? valueOrUpdater(currentForm.content[path], currentForm)
          : valueOrUpdater,
      },
    }))
  }

  function updateExecutiveSummary(field, value) {
    updateContent('executive_summary', (currentSummary) => ({
      ...currentSummary,
      [field]: value,
    }))
  }

  function updateHeroMetric(field, value) {
    updateContent('hero_metric', (currentHeroMetric) => ({
      ...currentHeroMetric,
      [field]: value,
    }))
  }

  function updateArrayItem(collectionName, itemId, field, value) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId ? { ...item, [field]: value } : item
      )),
    )
  }

  function removeArrayItem(collectionName, itemId) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.filter((item) => item.id !== itemId),
    )
  }

  function updateNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItemId, field, value) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: item[nestedCollectionName].map((nestedItem) => (
              nestedItem.id === nestedItemId ? { ...nestedItem, [field]: value } : nestedItem
            )),
          }
          : item
      )),
    )
  }

  function addNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItem) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: [...item[nestedCollectionName], nestedItem],
          }
          : item
      )),
    )
  }

  function removeNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItemId) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: item[nestedCollectionName].filter((nestedItem) => nestedItem.id !== nestedItemId),
          }
          : item
      )),
    )
  }

  function addAppendixColumn(tableId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            columns: [...table.columns, createAppendixColumn()],
            rows: table.rows.map((row) => ({
              ...row,
              cells: [...row.cells, createAppendixCell()],
            })),
          }
          : table
      )),
    )
  }

  function removeAppendixColumn(tableId, columnId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        const columnIndex = table.columns.findIndex((column) => column.id === columnId)

        return {
          ...table,
          columns: table.columns.filter((column) => column.id !== columnId),
          rows: table.rows.map((row) => ({
            ...row,
            cells: columnIndex >= 0
              ? row.cells.filter((_, index) => index !== columnIndex)
              : row.cells,
          })),
        }
      }),
    )
  }

  function addAppendixRow(tableId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: [...table.rows, createAppendixRow(table.columns.length)],
          }
          : table
      )),
    )
  }

  function removeAppendixRow(tableId, rowId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: table.rows.filter((row) => row.id !== rowId),
          }
          : table
      )),
    )
  }

  function updateAppendixCell(tableId, rowId, cellId, value) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: table.rows.map((row) => (
              row.id === rowId
                ? {
                  ...row,
                  cells: row.cells.map((cell) => (
                    cell.id === cellId ? { ...cell, value } : cell
                  )),
                }
                : row
            )),
          }
          : table
      )),
    )
  }

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
              <span>{selectedClient?.name ?? 'Client'}</span>
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
