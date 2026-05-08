export function LineChart({
  ariaLabel,
  data,
  height = 250,
  leftTicks,
  rightTicks,
  series,
  viewBox = '0 0 600 250',
  xEnd = 550,
  xKey = 'label',
  xStart = 70,
  yBottom = 220,
  yMax,
  yTop = 50,
}) {
  const chartHeight = yBottom - yTop
  const xStep = data.length > 1 ? (xEnd - xStart) / (data.length - 1) : 0
  const ticks = leftTicks ?? [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax]

  const getPoint = (item, index, key) => ({
    x: xStart + index * xStep,
    y: yBottom - (item[key] / yMax) * chartHeight,
  })

  return (
    <svg className="w-full overflow-visible" style={{ height }} viewBox={viewBox} role="img" aria-label={ariaLabel}>
      {ticks.map((value) => {
        const y = yBottom - (value / yMax) * chartHeight
        return (
          <g key={value}>
            <line x1={xStart} x2={xEnd} y1={y} y2={y} stroke="#d1d5db" strokeDasharray="3 3" />
            <text x={xStart - 8} y={y + 5} fill="#666" fontSize="15" textAnchor="end">
              {value}
            </text>
          </g>
        )
      })}
      {rightTicks
        ? rightTicks.map((tick) => {
            const y = yBottom - (tick.value / yMax) * chartHeight
            return (
              <text fill="#666" fontSize="15" key={tick.label} x={xEnd + 10} y={y + 5}>
                {tick.label}
              </text>
            )
          })
        : null}
      {data.map((item, index) => {
        const x = xStart + index * xStep
        return <line key={item[xKey]} x1={x} x2={x} y1={yTop} y2={yBottom} stroke="#d1d5db" strokeDasharray="3 3" />
      })}
      <line x1={xStart} x2={xEnd} y1={yBottom} y2={yBottom} stroke="#888" />
      <line x1={xStart} x2={xStart} y1={yTop} y2={yBottom} stroke="#888" />
      {rightTicks ? <line x1={xEnd} x2={xEnd} y1={yTop} y2={yBottom} stroke="#888" /> : null}
      {series.map((line) => {
        const points = data.map((item, index) => {
          const point = getPoint(item, index, line.key)
          return `${point.x},${point.y}`
        })

        return (
          <g key={line.key}>
            <polyline fill="none" points={points.join(' ')} stroke={line.color} strokeWidth="2" />
            {data.map((item, index) => {
              const point = getPoint(item, index, line.key)
              return <circle cx={point.x} cy={point.y} fill="white" key={`${line.key}-${item[xKey]}`} r="3" stroke={line.color} strokeWidth="2" />
            })}
          </g>
        )
      })}
      {data.map((item, index) => (
        <text fill="#666" fontSize="15" key={item[xKey]} textAnchor="middle" x={xStart + index * xStep} y={yBottom + 20}>
          {item[xKey]}
        </text>
      ))}
    </svg>
  )
}
