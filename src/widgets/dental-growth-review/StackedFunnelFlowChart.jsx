import { chartColorSequence } from '@/shared/theme/chartColors'

const TRACK_COLORS = {
  A: 'var(--chart-1)',
  B: 'var(--chart-5)',
  C: 'var(--chart-4)',
  R: 'var(--text-quaternary)',
  unknown: 'var(--text-quaternary)',
}

const CHART_WIDTH = 1000
const CHART_HEIGHT = 300
const CHART_X_START = 48
const CHART_X_END = 952
const CHART_CENTER_Y = 166
const MAX_STACK_THICKNESS = 190

export function StackedFunnelFlowChart({
  onOpenStageDetails,
  series = [],
  showCohortPercent = false,
  stages = [],
}) {
  const chartModel = buildStackedFunnelModel({ series, stages })

  if (!chartModel.layers.length || !chartModel.stages.length) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-block">
      <div className="min-w-[760px]">
        <StackedFunnelHeader
          onOpenStageDetails={onOpenStageDetails}
          showCohortPercent={showCohortPercent}
          stages={chartModel.stages}
        />
        <StackedFunnelSvg
          layers={chartModel.layers}
          onOpenStageDetails={onOpenStageDetails}
          stages={chartModel.stages}
        />
        <StackedFunnelLegend series={chartModel.series} />
      </div>
    </div>
  )
}

function buildStackedFunnelModel({ series, stages }) {
  const normalizedStages = stages.map((stage) => ({
    count: toNumber(stage.stage_count),
    id: String(stage.stage_id ?? stage.id ?? stage.stage_name ?? ''),
    label: String(stage.stage_name ?? stage.name ?? ''),
    source: stage,
  }))
  const normalizedSeries = series.map((track, index) => ({
    color: TRACK_COLORS[track.key] ?? chartColorSequence[index % chartColorSequence.length] ?? TRACK_COLORS.unknown,
    id: String(track.id ?? track.key ?? `track-${index}`),
    key: String(track.key ?? track.id ?? `track-${index}`),
    label: String(track.label ?? track.key ?? `Track ${index + 1}`),
    stages: normalizedStages.map((stage) => {
      const matchingStage = track.stages?.find((item) => (
        String(item.stage_id ?? item.id ?? item.stage_name ?? '') === stage.id
      ))

      return {
        count: toNumber(matchingStage?.stage_count),
        source: matchingStage,
        stageId: stage.id,
      }
    }),
  }))

  return {
    layers: buildStackedLayers({
      series: normalizedSeries,
      stages: normalizedStages,
    }),
    series: normalizedSeries,
    stages: normalizedStages,
  }
}

function buildStackedLayers({ series, stages }) {
  const maxTotal = Math.max(...stages.map((stage, stageIndex) => (
    Math.max(stage.count, sumSeriesAtStage(series, stageIndex))
  )), 1)
  const sectionWidth = stages.length > 1
    ? (CHART_X_END - CHART_X_START) / (stages.length - 1)
    : 0
  const stageStacks = stages.map((stage, stageIndex) => {
    const stageSeriesTotal = sumSeriesAtStage(series, stageIndex)
    const stageTotal = Math.max(stage.count, stageSeriesTotal)
    const totalThickness = (stageTotal / maxTotal) * MAX_STACK_THICKNESS
    let cursor = CHART_CENTER_Y - (totalThickness / 2)

    return {
      stage,
      x: CHART_X_START + (sectionWidth * stageIndex),
      segments: series.map((track) => {
        const value = track.stages[stageIndex]?.count ?? 0
        const thickness = stageTotal > 0 ? (value / stageTotal) * totalThickness : 0
        const segment = {
          bottom: cursor + thickness,
          top: cursor,
          value,
        }

        cursor += thickness
        return segment
      }),
    }
  })

  return series.map((track, trackIndex) => ({
    color: track.color,
    id: track.id,
    key: track.key,
    label: track.label,
    points: stageStacks.map((stack) => ({
      bottom: stack.segments[trackIndex].bottom,
      stage: stack.stage.source,
      top: stack.segments[trackIndex].top,
      value: stack.segments[trackIndex].value,
      x: stack.x,
    })),
  }))
}

