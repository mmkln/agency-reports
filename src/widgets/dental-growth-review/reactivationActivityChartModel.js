export const touchSeries = [
  {
    key: 'sms',
    label: 'SMS sent',
  },
  {
    key: 'email',
    label: 'Emails sent',
  },
]

export const bookingLine = {
  key: 'cumulativeBookings',
  label: 'Bookings (cumulative)',
}

export const activityChartLayout = {
  barCategoryGap: '24%',
  chartHeightClassName: 'h-[340px]',
  leftAxisWidth: 38,
  margin: {
    bottom: 4,
    left: 0,
    right: 8,
    top: 16,
  },
  maxBarSize: 42,
  rightAxisWidth: 32,
  xTickMargin: 12,
}

const BAR_RADIUS = [7, 7, 0, 0]
const SQUARE_RADIUS = [0, 0, 0, 0]

function formatDateLabel(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function normalizeChartSeries(series = []) {
  return series.map((point) => ({
    ...point,
    label: formatDateLabel(point.date || point.label),
  }))
}

function muteUnfinishedTodayBars(series) {
  const todayIso = new Date().toISOString().slice(0, 10)
  const lastPoint = series[series.length - 1]

  if (lastPoint?.date !== todayIso) {
    return series
  }

  return [
    ...series.slice(0, -1),
    {
      ...lastPoint,
      email: null,
      sms: null,
    },
  ]
}

function getXAxisTickInterval(pointCount) {
  if (pointCount <= 14) {
    return 0
  }

  return Math.max(1, Math.ceil(pointCount / 12) - 1)
}

function getStackedMaxValue(series, keys) {
  return Math.max(
    0,
    ...series.map((point) => keys.reduce((sum, key) => sum + Number(point[key] ?? 0), 0)),
  )
}

function getBookingAxisMax(series) {
  const maxBookings = Math.max(0, ...series.map((point) => Number(point[bookingLine.key] ?? 0)))

  if (maxBookings <= 0) {
    return 5
  }

  return Math.ceil((maxBookings + 1) / 2) * 2
}

function isPositiveNumber(value) {
  return Number(value ?? 0) > 0
}

export function getStackedBarRadius({ point, seriesKey }) {
  const hasSms = isPositiveNumber(point.sms)
  const hasEmail = isPositiveNumber(point.email)

  if (seriesKey === 'email' && hasEmail) {
    return BAR_RADIUS
  }

  if (seriesKey === 'sms' && hasSms && !hasEmail) {
    return BAR_RADIUS
  }

  return SQUARE_RADIUS
}

export function buildActivityChartModel(chart) {
  if (!chart?.available || !chart.series?.length) {
    return null
  }

  const series = normalizeChartSeries(muteUnfinishedTodayBars(chart.series))

  if (!series.length) {
    return null
  }

  return {
    leftAxisMax: Math.ceil(getStackedMaxValue(series, touchSeries.map((item) => item.key)) * 1.12) || 10,
    rightAxisMax: getBookingAxisMax(series),
    series,
    title: chart.label || 'Reactivation Activity',
    xTickInterval: getXAxisTickInterval(series.length),
  }
}
