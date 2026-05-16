import { chartColors } from '../theme'

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(1, value))
}

function formatTick(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10)
}

export function StackedBarLineChart({
  ariaLabel,
  bars,
  barWidthMax = 18,
  barWidthMin = 4,
  data,
  heightClassName = 'h-[360px]',
  labelEvery: labelEveryOverride,
  line,
  leftAxisLabel,
  leftTicks,
  minWidthClassName = 'min-w-[56rem]',
  rightAxisLabel,
  rightTicks,
  viewBox = '0 0 900 360',
  xEnd = 820,
  xKey = 'label',
  xStart = 70,
  yBottom = 300,
  yLeftMax,
  yRightMax,
  yTop = 38,
}) {
  const chartHeight = yBottom - yTop
  const normalizedData = Array.isArray(data) ? data : []
  const leftMax = yLeftMax ?? Math.max(
    1,
    ...normalizedData.map((item) => bars.reduce((sum, bar) => sum + (Number(item[bar.key]) || 0), 0)),
  )
  const rightMax = yRightMax ?? Math.max(1, ...normalizedData.map((item) => Number(item[line.key]) || 0))
  const xStep = normalizedData.length > 1 ? (xEnd - xStart) / normalizedData.length : 32
  const barWidth = Math.max(barWidthMin, Math.min(barWidthMax, xStep * 0.72))
  const leftTickValues = leftTicks ?? [0, leftMax * 0.25, leftMax * 0.5, leftMax * 0.75, leftMax]
  const rightTickValues = rightTicks ?? [0, rightMax * 0.25, rightMax * 0.5, rightMax * 0.75, rightMax]
  const labelEvery = labelEveryOverride ?? Math.max(1, Math.ceil(normalizedData.length / 10))

  const getX = (index) => xStart + xStep * index + xStep / 2
  const getLeftY = (value) => yBottom - clampPercent(value / leftMax) * chartHeight
  const getRightY = (value) => yBottom - clampPercent(value / rightMax) * chartHeight

  const linePoints = normalizedData
    .map((item, index) => `${getX(index)},${getRightY(Number(item[line.key]) || 0)}`)
    .join(' ')

  return (
    <svg aria-label={ariaLabel} className={`${heightClassName} w-full ${minWidthClassName} overflow-hidden`} role="img" viewBox={viewBox}>
      {leftAxisLabel ? (
        <text
          fill={chartColors.label}
          fontSize="13"
          textAnchor="middle"
          transform={`rotate(-90 18 ${(yTop + yBottom) / 2})`}
          x="18"
          y={(yTop + yBottom) / 2}
        >
          {leftAxisLabel}
        </text>
      ) : null}
      {rightAxisLabel ? (
        <text
          fill={chartColors.label}
          fontSize="13"
          textAnchor="middle"
          transform={`rotate(90 ${xEnd + 56} ${(yTop + yBottom) / 2})`}
          x={xEnd + 56}
          y={(yTop + yBottom) / 2}
        >
          {rightAxisLabel}
        </text>
      ) : null}

      {leftTickValues.map((value) => {
        const y = getLeftY(value)

        return (
          <g key={`left-${value}`}>
            <line stroke={chartColors.grid} strokeDasharray="3 3" x1={xStart} x2={xEnd} y1={y} y2={y} />
            <text fill={chartColors.label} fontSize="12" textAnchor="end" x={xStart - 10} y={y + 4}>
              {formatTick(value)}
            </text>
          </g>
        )
      })}

      {rightTickValues.map((value) => {
        const y = getRightY(value)

        return (
          <text fill={chartColors.label} fontSize="12" key={`right-${value}`} x={xEnd + 10} y={y + 4}>
            {formatTick(value)}
          </text>
        )
      })}

      <line stroke={chartColors.axis} x1={xStart} x2={xEnd} y1={yBottom} y2={yBottom} />
      <line stroke={chartColors.axis} x1={xStart} x2={xStart} y1={yTop} y2={yBottom} />
      <line stroke={chartColors.axis} x1={xEnd} x2={xEnd} y1={yTop} y2={yBottom} />

      {normalizedData.map((item, index) => {
        let stackY = yBottom
        const x = getX(index) - barWidth / 2

        return (
          <g key={`${item[xKey] ?? index}-bar`}>
            {bars.map((bar) => {
              const value = Number(item[bar.key]) || 0
              const height = clampPercent(value / leftMax) * chartHeight
              stackY -= height

              return (
                <rect
                  fill={bar.color}
                  height={height}
                  key={bar.key}
                  rx="1.5"
                  width={barWidth}
                  x={x}
                  y={stackY}
                />
              )
            })}
            {index % labelEvery === 0 || index === normalizedData.length - 1 ? (
              <text
                fill={chartColors.label}
                fontSize="11"
                textAnchor="end"
                transform={`rotate(-45 ${getX(index)} ${yBottom + 24})`}
                x={getX(index)}
                y={yBottom + 24}
              >
                {item[xKey]}
              </text>
            ) : null}
          </g>
        )
      })}

      <polyline
        fill="none"
        points={linePoints}
        stroke={line.color}
        strokeDasharray="5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      {normalizedData.map((item, index) => (
        <circle
          cx={getX(index)}
          cy={getRightY(Number(item[line.key]) || 0)}
          fill={chartColors.surface}
          key={`${item[xKey] ?? index}-line-point`}
          r="2.5"
          stroke={line.color}
          strokeWidth="1.8"
        />
      ))}
    </svg>
  )
}
