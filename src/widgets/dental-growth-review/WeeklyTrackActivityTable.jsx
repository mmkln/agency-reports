import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { ReactivationChartPanel } from './ReactivationChartPanel'
import {
  buildWeeklyTrackActivityModel,
  formatWeeklyTrackActivityNumber,
} from './weeklyTrackActivityModel'

function NumericCell({ children, groupEnd = false, strong = false }) {
  return (
    <TableCell className={`text-right tabular-nums ${
      strong ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
    } ${groupEnd ? 'border-r border-separator' : ''}`}>
      {children}
    </TableCell>
  )
}

function TrackGroupHeader({ color, label }) {
  return (
    <span className="inline-flex items-center justify-center gap-tag">
      {color ? (
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      <span>{label}</span>
    </span>
  )
}

function TrackMetricCells({ metrics, values }) {
  return metrics.map((metric, index) => (
    <NumericCell
      groupEnd={index === metrics.length - 1}
      key={metric.key}
      strong={metric.key === 'total'}
    >
      {formatWeeklyTrackActivityNumber(values?.[metric.key])}
    </NumericCell>
  ))
}

export function WeeklyTrackActivityTable({ section }) {
  const model = buildWeeklyTrackActivityModel(section)

  if (!model) {
    return null
  }

  return (
    <ReactivationChartPanel
      subtitle={model.subtitle}
      title={model.title}
    >
      <Table aria-label="Weekly reactivation activity by track" className="min-w-[1320px]">
        <TableHeader>
          <TableRow>
            <TableHead className="border-r border-separator" />
            {model.tracks.map((track) => (
              <TableHead
                className="border-r border-separator text-center font-semibold text-text-primary"
                colSpan={model.metrics.length}
                key={track.id ?? track.key}
              >
                <TrackGroupHeader color={track.color} label={track.label} />
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead className="border-r border-separator">
              Week
            </TableHead>
            {model.tracks.flatMap((track) => model.metrics.map((metric, index) => (
              <TableHead
                className={`text-right ${index === model.metrics.length - 1 ? 'border-r border-separator' : ''}`}
                key={`${track.key}-${metric.key}`}
              >
                {metric.label}
              </TableHead>
            )))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {model.pivotWeeks.map((week) => (
            <TableRow key={week.id}>
              <TableCell className="border-r border-separator font-medium text-text-primary">
                {week.label}
              </TableCell>
              {model.tracks.map((track) => (
                <TrackMetricCells
                  key={track.key}
                  metrics={model.metrics}
                  values={week.tracks[track.key]}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReactivationChartPanel>
  )
}
