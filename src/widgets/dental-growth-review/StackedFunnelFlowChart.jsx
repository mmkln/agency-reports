import { useEffect, useMemo, useRef, useState } from 'react'

import { chartColorSequence } from '@/shared/theme/chartColors'
import { Button } from '@/shared/ui'

const TRACK_COLORS = {
  A: '#a5b4fc',
  B: '#38bdf8',
  C: '#c084fc',
  R: '#cbd5e1',
  unknown: 'var(--text-quaternary)',
}

const CHART_WIDTH = 1000
const CHART_HEIGHT = 320
const CHART_X_START = 50
const CHART_X_END = 950
const CHART_CENTER_Y = 166
const MAX_STACK_THICKNESS = 150
const MIN_VISIBLE_THICKNESS = 6
const MORPH_DURATION_MS = 450

const ALL_SEGMENTS_KEY = 'all'

export function StackedFunnelFlowChart({
  onOpenStageDetails,
  series = [],
  showCohortPercent = false,
  stages = [],
}) {
  const [activeSegmentKey, setActiveSegmentKey] = useState(ALL_SEGMENTS_KEY)
  const [hoverLabel, setHoverLabel] = useState('')
  const baseModel = useMemo(() => buildStackedFunnelModel({ series, stages }), [series, stages])
  const resolvedActiveSegmentKey = activeSegmentKey === ALL_SEGMENTS_KEY
    || baseModel.series.some((track) => track.id === activeSegmentKey)
    ? activeSegmentKey
    : ALL_SEGMENTS_KEY
  const activeModel = useMemo(() => (
    buildActiveFunnelModel({
      activeSegmentKey: resolvedActiveSegmentKey,
      model: baseModel,
    })
  ), [resolvedActiveSegmentKey, baseModel])
  const animatedLayers = useAnimatedLayers(activeModel.layers)

  if (!baseModel.stages.length || !activeModel.layers.length) {
    return null
  }

  return (
    <div className="grid gap-component">
      {baseModel.series.length > 1 ? (
        <SegmentSwitcher
          activeSegmentKey={resolvedActiveSegmentKey}
          onChange={setActiveSegmentKey}
          series={baseModel.series}
        />
      ) : null}

      <div className="min-w-0 overflow-x-auto rounded-block bg-block-subtle p-component">
        <div className="min-w-[760px]">
          <FunnelStageHeader
            onOpenStageDetails={onOpenStageDetails}
            showCohortPercent={showCohortPercent}
            stages={activeModel.stages}
          />

          <div className="relative mt-component">
            <HoverStatus label={hoverLabel} />
            <FunnelSvg
              layers={animatedLayers}
              onHover={setHoverLabel}
              onOpenStageDetails={onOpenStageDetails}
              onSelectSegment={setActiveSegmentKey}
              stages={activeModel.stages}
            />
          </div>

          <ConversionStrip stages={activeModel.stages} />
        </div>
      </div>
    </div>
  )
}

function SegmentSwitcher({ activeSegmentKey, onChange, series }) {
  const options = [
    {
      color: 'var(--premium-indigo)',
      id: ALL_SEGMENTS_KEY,
      label: 'All',
    },
    ...series.map((track) => ({
      color: track.color,
      id: track.id,
      label: track.label,
    })),
  ]

  return (
    <div className="flex flex-wrap gap-1.5 rounded-island bg-block-subtle p-1.5">
      {options.map((option) => {
        const active = option.id === activeSegmentKey

        return (
          <Button
            className={`h-8 rounded-control px-3 text-label transition-colors duration-motion-fast ${
              active
                ? 'bg-premium-indigo text-white hover:bg-premium-indigo'
                : 'bg-transparent text-text-secondary hover:bg-control-hover hover:text-text-primary'
            }`}
            key={option.id}
            onClick={() => onChange(option.id)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {option.id === ALL_SEGMENTS_KEY ? null : (
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: option.color }}
              />
            )}
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}

function FunnelStageHeader({ onOpenStageDetails, showCohortPercent, stages }) {
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
          <p className="text-label font-semibold uppercase leading-4 text-text-muted">{stage.label}</p>
          <p className="mt-tag text-data tabular-nums text-text-primary">{stage.count.toLocaleString()}</p>
          {showCohortPercent && cohortCount > 0 ? (
            <p className="mt-tag text-label font-normal text-text-muted">
              {index === 0 ? '100% cohort' : `${formatPercent(stage.count, cohortCount)} of cohort`}
            </p>
          ) : null}
        </button>
      ))}
    </div>
  )
}

