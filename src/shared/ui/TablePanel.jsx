import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Panel, PanelBody, PanelHeader } from './Panel'

const toneClass = {
  blue: 'bg-action-muted text-action',
  green: 'bg-success-muted text-success-foreground',
  yellow: 'bg-warning-muted text-warning-foreground',
}

export function TablePanel({ columns, rows, title }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className={column.align === 'right' ? 'text-right' : ''} key={column.key}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id ?? row.channel ?? row.label}>
                {columns.map((column) => (
                  <TableCell className={column.align === 'right' ? 'text-right' : ''} key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelBody>
    </Panel>
  )
}

export function TableBadge({ children, tone = 'blue' }) {
  return <Badge className={toneClass[tone]} variant="outline">{children}</Badge>
}
