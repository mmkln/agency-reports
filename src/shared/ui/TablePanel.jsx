import { Badge } from './Badge'

import { DataTable } from './DataTable'
import { Panel, PanelBody, PanelHeader } from './Panel'
import { useInspectorId } from './inspectorId'

const toneClass = {
  blue: 'border-action/20 bg-action-muted text-action',
  green: 'border-success/20 bg-success-muted text-success-foreground',
  yellow: 'border-warning/20 bg-warning-muted text-warning-foreground',
}

function isActionColumn(column) {
  return column.isAction || column.key === 'actions' || String(column.label).toLowerCase() === 'actions'
}

export function TablePanel({ columns, id, rows, title }) {
  const inspectorId = useInspectorId('TablePanel', id)
  const dataTableColumns = columns.map((column) => {
    const isAction = isActionColumn(column)

    return {
      accessorKey: column.key,
      cell: ({ row }) => (column.render ? column.render(row.original) : row.original[column.key]),
      enableSorting: false,
      header: column.label,
      id: column.key,
      meta: {
        align: column.align,
        isAction,
        label: column.label,
        nowrap: isAction,
      },
    }
  })

  return (
    <Panel id={inspectorId}>
      <PanelHeader divided title={title} />
      <PanelBody>
        <DataTable
          columns={dataTableColumns}
          data={rows}
          enablePagination={false}
          getRowId={(row) => row.id ?? row.channel ?? row.label}
        />
      </PanelBody>
    </Panel>
  )
}

export function TableBadge({ children, id, tone = 'blue' }) {
  const inspectorId = useInspectorId('TableBadge', id)

  return <Badge id={inspectorId} className={toneClass[tone]} variant="outline">{children}</Badge>
}
