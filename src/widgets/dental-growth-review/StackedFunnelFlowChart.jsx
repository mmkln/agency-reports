import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/shared/ui'

import {
  ALL_SEGMENTS_KEY,
  createFunnelSegmentOptions,
  getTrackColor,
  getTrackKey,
  getTrackLabel,
} from './reactivationFunnelSegments'
import { reactivationText } from './reactivationTypography'

const CHART_WIDTH = 1000
const CHART_HEIGHT = 240
const CHART_X_START = 50
const CHART_X_END = 950
const CHART_CENTER_Y = 128
const MAX_STACK_THICKNESS = 112
const MIN_VISIBLE_THICKNESS = 6
const MORPH_DURATION_MS = 450

export function StackedFunnelFlowChart({
  activeSegmentKey = ALL_SEGMENTS_KEY,
  onOpenStageDetails,
  onSegmentChange,
  series = [],
  showCohortPercent = false,
  stages = [],
}) {
  const [hoverPoint, setHoverPoint] = useState(null)
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
    <div className="min-w-0 overflow-x-auto">
      <div className="min-w-[760px]">
        <FunnelStageHeader
          onOpenStageDetails={onOpenStageDetails}
          showCohortPercent={showCohortPercent}
          stages={activeModel.stages}
        />

        <div className="relative mt-control">
          <FunnelTooltip point={hoverPoint} />
          <FunnelSvg
            layers={animatedLayers}
            onHover={setHoverPoint}
            onOpenStageDetails={onOpenStageDetails}
            onSelectSegment={onSegmentChange}
            stages={activeModel.stages}
          />
        </div>

        <ConversionStrip stages={activeModel.stages} />
      </div>
    </div>
  )
}

export function FunnelSegmentSwitcher({ activeSegmentKey, onChange, series }) {
  const options = createFunnelSegmentOptions(series)

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === activeSegmentKey

        return (
          <Button
            className={`h-8 rounded-control px-3 text-label transition-colors duration-motion-fast ${
              active
                ? 'bg-control-selected text-text-primary hover:bg-control-selected'
                : 'bg-transparent text-text-secondary hover:bg-control-hover hover:text-text-primary'
            }`}
            key={option.id}
            onClick={() => onChange?.(option.id)}
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
          <p className={reactivationText.stageLabel}>{stage.label}</p>
          <p className={`mt-tag ${reactivationText.stageValue}`}>{stage.count.toLocaleString()}</p>
          {showCohortPercent && cohortCount > 0 ? (
            <p className={`mt-tag ${reactivationText.stageHelper}`}>
              {index === 0 ? '100% cohort' : `${formatPercent(stage.count, cohortCount)} of cohort`}
            </p>
          ) : null}
        </button>
      ))}
    </div>
  )
}

function FunnelTooltip({ point }) {
  if (!point) {
    return (
      <p className={`pointer-events-none absolute left-0 right-0 top-0 z-10 text-center ${reactivationText.chartHelper}`}>
        Hover a stream segment to inspect stage data.
      </p>
    )
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-10 min-w-[260px] -translate-x-1/2 rounded-island bg-premium-shark px-4 py-3 text-label text-text-on-dark shadow-premium">
      <div>
        <p className="font-semibold text-white">{point.title}</p>
        <p className="mt-tag font-normal text-white/65">{point.subtitle}</p>
      </div>
      <div className="mt-2 grid gap-1.5">
        {point.rows.map((row) => (
          <div className="flex items-center justify-between gap-6" key={row.label}>
            <span className="text-white/65">{row.label}</span>
            <span className="font-semibold text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
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
      className="h-[240px] w-full overflow-visible"
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
          y1="64"
          y2="196"
        />
      ))}

      {stages.map((stage, stageIndex) => (
        <rect
          aria-label={`View ${stage.label} details`}
          className="cursor-pointer fill-transparent"
          height={CHART_HEIGHT}
          key={`stacked-funnel-hit-${stage.id}`}
          onClick={() => onOpenStageDetails?.(stage.source)}
          onMouseEnter={() => onHover(createStageTooltip({ stage, stageIndex, stages }))}
          onMouseLeave={() => onHover(null)}
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
            onClick={() => onSelectSegment?.(layer.id)}
            onMouseEnter={() => onHover(createSegmentTooltip({ layer }))}
            onMouseLeave={() => onHover(null)}
            opacity={hasValue ? 0.82 : 0}
          >
            <title>{layer.label}</title>
          </path>
        )
      })}

      {layers.flatMap((layer) => layer.points.map((point, stageIndex) => {
        if (point.value <= 0) {
          return null
        }

        return (
          <circle
            aria-label={`${layer.label} at ${stages[stageIndex]?.label}`}
            className="cursor-pointer fill-transparent"
            cx={point.x}
            cy={(point.top + point.bottom) / 2}
            key={`funnel-point-${layer.id}-${stages[stageIndex]?.id}`}
            onClick={() => onSelectSegment?.(layer.id)}
            onMouseEnter={() => onHover(createLayerStageTooltip({
              layer,
              point,
              stage: stages[stageIndex],
              stageIndex,
            }))}
            onMouseLeave={() => onHover(null)}
            r="34"
          />
        )
      }))}
    </svg>
  )
}

