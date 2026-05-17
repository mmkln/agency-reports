import { Badge } from './Badge'
import {
  Table,
  TableActionCell,
  TableActionHead,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

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

  return (
    <Panel id={inspectorId}>
      <PanelHeader divided title={title} />
      <PanelBody>
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const HeaderCell = isActionColumn(column) ? TableActionHead : TableHead

                return (
                  <HeaderCell className={column.align === 'right' ? 'text-right' : ''} key={column.key}>
                    {column.label}
                  </HeaderCell>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id ?? row.channel ?? row.label}>
                {columns.map((column) => {
                  const BodyCell = isActionColumn(column) ? TableActionCell : TableCell

                  return (
                    <BodyCell
                      className={cn(
                        column.align === 'right' ? 'text-right' : '',
                        isActionColumn(column) ? 'group-hover/table-row:bg-control-hover' : '',
                      )}
                      key={column.key}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </BodyCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  )
}

export function TableBadge({ children, id, tone = 'blue' }) {
  const inspectorId = useInspectorId('TableBadge', id)

  return <Badge id={inspectorId} className={toneClass[tone]} variant="outline">{children}</Badge>
}
