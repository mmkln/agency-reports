export function GroupedBarChart({
  ariaLabel,
  bars,
  data,
  leftTicks,
  viewBox = '0 0 600 250',
  xEnd = 550,
  xKey = 'label',
  xStart = 70,
  yBottom = 220,
  yMax,
  yTop = 40,
}) {
  const chartHeight = yBottom - yTop
  const xStep = data.length > 1 ? (xEnd - xStart) / data.length : 120
  const ticks = leftTicks ?? [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax]
  const barWidth = 44

  return (
    <svg className="h-[250px] w-full overflow-visible" viewBox={viewBox} role="img" aria-label={ariaLabel}>
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
      {data.map((item, index) => {
        const center = xStart + xStep * index + xStep / 2
        return <line key={item[xKey]} x1={center} x2={center} y1={yTop} y2={yBottom} stroke="#d1d5db" strokeDasharray="3 3" />
      })}
      <line x1={xStart} x2={xEnd} y1={yBottom} y2={yBottom} stroke="#888" />
      <line x1={xStart} x2={xStart} y1={yTop} y2={yBottom} stroke="#888" />
      {data.map((item, index) => {
        const center = xStart + xStep * index + xStep / 2
        const totalWidth = bars.length * barWidth

        return (
          <g key={item[xKey]}>
            {bars.map((bar, barIndex) => {
              const height = (item[bar.key] / yMax) * chartHeight
              const x = center - totalWidth / 2 + barIndex * barWidth
              return <rect fill={bar.color} height={height} key={bar.key} width={barWidth} x={x} y={yBottom - height} />
            })}
            <text fill="#666" fontSize="15" textAnchor="middle" x={center - 2} y={yBottom + 20}>
              {item[xKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