function ConversionStrip({ stages }) {
  if (stages.length < 2) {
    return null
  }

  return (
    <div
      className="mt-item grid gap-tag text-center text-label font-normal text-text-muted"
      style={{ gridTemplateColumns: `repeat(${stages.length - 1}, minmax(120px, 1fr))` }}
    >
      {stages.slice(1).map((stage, index) => {
        const previous = stages[index]
        const percent = previous?.count > 0 ? (stage.count / previous.count) * 100 : 0
        return (
          <div className="rounded-control bg-fill-secondary px-control py-tag" key={`${previous.id}-${stage.id}`}>
            {stage.label}: {formatPercentValue(percent)}
          </div>
        )
      })}
    </div>
  )
}

function createStageTooltip({ stage, stageIndex, stages }) {
  const cohort = stages[0]?.count ?? 0
  const previous = stages[stageIndex - 1]?.count ?? 0

  return {
    rows: [
      {
        label: 'Contacts',
        value: formatInteger(stage.count),
      },
      {
        label: 'Of cohort',
        value: cohort > 0 ? formatPercentValue((stage.count / cohort) * 100) : '0%',
      },
      {
        label: 'From previous',
        value: stageIndex === 0 ? '100%' : previous > 0 ? formatPercentValue((stage.count / previous) * 100) : '0%',
      },
    ],
    subtitle: 'All tracks',
    title: stage.label,
  }
}

function createLayerStageTooltip({ layer, point, stage, stageIndex }) {
  const cohort = layer.points[0]?.value ?? 0
  const previous = layer.points[stageIndex - 1]?.value ?? 0

  return {
    rows: [
      {
        label: 'Contacts',
        value: formatInteger(point.value),
      },
      {
        label: 'Of segment cohort',
        value: cohort > 0 ? formatPercentValue((point.value / cohort) * 100) : '0%',
      },
      {
        label: 'From previous',
        value: stageIndex === 0 ? '100%' : previous > 0 ? formatPercentValue((point.value / previous) * 100) : '0%',
      },
    ],
    subtitle: layer.label,
    title: stage?.label ?? 'Lifecycle stage',
  }
}

function createSegmentTooltip({ layer }) {
  const first = layer.points[0]
  const last = layer.points[layer.points.length - 1]
  const peak = Math.max(0, ...layer.points.map((point) => point.value))

  return {
    rows: [
      {
        label: 'Campaign entry',
        value: formatInteger(first?.value ?? 0),
      },
      {
        label: 'Peak stage',
        value: formatInteger(peak),
      },
      {
        label: 'Final stage',
        value: formatInteger(last?.value ?? 0),
      },
    ],
    subtitle: 'Segment lifecycle',
    title: layer.label,
  }
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
      color: getTrackColor(trackKey, index),
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
    color: getTrackColor('A', 0),
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

function formatInteger(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
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
