import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Panel, PanelBody } from '@/shared/ui'

import { reactivationColors, reactivationTrackColors } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'
import { buildTrackPerformanceModel } from './reactivationTrackPerformanceModel'

function getTrackColor(trackKey) {
  return reactivationTrackColors[trackKey] ?? reactivationColors.unknownTrack
}

function TrackRow({ row }) {
  const color = getTrackColor(row.key)

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate text-body font-medium text-text-secondary">{row.label}</span>
      </div>

      <div className="shrink-0 text-body font-semibold text-text-primary">
        {row.value}
        <span className="ml-1 font-medium text-text-muted">({row.percentage}%)</span>
      </div>
    </div>
  )
}

export function ReactivationTrackPerformanceCard({ funnelChart, model: providedModel }) {
  const model = providedModel ?? buildTrackPerformanceModel(funnelChart)

  if (!model) {
    return null
  }

  return (
    <Panel className="h-full">
      <PanelBody className="flex h-full flex-col p-6">
        <div>
          <h3 className={reactivationText.sectionTitle}>Performance by Track</h3>
          <p className={`mt-1 ${reactivationText.sectionSubtitle}`}>
            Which message sequences converted best.
          </p>
        </div>

        <div className="relative mt-6 h-56">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={model.chartRows}
                dataKey="value"
                innerRadius="66%"
                isAnimationActive={false}
                nameKey="label"
                outerRadius="88%"
                paddingAngle={1}
                stroke="var(--block)"
                strokeWidth={3}
              >
                {model.chartRows.map((row) => (
                  <Cell fill={getTrackColor(row.key)} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[34px] font-semibold leading-none text-text-primary">
              {model.total}
            </span>
            <span className="mt-1 text-label font-medium text-text-muted">Bookings</span>
          </div>
        </div>

        <div className="mt-7 grid gap-4">
          {model.rows.map((row) => (
            <TrackRow key={row.id} row={row} />
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}
