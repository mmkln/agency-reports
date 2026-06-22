import { reactivationTrackColors } from './reactivationChartTheme'

export const weeklyTrackActivityColumns = [
  {
    align: 'left',
    key: 'weekLabel',
    label: 'Week',
  },
  {
    align: 'left',
    key: 'trackLabel',
    label: 'Track',
  },
  {
    align: 'right',
    key: 'sms',
    label: 'SMS',
  },
  {
    align: 'right',
    key: 'email',
    label: 'Email',
  },
  {
    align: 'right',
    key: 'call',
    label: 'Calls',
  },
  {
    align: 'right',
    key: 'total',
    label: 'Total',
  },
]

export const weeklyTrackActivityMetrics = [
  {
    key: 'sms',
    label: 'SMS',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'call',
    label: 'Calls',
  },
]

function formatMonthDay(value) {
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

function formatWeekRange(start, end) {
  const startLabel = formatMonthDay(start)
  const endLabel = formatMonthDay(end)

  if (!startLabel && !endLabel) {
    return ''
  }

  if (!startLabel || !endLabel) {
    return startLabel || endLabel
  }

  return `${startLabel}-${endLabel}`
}

function getTrackKey(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getTrackColor(track) {
  return reactivationTrackColors[getTrackKey(track)] ?? reactivationTrackColors.unknown
}

function normalizeNumber(value) {
  return Math.max(Number(value ?? 0) || 0, 0)
}

function buildTotals(rows) {
  return rows.reduce((totals, row) => ({
    call: totals.call + row.call,
    email: totals.email + row.email,
    sms: totals.sms + row.sms,
    total: totals.total + row.total,
  }), {
    call: 0,
    email: 0,
    sms: 0,
    total: 0,
  })
}

function sumActivityValues(values) {
  return {
    call: values.reduce((sum, item) => sum + normalizeNumber(item.call), 0),
    email: values.reduce((sum, item) => sum + normalizeNumber(item.email), 0),
    sms: values.reduce((sum, item) => sum + normalizeNumber(item.sms), 0),
    total: values.reduce((sum, item) => sum + normalizeNumber(item.total), 0),
  }
}

function getTrackOrder(section, track) {
  const configuredIndex = (section.tracks ?? []).findIndex((item) => getTrackKey(item.key) === track)

  if (configuredIndex >= 0) {
    return configuredIndex
  }

  return 100
}

function getConfiguredTracks(section) {
  const configuredTracks = (section.tracks ?? [])
    .map((track, index) => {
      const key = getTrackKey(track.key)

      return {
        color: getTrackColor(key),
        id: key || `track-${index + 1}`,
        key,
        label: track.label || (key ? `Track ${key}` : 'Unknown track'),
        order: index,
      }
    })
    .filter((track) => track.key)

  if (configuredTracks.length) {
    return configuredTracks
  }

  return Array.from(new Set((section.rows ?? []).map((row) => getTrackKey(row.track)).filter(Boolean)))
    .sort()
    .map((key, index) => ({
      color: getTrackColor(key),
      id: key,
      key,
      label: `Track ${key}`,
      order: index,
    }))
}

function buildTableRow(section) {
  return function mapTableRow(row, index) {
    const track = getTrackKey(row.track)

    return {
      call: normalizeNumber(row.call),
      color: getTrackColor(track),
      email: normalizeNumber(row.email),
      id: `${row.week || row.weekIndex || 'week'}:${track || index}`,
      sms: normalizeNumber(row.sms),
      total: normalizeNumber(row.total),
      track,
      trackLabel: row.trackLabel || (track ? `Track ${track}` : 'Unknown track'),
      trackOrder: getTrackOrder(section, track),
      week: row.week,
      weekIndex: normalizeNumber(row.weekIndex),
      weekLabel: formatWeekRange(row.weekStart, row.weekEnd) || row.week,
    }
  }
}

function buildPivotWeeks(section, tracks) {
  const weeksByKey = new Map()

  section.rows.forEach((row) => {
    const week = row.week || String(row.weekIndex || '')
    const existing = weeksByKey.get(week) ?? {
      id: week,
      label: week,
      order: normalizeNumber(row.weekIndex),
      tracks: Object.fromEntries(tracks.map((track) => [track.key, {
        call: 0,
        email: 0,
        sms: 0,
        total: 0,
      }])),
    }
    const track = getTrackKey(row.track)

    if (track) {
      existing.tracks[track] = {
        call: normalizeNumber(row.call),
        email: normalizeNumber(row.email),
        sms: normalizeNumber(row.sms),
        total: normalizeNumber(row.total),
      }
    }

    weeksByKey.set(week, existing)
  })

  return Array.from(weeksByKey.values())
    .sort((a, b) => a.order - b.order)
    .map((week) => ({
      ...week,
      allTracks: sumActivityValues(Object.values(week.tracks)),
    }))
}

function buildPivotTotals(weeks, tracks) {
  const totalsByTrack = Object.fromEntries(tracks.map((track) => [
    track.key,
    sumActivityValues(weeks.map((week) => week.tracks[track.key] ?? {})),
  ]))

  return {
    allTracks: sumActivityValues(weeks.map((week) => week.allTracks)),
    tracks: totalsByTrack,
  }
}

export function formatWeeklyTrackActivityNumber(value) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })
}

export function buildWeeklyTrackActivityModel(section) {
  if (!section?.available || !section.rows?.length) {
    return null
  }

  const rows = section.rows
    .map(buildTableRow(section))
    .sort((a, b) => {
      if (a.weekIndex !== b.weekIndex) {
        return a.weekIndex - b.weekIndex
      }

      if (a.trackOrder !== b.trackOrder) {
        return a.trackOrder - b.trackOrder
      }

      return a.track.localeCompare(b.track)
    })
    .map((row, index, sortedRows) => ({
      ...row,
      showWeekLabel: index === 0 || sortedRows[index - 1].week !== row.week,
    }))

  if (!rows.length) {
    return null
  }

  const tracks = getConfiguredTracks(section)
  const pivotWeeks = buildPivotWeeks(section, tracks)
  const pivotTotals = buildPivotTotals(pivotWeeks, tracks)

  return {
    columns: weeklyTrackActivityColumns,
    metrics: weeklyTrackActivityMetrics,
    pivotTotals,
    pivotWeeks,
    rows,
    subtitle: 'Actual reactivation touches by week and track.',
    title: 'Weekly Activity',
    tracks,
    totals: buildTotals(rows),
  }
}
