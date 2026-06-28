import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { ReactivationChartPanel } from './ReactivationChartPanel'
import { reactivationColors } from './reactivationChartTheme'

const channelConfig = [
  {
    color: reactivationColors.sms,
    key: 'sms',
    label: 'SMS',
  },
  {
    color: reactivationColors.email,
    key: 'email',
    label: 'Email',
  },
]

function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`
}

function getSegmentWidth(value, maxTotal) {
  if (!value || !maxTotal) {
    return '0%'
  }

  return `${(value / maxTotal) * 100}%`
}

function ChannelHeading({ channel }) {
  return (
    <span className="inline-flex items-center gap-tag">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: channel.color }}
      />
      {channel.label}
    </span>
  )
}

function ChannelSegment({ color, maxTotal, value }) {
  const resolvedValue = Number(value) || 0

  if (!resolvedValue) {
    return null
  }

  return (
    <div
      className="flex h-3 min-w-7 items-center justify-end rounded-full pr-tag"
      style={{
        backgroundColor: color,
        width: getSegmentWidth(resolvedValue, maxTotal),
      }}
    >
      <span className="text-[10px] font-semibold leading-none tabular-nums text-white">
        {resolvedValue}
      </span>
    </div>
  )
}

function ChannelCluster({ maxTotal, row }) {
  if (!row.total) {
    return <span className="text-label font-medium tabular-nums text-text-muted">0</span>
  }

  return (
    <div className="flex h-6 items-center gap-tag">
      {channelConfig.map((channel) => (
        <ChannelSegment
          color={channel.color}
          key={channel.key}
          maxTotal={maxTotal}
          value={row[channel.key]}
        />
      ))}
    </div>
  )
}

function ReplyChannelRow({ maxTotal, row }) {
  return (
    <TableRow>
      <TableCell className="font-semibold text-text-primary">
        {row.trackLabel || (row.track ? `Track ${row.track}` : 'Unknown')}
      </TableCell>
      <TableCell>
        <ChannelCluster maxTotal={maxTotal} row={row} />
      </TableCell>
      <TableCell className="text-right font-semibold tabular-nums text-text-primary">
        {row.total}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums text-text-muted">
        {formatPercent(row.percentOfTotal)}
      </TableCell>
    </TableRow>
  )
}

export function BookedAppointmentsByReplyChannel({ chart }) {
  if (!chart?.available) {
    return null
  }

  const rows = chart.rows ?? []
  const totals = chart.totals ?? {}
  const maxTotal = Math.max(...rows.map((row) => Number(row.total) || 0), 1)

  if (!rows.length && !totals.total) {
    return null
  }

  return (
    <ReactivationChartPanel
      title="Breakdown by Track"
    >
      <div className="overflow-hidden rounded-control border border-separator">
        <Table className="min-w-[720px] table-fixed">
          <colgroup>
            <col className="w-[170px]" />
            <col />
            <col className="w-[96px]" />
            <col className="w-[112px]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Track</TableHead>
              <TableHead>
                <div className="flex items-center gap-10">
                  {channelConfig.map((channel) => (
                    <ChannelHeading channel={channel} key={channel.key} />
                  ))}
                </div>
              </TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">% of total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ReplyChannelRow
                key={row.track || row.trackLabel}
                maxTotal={maxTotal}
                row={row}
              />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold text-text-primary">Total</TableCell>
              <TableCell className="font-semibold tabular-nums text-text-primary">
                <div className="flex items-center gap-10">
                  {channelConfig.map((channel) => (
                    <span key={channel.key}>{totals[channel.key] ?? 0}</span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-text-primary">
                {totals.total ?? 0}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums text-text-muted">
                {formatPercent(totals.percentOfTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {totals.unattributed ? (
        <p className="mt-control text-label font-normal text-text-muted">
          {totals.unattributed} booked appointments do not have SMS or Email reply channel tags.
        </p>
      ) : null}
    </ReactivationChartPanel>
  )
}
