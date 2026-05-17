const FILTER_KEYS = [
  'campaign_status',
  'channel',
  'compliance_status',
  'location_id',
  'period_label',
  'service_line_id',
]

export function getClinicAnalyticsFilters(routeParams = {}) {
  return FILTER_KEYS.reduce((filters, key) => ({
    ...filters,
    [key]: typeof routeParams[key] === 'string' ? routeParams[key] : '',
  }), {})
}

export function getClinicAnalyticsFilterKey(filters = {}) {
  return FILTER_KEYS.map((key) => `${key}:${filters[key] ?? ''}`).join('|')
}