function HoverStatus({ label }) {
  return (
    <p className="absolute left-0 right-0 top-0 z-10 text-center text-label font-medium text-text-muted">
      {label || 'Hover a colored stream to inspect its segment.'}
    </p>
  )
}

function FunnelSvg({
  layers,
  onHover,
  onOpenStageDetails,
  onSelectSegment,
  stages,
}) {
  return (
    <svg
      aria-label="Reactivation lifecycle funnel by segment"
      className="h-[320px] w-full overflow-visible"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      <defs>
        <filter height="120%" id="funnelShadow" width="120%" x="-10%" y="-10%">
          <feDropShadow dx="0" dy="4" floodColor="rgb(15 23 42)" floodOpacity="0.08" stdDeviation="5" />
        </filter>
      </defs>

      {stages.map((stage) => (
        <line
          key={`funnel-grid-${stage.id}`}
          stroke="var(--separator)"
          strokeWidth="1"
          x1={stage.x}
          x2={stage.x}
          y1="82"
          y2="244"
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
          x={stage.x - ((CHART_WIDTH / Math.max(stages.length, 1)) / 2)}
          y="0"
        />
      ))}

      {layers.map((layer) => {
        const path = buildLayerPath(layer.points)
        const hasValue = layer.points.some((point) => point.value > 0)

        if (!path) {
          return null
        }

        return (
          <path
            className="cursor-pointer transition-[filter,opacity] duration-motion-fast hover:brightness-95"
            d={path}
            fill={layer.color}
            filter={hasValue ? 'url(#funnelShadow)' : undefined}
            key={layer.id}
            onClick={() => onSelectSegment(layer.id)}
            onMouseEnter={() => onHover(`${layer.label}: ${layer.points[0]?.value ?? 0} at campaign entry`)}
            onMouseLeave={() => onHover('')}
            opacity={hasValue ? 0.82 : 0}
          >
            <title>{layer.label}</title>
          </path>
        )
      })}
    </svg>
  )
}

function ConversionStrip({ stages }) {
  if (stages.length < 2) {
    return null
  }

  return (
    <div
      className="mt-control grid gap-tag text-center text-label"
      style={{ gridTemplateColumns: `repeat(${stages.length - 1}, minmax(120px, 1fr))` }}
    >
      {stages.slice(1).map((stage, index) => {
        const previous = stages[index]
        const percent = previous?.count > 0 ? (stage.count / previous.count) * 100 : 0
        const tone = percent >= 50
          ? 'bg-premium-indigo/10 text-premium-indigo'
          : percent > 0
          ? 'bg-warning-muted text-warning-foreground'
          : 'bg-fill-secondary text-text-muted'

        return (
          <div className={`rounded-control px-control py-tag font-semibold ${tone}`} key={`${previous.id}-${stage.id}`}>
            {stage.label}: {formatPercentValue(percent)}
          </div>
        )
      })}
    </div>
  )
}

function buildStackedFunnelModel({ series, stages }) {
  const normalizedStages = normalizeStages(stages)
  const normalizedSeries = normalizeSeries({
    series,
    stages: normalizedStages,
  })

  return {
    baseMax: getBaseMax({
      series: normalizedSeries,
      stages: normalizedStages,
    }),
    series: normalizedSeries,
    stages: normalizedStages,
  }
}

function buildActiveFunnelModel({ activeSegmentKey, model }) {
  const activeSeries = model.series.length
    ? model.series.map((track) => ({
      ...track,
      active: activeSegmentKey === ALL_SEGMENTS_KEY || activeSegmentKey === track.id,
    }))
    : createFallbackSeries(model.stages)
  const stages = model.stages.map((stage, stageIndex) => {
    const count = model.series.length
      ? sumSeriesAtStage(activeSeries.filter((track) => track.active), stageIndex)
      : stage.count

    return {
      ...stage,
      count,
    }
  })
  const layers = buildStackedLayers({
    baseMax: model.baseMax,
    series: activeSeries,
    stages,
  })

  return {
    layers,
    stages,
  }
}

function normalizeStages(stages) {
  const sectionWidth = stages.length > 1
    ? (CHART_X_END - CHART_X_START) / (stages.length - 1)
    : 0

  return stages.map((stage, index) => ({
    count: toNumber(stage.stage_count),
    id: String(stage.stage_id ?? stage.id ?? stage.stage_name ?? `stage-${index}`),
    label: String(stage.stage_name ?? stage.name ?? `Stage ${index + 1}`),
    source: stage,
    x: CHART_X_START + (sectionWidth * index),
  }))
}

