import { Icon } from '@/shared/icons'
import { semanticColors } from '@/shared/theme'

import { ReactivationChartPanel } from './ReactivationChartPanel'
import {
  buildWeeklyTrackActivityModel,
  formatWeeklyTrackActivityNumber,
} from './weeklyTrackActivityModel'

function getCellStyle(channel, intensity) {
  const colorMix = Math.round(8 + (intensity * 72))
  const strongCell = intensity >= 0.58

  return {
    backgroundColor: `color-mix(in srgb, ${channel.color} ${colorMix}%, transparent)`,
    color: strongCell ? '#fff' : semanticColors.textPrimary,
  }
}

function HeatmapCell({ channel, value }) {
  return (
    <div
      className="flex min-h-20 items-center justify-center border-l border-t border-separator text-heading font-medium tabular-nums"
      style={getCellStyle(channel, value.intensity)}
    >
      {formatWeeklyTrackActivityNumber(value.value)}
    </div>
  )
}

function TrackLabel({ color, label }) {
  return (
    <div className="flex min-h-20 items-center gap-tag border-t border-separator px-control text-ui font-medium text-text-primary">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{label}</span>
    </div>
  )
}

function WeekHeaderCell({ week }) {
  return (
    <div className="flex min-h-14 flex-col items-center justify-center border-l border-separator px-tag text-center">
      <span className="text-ui font-semibold text-text-primary">{week.label}</span>
    </div>
  )
}

function TotalCell({ value }) {
  return (
    <div className="flex min-h-16 items-center justify-center border-l border-t border-separator bg-fill-secondary text-heading font-semibold tabular-nums text-text-primary">
      {formatWeeklyTrackActivityNumber(value)}
    </div>
  )
}

function SharedTrackAxisColumn({ tracks }) {
  return (
    <div className="overflow-hidden rounded-l-block border border-separator bg-block">
      <div className="min-h-[4.25rem]" />
      <div className="min-h-14 border-t border-separator" />
      {tracks.map((track) => (
        <TrackLabel color={track.color} key={track.key} label={track.label} />
      ))}
      <div className="flex min-h-16 items-center px-control text-ui font-semibold text-text-primary">
        Total
      </div>
    </div>
  )
}

function ChannelMatrix({ channel, isLast = false, weeks }) {
  const gridTemplateColumns = `repeat(${weeks.length}, minmax(3.5rem, 1fr))`

  return (
    <section className={`overflow-hidden border-y border-r border-separator bg-block ${isLast ? 'rounded-r-block' : ''}`}>
      <header className="flex min-h-[4.25rem] items-center gap-control px-control">
        <span
          className="flex size-9 items-center justify-center rounded-control text-white"
          style={{ backgroundColor: channel.color }}
        >
          <Icon name={channel.iconName} size={19} />
        </span>
        <h3 className="text-heading font-semibold text-text-primary">{channel.label}</h3>
      </header>

      <div
        className="grid border-t border-separator"
        style={{ gridTemplateColumns }}
      >
        {weeks.map((week) => (
          <WeekHeaderCell key={week.key} week={week} />
        ))}

        {channel.rows.map((row) => row.cells.map((cell) => (
          <HeatmapCell channel={channel} key={cell.id} value={cell} />
        )))}

        {channel.totals.map((total) => (
          <TotalCell key={total.id} value={total.value} />
        ))}
      </div>
    </section>
  )
}

function IntensityLegend({ channels }) {
  return (
    <div className="flex flex-col items-center gap-3 pt-control text-label text-text-muted">
      <span>Intensity scale by channel</span>
      <div className="flex flex-wrap justify-center gap-6">
        {channels.map((channel) => (
          <div className="flex items-center gap-tag" key={channel.key}>
            <span>0</span>
            <span
              className="h-3 w-28 rounded-full"
              style={{
                background: `linear-gradient(90deg, color-mix(in srgb, ${channel.color} 8%, transparent), ${channel.color})`,
              }}
            />
            <span>{formatWeeklyTrackActivityNumber(channel.max)}</span>
          </div>
        ))}
      </div>
      <span>Darker cells indicate more touches within each channel.</span>
    </div>
  )
}

export function WeeklyTrackActivityHeatmap({ explanation, explanationEditor, section }) {
  const model = buildWeeklyTrackActivityModel(section)

  if (!model) {
    return null
  }

  return (
    <ReactivationChartPanel
      chartKey="weekly_track_activity"
      explanation={explanation}
      explanationEditor={explanationEditor}
      subtitle={model.subtitle}
      title={model.title}
    >
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[760px]"
          style={{
            gridTemplateColumns: `7.5rem repeat(${model.channels.length}, minmax(12.5rem, 1fr))`,
          }}
        >
          <SharedTrackAxisColumn tracks={model.tracks} />
          {model.channels.map((channel, index) => (
            <ChannelMatrix
              channel={channel}
              isLast={index === model.channels.length - 1}
              key={channel.key}
              weeks={model.weeks}
            />
          ))}
        </div>
      </div>
      <IntensityLegend channels={model.channels} />
    </ReactivationChartPanel>
  )
}
