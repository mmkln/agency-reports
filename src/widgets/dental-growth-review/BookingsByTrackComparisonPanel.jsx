import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Panel, PanelBody } from '@/shared/ui'

import {
  buildBookingsByTrackComparisonModel,
  formatTrackMetricValue,
  trackMetricColumns,
} from './bookingsByTrackComparisonModel'
import { reactivationColors, reactivationTrackColors } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'

const DEFAULT_SELECTED_COLUMN = 'booked'

function TrackMetricDonut({ chart }) {
  return (
    <div className="relative h-64 min-w-0">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={chart.rows}
            dataKey="value"
            innerRadius="66%"
            isAnimationActive={false}
            nameKey="label"
            outerRadius="88%"
            paddingAngle={1}
            stroke="var(--block)"
            strokeWidth={3}
          >
            {chart.rows.map((row) => (
              <Cell fill={row.color} key={row.id} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-semibold leading-none text-text-primary">
          {chart.centerValue}
        </span>
        <span className="mt-1 text-label font-medium text-text-muted">{chart.centerLabel}</span>
      </div>
    </div>
  )
}

function TrackMetricCell({ column, row, selected }) {
  const value = formatTrackMetricValue(row[column.key], column.format)

  return (
    <td className={`border-t border-separator px-control py-control text-right tabular-nums ${
      selected ? 'bg-fill-secondary font-semibold text-text-primary' : 'text-text-primary'
    }`}>
      {value}
    </td>
  )
}

function TrackMetricTable({
  model,
  onSelectColumn,
  selectedColumnKey,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] border-separate border-spacing-0 text-left">
        <thead>
          <tr className="text-label font-medium text-text-muted">
            <th className="pb-control pr-control font-medium">Track</th>
            {trackMetricColumns.map((column) => {
              const selected = selectedColumnKey === column.key

              return (
                <th className="px-control pb-control text-right font-medium" key={column.key}>
                  <button
                    className={`rounded-control px-tag py-micro transition-colors ${
                      selected
                        ? 'bg-fill-secondary text-text-primary'
                        : 'text-text-muted hover:bg-fill-secondary hover:text-text-primary'
                    }`}
                    onClick={() => onSelectColumn(column.key)}
                    type="button"
                  >
                    {column.label}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {model.rows.map((row) => (
            <tr className="text-label" key={row.id}>
              <th className="border-t border-separator py-control pr-control font-medium text-text-primary">
                <span className="inline-flex items-center gap-tag">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  {row.label}
                </span>
              </th>
              {trackMetricColumns.map((column) => (
                <TrackMetricCell
                  column={column}
                  key={column.key}
                  row={row}
                  selected={selectedColumnKey === column.key}
                />
              ))}
            </tr>
          ))}
          <tr className="text-label font-semibold">
            <th className="border-t border-separator py-control pr-control font-semibold text-text-primary">
              Total
            </th>
            {trackMetricColumns.map((column) => (
              <td
                className={`border-t border-separator px-control py-control text-right tabular-nums ${
                  selectedColumnKey === column.key ? 'bg-fill-secondary text-text-primary' : 'text-text-primary'
                }`}
                key={column.key}
              >
                {formatTrackMetricValue(model.totals[column.key], column.format)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function BookingsByTrackComparisonPanel({ funnelChart = null }) {
  const [selectedColumnKey, setSelectedColumnKey] = useState(DEFAULT_SELECTED_COLUMN)
  const model = useMemo(() => buildBookingsByTrackComparisonModel({
    colorsByTrack: {
      ...reactivationTrackColors,
      unknown: reactivationColors.unknownTrack,
    },
    funnelChart,
  }), [funnelChart])

  if (!model) {
    return null
  }

  const chart = model.getChartRows(selectedColumnKey)

  return (
    <Panel>
      <PanelBody className="p-6">
        <div>
          <h3 className={reactivationText.sectionTitle}>Bookings by Track</h3>
          <p className={`mt-1 ${reactivationText.sectionSubtitle}`}>
            Select a table column to compare track distribution.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-center">
          <TrackMetricDonut chart={chart} />
          <TrackMetricTable
            model={model}
            onSelectColumn={setSelectedColumnKey}
            selectedColumnKey={selectedColumnKey}
          />
        </div>
      </PanelBody>
    </Panel>
  )
}