function normalizeSeries({ series, stages }) {
  return series.map((track, index) => {
    const trackKey = getTrackKey(track, index)

    return {
      color: TRACK_COLORS[trackKey] ?? chartColorSequence[index % chartColorSequence.length] ?? TRACK_COLORS.unknown,
      id: String(track.id ?? track.key ?? `track-${index}`),
      key: trackKey,
      label: getTrackLabel(track, trackKey, index),
      stages: stages.map((stage) => {
        const matchingStage = track.stages?.find((item) => (
          String(item.stage_id ?? item.id ?? item.stage_name ?? '') === stage.id
        ))

        return {
          count: toNumber(matchingStage?.stage_count),
          source: matchingStage,
          stageId: stage.id,
        }
      }),
    }
  })
}

function createFallbackSeries(stages) {
  return [{
    active: true,
    color: TRACK_COLORS.A,
    id: 'all-records',
    key: 'ALL',
    label: 'All records',
    stages: stages.map((stage) => ({
      count: stage.count,
      source: stage.source,
      stageId: stage.id,
    })),
  }]
}

function getTrackKey(track, index) {
  const source = String(track.key ?? track.id ?? track.label ?? `track-${index}`).trim()
  const compact = source.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const segmentMatch = compact.match(/([ABCR])$/)

  return segmentMatch?.[1] ?? compact
}

function getTrackLabel(track, trackKey, index) {
  const explicitLabel = String(track.label ?? '').trim()

  if (explicitLabel) {
    return explicitLabel
  }

  return ['A', 'B', 'C', 'R'].includes(trackKey)
    ? `Segment ${trackKey}`
    : `Track ${index + 1}`
}

function getBaseMax({ series, stages }) {
  return Math.max(...stages.map((stage, stageIndex) => (
    Math.max(stage.count, sumSeriesAtStage(series, stageIndex))
  )), 1)
}

function buildStackedLayers({ baseMax, series, stages }) {
  const stageStacks = stages.map((stage, stageIndex) => {
    const values = series.map((track) => (
      track.active === false ? 0 : (track.stages[stageIndex]?.count ?? 0)
    ))
    const stageTotal = values.reduce((sum, value) => sum + value, 0)
    const totalThickness = getStageThickness(stageTotal, baseMax)
    let cursor = CHART_CENTER_Y - (totalThickness / 2)

    return {
      stage,
      x: stage.x,
      segments: series.map((track, trackIndex) => {
        const value = values[trackIndex] ?? 0
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

function getStageThickness(stageTotal, baseMax) {
  if (stageTotal <= 0) {
    return 0
  }

  return Math.max(
    MIN_VISIBLE_THICKNESS,
    MAX_STACK_THICKNESS * Math.pow(stageTotal / Math.max(baseMax, 1), 0.58),
  )
}

function useAnimatedLayers(targetLayers) {
  const frameRef = useRef(null)
  const currentRef = useRef(targetLayers)
  const [animatedLayers, setAnimatedLayers] = useState(targetLayers)

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    const startLayers = currentRef.current
    const startTime = performance.now()

    function animate(now) {
      const progress = Math.min((now - startTime) / MORPH_DURATION_MS, 1)
      const eased = 1 - ((1 - progress) ** 3)
      const nextLayers = interpolateLayers(startLayers, targetLayers, eased)

      setAnimatedLayers(nextLayers)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        currentRef.current = targetLayers
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [targetLayers])

  return animatedLayers
}

function interpolateLayers(startLayers, targetLayers, progress) {
  return targetLayers.map((targetLayer, layerIndex) => {
    const startLayer = startLayers[layerIndex] ?? targetLayer

    return {
      ...targetLayer,
      points: targetLayer.points.map((targetPoint, pointIndex) => {
        const startPoint = startLayer.points?.[pointIndex] ?? targetPoint

        return {
          ...targetPoint,
          bottom: interpolate(startPoint.bottom, targetPoint.bottom, progress),
          top: interpolate(startPoint.top, targetPoint.top, progress),
        }
      }),
    }
  })
}

function interpolate(start, end, progress) {
  return start + ((end - start) * progress)
}

function formatPercent(stageCount, cohortCount) {
  const percent = (stageCount / cohortCount) * 100

  return formatPercentValue(percent)
}

function formatPercentValue(value) {
  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
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
    const segmentControl = (current.x - previous.x) * 0.5
    const controlOneX = previous.x + segmentControl
    const controlTwoX = current.x - segmentControl

    path += ` C ${controlOneX} ${previousY}, ${controlTwoX} ${currentY}, ${current.x} ${currentY}`
  }

  return path
}

function sumSeriesAtStage(series, stageIndex) {
  return series.reduce((total, track) => total + (track.stages[stageIndex]?.count ?? 0), 0)
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(number, 0) : 0
}
