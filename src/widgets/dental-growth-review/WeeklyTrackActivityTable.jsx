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
    <TableCell className={`px-tag text-center tabular-nums ${
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

function TrackMetricCells({ isLastGroup = false, metrics, values }) {
  return metrics.map((metric, index) => (
    <NumericCell
      groupEnd={!isLastGroup && index === metrics.length - 1}
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
      <Table aria-label="Weekly reactivation activity by track" className="w-full min-w-[760px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 border-r border-separator px-tag" />
            {model.tracks.map((track, index) => (
              <TableHead
                className={`${index === model.tracks.length - 1 ? '' : 'border-r border-separator'} px-tag text-center font-semibold text-text-primary`}
                colSpan={model.metrics.length}
                key={track.id ?? track.key}
              >
                <TrackGroupHeader color={track.color} label={track.label} />
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead className="w-16 border-r border-separator px-tag">
              Week
            </TableHead>
            {model.tracks.flatMap((track, trackIndex) => model.metrics.map((metric, metricIndex) => (
              <TableHead
                className={`px-tag text-center ${
                  trackIndex !== model.tracks.length - 1 && metricIndex === model.metrics.length - 1
                    ? 'border-r border-separator'
                    : ''
                }`}
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
              <TableCell className="border-r border-separator px-tag font-semibold text-text-primary">
                {week.label}
              </TableCell>
              {model.tracks.map((track, index) => (
                <TrackMetricCells
                  isLastGroup={index === model.tracks.length - 1}
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
