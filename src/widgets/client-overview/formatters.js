export function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatLooseValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return typeof value === 'number' ? new Intl.NumberFormat('en').format(value) : String(value)
}

export function formatMetricValue(metric) {
  if (!metric) {
    return '-'
  }

  const value = formatLooseValue(metric.value)

  if (metric.unit === 'currency') {
    return `$${value}`
  }

  if (metric.unit === 'percent') {
    return `${value}%`
  }

  if (metric.unit) {
    return `${value} ${metric.unit}`
  }

  return value
}
