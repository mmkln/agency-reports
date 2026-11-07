import { getAnalyticsToneColor } from './analyticsWidgetColors'

export function AnalyticsSegmentedBar({ label, maxTotal, series, total, values }) {
  if (!total) {
    return <span className="text-ui tabular-nums text-text-muted">0</span>
  }

  const visibleSeries = series.filter((item) => Number(values[item.key] ?? 0) > 0)
  const barPercentage = Math.min((total / Math.max(maxTotal, 1)) * 100, 100)

  return (
    <div aria-label={label} className="h-4 min-w-48" role="img">
      <div
        aria-hidden="true"
        className="flex h-full min-w-0 overflow-hidden rounded-full"
        style={{ width: `${barPercentage}%` }}
      >
        {visibleSeries.map((item) => {
          const value = Number(values[item.key] ?? 0)
          const segmentPercentage = (value / total) * 100
          const scalePercentage = (value / Math.max(maxTotal, 1)) * 100

          return (
            <span
              className="flex min-w-0 items-center justify-end border-r-2 border-block px-micro text-caption font-semibold text-white last:border-r-0"
              key={item.key}
              style={{
                backgroundColor: getAnalyticsToneColor(item.tone),
                width: `${segmentPercentage}%`,
              }}
            >
              {scalePercentage >= 7 ? value.toLocaleString() : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}
