const statusToneClass = {
  green: 'bg-success-muted text-success',
  grey: 'bg-fill-secondary text-text-muted',
  red: 'bg-destructive-muted text-destructive',
  yellow: 'bg-warning-muted text-warning-foreground',
}

export function statusClass(status) {
  return statusToneClass[status] ?? statusToneClass.grey
}

export function formatLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function shouldDisplayMetricUnit(unit) {
  return Boolean(unit && !['$', 'count'].includes(unit))
}

export function formatMetricValue(metric) {
  if (!metric) {
    return ''
  }

  if (metric.unit === '$' && typeof metric.value === 'number') {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(metric.value)
  }

  return `${metric.value}${shouldDisplayMetricUnit(metric.unit) ? ` ${metric.unit}` : ''}`
}

export function formatDate(value) {
  if (!value) {
    return 'Not updated'
  }

  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
