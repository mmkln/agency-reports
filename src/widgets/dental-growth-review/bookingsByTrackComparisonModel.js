const BOOKED_STAGE_IDS = new Set([
  'booked',
  'booked_appointment',
])

export const trackMetricColumns = [
  {
    chartable: true,
    format: 'number',
    key: 'cohort',
    label: 'Cohort',
  },
  {
    chartable: true,
    format: 'number',
    key: 'replies',
    label: 'Replies',
  },
  {
    chartable: true,
    format: 'number',
    key: 'booked',
    label: 'Booked',
  },
  {
    chartable: true,
    format: 'percent',
    key: 'replyRate',
    label: 'Reply rate',
  },
  {
    chartable: true,
    format: 'percent',
    key: 'bookingRate',
    label: 'Booking rate',
  },
]

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
}

function getStageCount(track, matcher) {
  const matchingStage = (track?.stages ?? []).find((stage) => {
    const id = normalizeKey(stage.id ?? stage.stage_id)
    const name = normalizeKey(stage.stage_name ?? stage.name)

    return matcher(id) || matcher(name)
  })

  return Math.max(Number(matchingStage?.stage_count ?? matchingStage?.count ?? 0) || 0, 0)
}

function getTrackCohortCount(track) {
  return Math.max(Number(track?.stages?.[0]?.stage_count ?? track?.stages?.[0]?.count ?? 0) || 0, 0)
}

function getTrackKey(track, index) {
  return String(track?.key ?? track?.id ?? `track-${index + 1}`).trim().toUpperCase()
}

function getPercent(numerator, denominator) {
  if (!denominator || numerator <= 0) {
    return 0
  }

  return (numerator / denominator) * 100
}

function getMetricTotal(rows, column) {
  if (column.format === 'percent') {
    const values = rows.map((row) => Number(row[column.key] ?? 0))
    const total = values.reduce((sum, value) => sum + value, 0)

    return values.length ? total / values.length : 0
  }

  return rows.reduce((sum, row) => sum + Number(row[column.key] ?? 0), 0)
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })
}

export function formatTrackMetricValue(value, format) {
  if (format === 'percent') {
    return `${Number(value || 0).toFixed(1)}%`
  }

  return formatNumber(value)
}

export function buildBookingsByTrackComparisonModel({ colorsByTrack = {}, funnelChart }) {
  const tracks = funnelChart?.breakdowns?.by_track ?? []
  const rows = tracks.map((track, index) => {
    const key = getTrackKey(track, index)
    const cohort = getTrackCohortCount(track)
    const replies = getStageCount(track, (value) => value.includes('replied'))
    const booked = getStageCount(track, (value) => BOOKED_STAGE_IDS.has(value))

    return {
      booked,
      bookingRate: getPercent(booked, replies),
      cohort,
      color: colorsByTrack[key] ?? colorsByTrack.unknown,
      id: track.id ?? key,
      key,
      label: track.label ?? `Track ${key}`,
      replies,
      replyRate: getPercent(replies, cohort),
    }
  }).filter((row) => row.key)

  if (!rows.length) {
    return null
  }

  const totals = {
    booked: rows.reduce((sum, row) => sum + row.booked, 0),
    bookingRate: getPercent(
      rows.reduce((sum, row) => sum + row.booked, 0),
      rows.reduce((sum, row) => sum + row.replies, 0),
    ),
    cohort: rows.reduce((sum, row) => sum + row.cohort, 0),
    replies: rows.reduce((sum, row) => sum + row.replies, 0),
    replyRate: getPercent(
      rows.reduce((sum, row) => sum + row.replies, 0),
      rows.reduce((sum, row) => sum + row.cohort, 0),
    ),
  }

  return {
    getChartRows(selectedColumnKey) {
      const column = trackMetricColumns.find((item) => item.key === selectedColumnKey) ?? trackMetricColumns[2]

      return {
        centerLabel: column.label,
        centerValue: formatTrackMetricValue(getMetricTotal(rows, column), column.format),
        column,
        rows: rows
          .map((row) => ({
            ...row,
            value: Number(row[column.key] ?? 0),
          }))
          .filter((row) => row.value > 0),
      }
    },
    rows,
    totals,
  }
}
