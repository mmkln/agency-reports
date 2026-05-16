export function formatDate(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export function formatDateTime(date) {
  if (!date) {
    return 'Not set'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export function formatMetricValue(metric) {
  if (!metric) {
    return 'Not set'
  }

  return `${metric.value ?? ''}${metric.unit ? ` ${metric.unit}` : ''}`.trim() || 'Not set'
}

export function formatMetricLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatNumber(value, suffix = '') {
  if (typeof value !== 'number') {
    return 'n/a'
  }

  return `${new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`
}

export function getMetricStatusTone(status) {
  return {
    ahead: 'green',
    behind: 'amber',
    neutral: 'neutral',
    on_track: 'blue',
  }[status] ?? 'neutral'
}

export function getInsightTone(severity) {
  return {
    info: 'blue',
    positive: 'green',
    warning: 'amber',
  }[severity] ?? 'blue'
}

export function formatLooseValue(value) {
  if (typeof value === 'number') {
    return formatNumber(value)
  }

  if (value === null || value === undefined || value === '') {
    return 'n/a'
  }

  return String(value)
}

export function getGoalProgress(goal) {
  if (typeof goal?.target !== 'number' || typeof goal?.actual !== 'number' || goal.target <= 0) {
    return 0
  }

  return Math.round((goal.actual / goal.target) * 100)
}
