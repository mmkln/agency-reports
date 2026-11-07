const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

const periodDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

export function formatAnalyticsValue(value, unit = 'count') {
  if (unit === 'percent') {
    return `${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  }
  if (unit === 'currency') {
    return currencyFormatter.format(Number(value) || 0)
  }
  return Number(value ?? 0).toLocaleString()
}

export function formatAnalyticsPeriodRange(period, fallback = '') {
  function formatDate(value) {
    if (!value) {
      return ''
    }

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) ? '' : periodDateFormatter.format(date)
  }

  const start = formatDate(period?.start)
  const end = formatDate(period?.end)

  return start && end ? `${start} – ${end}` : fallback
}

export function formatAnalyticsCumulativeLabel(cumulative, unit = 'count') {
  if (!cumulative || cumulative.value == null) {
    return null
  }
  return `${cumulative.label ?? 'All-time'} ${formatAnalyticsValue(cumulative.value, unit)}`
}