function StackedFunnelHeader({ onOpenStageDetails, showCohortPercent, stages }) {
  const cohortCount = stages[0]?.count ?? 0

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(120px, 1fr))` }}
    >
      {stages.map((stage, index) => (
        <button
          className="min-w-0 rounded-control px-control py-item text-center transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          key={stage.id}
          onClick={() => onOpenStageDetails?.(stage.source)}
          type="button"
        >
          <p className="text-data tabular-nums text-text-primary">{stage.count}</p>
          <p className="mt-tag text-label font-semibold text-text-secondary">{stage.label}</p>
          {showCohortPercent && index > 0 && cohortCount > 0 ? (
            <p className="mt-tag text-label font-normal text-text-muted">
              {formatCohortPercent(stage.count, cohortCount)}
            </p>
          ) : null}
        </button>
      ))}
    </div>
  )
}

function formatCohortPercent(stageCount, cohortCount) {
  const percent = (stageCount / cohortCount) * 100

  return percent >= 10 ? `${Math.round(percent)}%` : `${percent.toFixed(1)}%`
}

function StackedFunnelSvg({ layers, onOpenStageDetails, stages }) {
  return (
    <svg
      aria-label="Reactivation lifecycle funnel by track"
      className="mt-component h-[300px] w-full overflow-visible"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      {layers.map((layer) => {
        const path = buildLayerPath(layer.points)
        const hasValue = layer.points.some((point) => point.value > 0)

        if (!path || !hasValue) {
          return null
        }

        return (
          <path
            d={path}
            fill={layer.color}
            key={layer.id}
            opacity="0.56"
          >
            <title>{layer.label}</title>
          </path>
        )
      })}
      {stages.slice(1, -1).map((stage) => (
        <line
          className="text-text-primary/10"
          key={`stacked-funnel-boundary-${stage.id}`}
          stroke="currentColor"
          strokeWidth="1"
          x1={stagePointX(stages, stage)}
          x2={stagePointX(stages, stage)}
          y1="10"
          y2="290"
        />
      ))}
      {stages.map((stage) => (
        <rect
          aria-label={`View ${stage.label} details`}
          className="cursor-pointer fill-transparent"
          height={CHART_HEIGHT}
          key={`stacked-funnel-hit-${stage.id}`}
          onClick={() => onOpenStageDetails?.(stage.source)}
          width={CHART_WIDTH / Math.max(stages.length, 1)}
          x={stagePointX(stages, stage) - ((CHART_WIDTH / Math.max(stages.length, 1)) / 2)}
          y="0"
        />
      ))}
    </svg>
  )
}

function StackedFunnelLegend({ series }) {
  return (
    <div className="mt-control flex flex-wrap justify-center gap-control">
      {series.map((track) => (
        <span
          className="inline-flex items-center gap-tag text-label font-medium text-text-muted"
          key={track.id}
        >
          <span
            aria-hidden="true"
            className="size-2 rounded-full opacity-70"
            style={{ backgroundColor: track.color }}
          />
          {track.label}
        </span>
      ))}
    </div>
  )
}

function buildLayerPath(points) {
  if (!points.length) {
    return ''
  }

  const topPath = buildCurvePath(points, (point) => point.top)
  const reversed = [...points].reverse()
  const last = points[points.length - 1]
  const bottomPath = buildCurvePath(
    reversed,
    (point) => point.bottom,
  ).replace(/^M\s+[\d.-]+\s+[\d.-]+/, `L ${last.x} ${last.bottom}`)

  return `${topPath} ${bottomPath} Z`
}

function buildCurvePath(points, getY) {
  if (!points.length) {
    return ''
  }

  if (points.length === 1) {
    const point = points[0]
    const y = getY(point)

    return `M ${point.x - 120} ${y} L ${point.x + 120} ${y}`
  }

  const first = points[0]
  let path = `M ${first.x} ${getY(first)}`

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const previousY = getY(previous)
    const currentY = getY(current)
    const segmentControl = (current.x - previous.x) * 0.32
    const controlOneX = previous.x + segmentControl
    const controlTwoX = current.x - segmentControl

    path += ` C ${controlOneX} ${previousY}, ${controlTwoX} ${currentY}, ${current.x} ${currentY}`
  }

  return path
}

function stagePointX(stages, stage) {
  const index = stages.findIndex((item) => item.id === stage.id)
  const sectionWidth = stages.length > 1
    ? (CHART_X_END - CHART_X_START) / (stages.length - 1)
    : 0

  return CHART_X_START + (sectionWidth * Math.max(index, 0))
}

function sumSeriesAtStage(series, stageIndex) {
  return series.reduce((total, track) => total + (track.stages[stageIndex]?.count ?? 0), 0)
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(number, 0) : 0
}
