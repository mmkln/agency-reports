import {
  Button,
  Input,
} from '@/shared/ui'

import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import { createAppendixTable } from '../../model'
import { FormField } from './AdminPerformanceDashboardEditorPrimitives'

export function AppendixTablesSection({
  addAppendixColumn,
  addAppendixRow,
  form,
  removeAppendixColumn,
  removeAppendixRow,
  removeArrayItem,
  updateAppendixCell,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('appendix_tables', [...form.content.appendix_tables, createAppendixTable()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Table
        </Button>
      )}
      description="Optional drill-down tables for top campaigns, pages, ads, keywords, or other appendix detail."
      iconName="grid"
      title="Appendix / Top Performer Tables"
    >
      <div className="grid gap-3">
        {form.content.appendix_tables.length ? form.content.appendix_tables.map((table, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={table.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Table {index + 1}</p>
              <Button onClick={() => removeArrayItem('appendix_tables', table.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3">
              <FormField label="Title">
                <Input
                  aria-label="Appendix table title"
                  onChange={(event) => updateArrayItem('appendix_tables', table.id, 'title', event.target.value)}
                  value={table.title ?? ''}
                />
              </FormField>
              <AppendixColumnsEditor
                columns={table.columns ?? []}
                onAdd={() => addAppendixColumn(table.id)}
                onRemove={(columnId) => removeAppendixColumn(table.id, columnId)}
                onUpdate={(columnId, value) => updateNestedAppendixColumn({
                  form,
                  tableId: table.id,
                  columnId,
                  updateContent,
                  value,
                })}
              />
              <AppendixRowsEditor
                columns={table.columns ?? []}
                onAddRow={() => addAppendixRow(table.id)}
                onRemoveRow={(rowId) => removeAppendixRow(table.id, rowId)}
                onUpdateCell={(rowId, cellId, value) => updateAppendixCell(table.id, rowId, cellId, value)}
                rows={table.rows ?? []}
              />
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No appendix tables yet">
            Add drill-down tables only when the client needs detail below the executive dashboard.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

function updateNestedAppendixColumn({
  columnId,
  form,
  tableId,
  updateContent,
  value,
}) {
  updateContent(
    'appendix_tables',
    form.content.appendix_tables.map((table) => (
      table.id === tableId
        ? {
          ...table,
          columns: table.columns.map((column) => (
            column.id === columnId ? { ...column, label: value } : column
          )),
        }
        : table
    )),
  )
}

function AppendixColumnsEditor({
  columns,
  onAdd,
  onRemove,
  onUpdate,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">Columns</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          Add Column
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {columns.length ? columns.map((column) => (
          <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={column.id}>
            <Input
              aria-label="Column label"
              onChange={(event) => onUpdate(column.id, event.target.value)}
              placeholder="Campaign"
              value={column.label ?? ''}
            />
            <Button onClick={() => onRemove(column.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No columns yet">
            Add column names before entering table rows.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

function AppendixRowsEditor({
  columns,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
  rows,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">Rows</p>
        <Button disabled={!columns.length} onClick={onAddRow} size="sm" type="button" variant="outline">
          Add Row
        </Button>
      </div>
      <div className="mt-3 grid gap-3">
        {!columns.length ? (
          <InlineEmptyState iconName="grid" title="Columns required">
            Create at least one column before adding appendix rows.
          </InlineEmptyState>
        ) : rows.length ? rows.map((row, rowIndex) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Row {rowIndex + 1}</p>
              <Button onClick={() => onRemoveRow(row.id)} size="sm" type="button" variant="ghost">
                Remove
              </Button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {columns.map((column, columnIndex) => {
                const cell = row.cells[columnIndex] ?? {
                  id: `${row.id}-${column.id}`,
                  value: '',
                }

                return (
                  <FormField key={`${row.id}-${column.id}`} label={column.label || `Column ${columnIndex + 1}`}>
                    <Input
                      aria-label={`${column.label || `Column ${columnIndex + 1}`} cell`}
                      onChange={(event) => onUpdateCell(row.id, cell.id, event.target.value)}
                      value={cell.value ?? ''}
                    />
                  </FormField>
                )
              })}
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No rows yet">
            Add rows for top campaigns, pages, ads, keywords, or other useful client detail.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}
