import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { chartColorSequence, chartColors } from '@/shared/theme'
import {
  Panel,
  PanelBody,
  PanelHeader,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { AnalyticsExplanationPopover } from './AnalyticsExplanationPopover'

function getRowColor(row, index) {
  if (row.key === 'unattributed') {
    return chartColors.slate
  }

  return chartColorSequence[index % chartColorSequence.length]
}

function buildBreakdownRows(rows, total) {
  return rows.map((row, index) => {
    const value = Math.max(Number(row.value) || 0, 0)

    return {
      ...row,
      color: getRowColor(row, index),
      percentage: total > 0 ? (value / total) * 100 : 0,
      value,
    }
  })
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function BreakdownDonut({ rows, total }) {
  const chartRows = rows.filter((row) => row.value > 0)

  return (
    <div className="relative h-64 min-w-0">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={chartRows}
            dataKey="value"
            innerRadius="66%"
            isAnimationActive={false}
            nameKey="label"
            outerRadius="88%"
            paddingAngle={1}
            stroke="var(--block)"
            strokeWidth={3}
          >
            {chartRows.map((row) => <Cell fill={row.color} key={row.key} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-semibold leading-none tabular-nums text-text-primary">
          {total.toLocaleString()}
        </span>
        <span className="mt-1 text-label font-medium text-text-muted">Leads</span>
      </div>
    </div>
  )
}

function SourceLabel({ row }) {
  return (
    <span className="flex min-w-0 items-center gap-tag">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: row.color }}
      />
      <span className="truncate" title={row.label}>{row.label}</span>
    </span>
  )
}

function BreakdownTable({ rows, total }) {
  return (
    <Table className="min-w-[420px]">
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Leads</TableHead>
          <TableHead className="text-right">% of total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="max-w-64 font-medium text-text-primary">
              <SourceLabel row={row} />
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-text-primary">
              {row.value.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums text-text-muted">
              {formatPercent(row.percentage)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold text-text-primary">Total</TableCell>
          <TableCell className="text-right font-semibold tabular-nums text-text-primary">
            {total.toLocaleString()}
          </TableCell>
          <TableCell className="text-right font-medium tabular-nums text-text-muted">
            {formatPercent(total ? 100 : 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export function AnalyticsBreakdownWidget({ data, title }) {
  const total = Math.max(Number(data?.total) || 0, 0)
  const rows = buildBreakdownRows(data?.rows ?? [], total)

  return (
    <Panel>
      <PanelHeader
        action={<AnalyticsExplanationPopover explanation={data?.explanation} label={title} />}
        title={title}
      />
      <PanelBody>
        {rows.length ? (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-center">
            <BreakdownDonut rows={rows} total={total} />
            <BreakdownTable rows={rows} total={total} />
          </div>
        ) : (
          <p className="text-ui text-text-muted">No attributed leads in this period.</p>
        )}
      </PanelBody>
    </Panel>
  )
}
