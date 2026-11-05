const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
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

export function formatAnalyticsCumulativeLabel(cumulative, unit = 'count') {
  if (!cumulative || cumulative.value == null) {
    return null
  }
  return `${cumulative.label ?? 'All-time'} ${formatAnalyticsValue(cumulative.value, unit)}`
}
