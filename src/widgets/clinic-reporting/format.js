export function formatClinicValue(item = {}) {
  if (item.value !== undefined && item.value !== null) {
    return `${item.unit === '$' ? '$' : ''}${item.value}${item.unit && item.unit !== '$' ? ` ${item.unit}` : ''}`
  }

  if (item.count !== undefined && item.count !== null) {
    return item.count
  }

  if (item.roi !== undefined && item.roi !== null) {
    return `${item.roi}% ROI`
  }

  if (item.cost_per_new_patient !== undefined) {
    return `$${item.cost_per_new_patient}`
  }

  if (item.cost_per_booking !== undefined) {
    return `$${item.cost_per_booking}`
  }

  if (item.lift) {
    return item.lift
  }

  if (Array.isArray(item.points)) {
    return item.points.at(-1)
  }

  return item.status ?? 'Recorded'
}

export function formatClinicLabel(item = {}) {
  return item.label ?? item.channel ?? item.name ?? item.id ?? 'Metric'
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not recorded'
  }

  return new Date(value).toLocaleString()
}

export function formatStatusLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function statusTone(status) {
  if (['ahead', 'current', 'on_track', 'resolved', 'healthy'].includes(status)) {
    return 'green'
  }

  if (['behind', 'blocked', 'missing', 'red', 'high'].includes(status)) {
    return 'rose'
  }

  if (['warning', 'yellow', 'medium', 'inconclusive', 'stale'].includes(status)) {
    return 'orange'
  }

  return 'blue'
}
