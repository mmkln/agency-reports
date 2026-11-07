import { reactivationColors, reactivationTrackColors } from './reactivationChartTheme'

export const weeklyTrackActivityChannels = [
  {
    color: 'var(--premium-blue)',
    iconName: 'messageSquare',
    key: 'sms',
    label: 'SMS',
  },
  {
    color: reactivationColors.email,
    iconName: 'mail',
    key: 'email',
    label: 'Email',
  },
  {
    color: reactivationColors.booking,
    iconName: 'phone',
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

function buildWeek(row) {
  const weekKey = row.week || String(row.weekIndex || '')

  return {
    id: weekKey,
    key: weekKey,
    label: row.week || weekKey,
    order: normalizeNumber(row.weekIndex),
    rangeLabel: formatWeekRange(row.weekStart, row.weekEnd),
  }
}

function getConfiguredWeeks(section) {
  const weeksByKey = new Map()

  section.rows.forEach((row) => {
    const week = buildWeek(row)

    if (!week.key || weeksByKey.has(week.key)) {
      return
    }

    weeksByKey.set(week.key, week)
  })

  return Array.from(weeksByKey.values())
    .sort((a, b) => a.order - b.order)
}

function buildValuesByTrackAndWeek(section) {
  const values = new Map()

  section.rows.forEach((row) => {
    const track = getTrackKey(row.track)
    const week = row.week || String(row.weekIndex || '')

    if (!track || !week) {
      return
    }

    values.set(`${track}:${week}`, {
      call: normalizeNumber(row.call),
      email: normalizeNumber(row.email),
      sms: normalizeNumber(row.sms),
    })
  })

  return values
}

function getValue(valuesByTrackAndWeek, channelKey, trackKey, weekKey) {
  return normalizeNumber(valuesByTrackAndWeek.get(`${trackKey}:${weekKey}`)?.[channelKey])
}

function getIntensity(value, max) {
  if (!max) {
    return 0
  }

  return Math.min(1, value / max)
}

function buildChannel(channel, tracks, weeks, valuesByTrackAndWeek) {
  const values = tracks.flatMap((track) => weeks.map((week) => (
    getValue(valuesByTrackAndWeek, channel.key, track.key, week.key)
  )))
  const max = Math.max(0, ...values)
  const rows = tracks.map((track) => ({
    cells: weeks.map((week) => {
      const value = getValue(valuesByTrackAndWeek, channel.key, track.key, week.key)

      return {
        id: `${channel.key}:${track.key}:${week.key}`,
        intensity: getIntensity(value, max),
        value,
        weekKey: week.key,
      }
    }),
    color: track.color,
    id: `${channel.key}:${track.key}`,
    trackKey: track.key,
    trackLabel: track.label,
  }))
  const totals = weeks.map((week) => {
    const value = tracks.reduce((sum, track) => (
      sum + getValue(valuesByTrackAndWeek, channel.key, track.key, week.key)
    ), 0)

    return {
      id: `${channel.key}:total:${week.key}`,
      value,
      weekKey: week.key,
    }
  })

  return {
    ...channel,
    max,
    rows,
    totals,
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

  const tracks = getConfiguredTracks(section)
  const weeks = getConfiguredWeeks(section)
  const valuesByTrackAndWeek = buildValuesByTrackAndWeek(section)
  const channels = weeklyTrackActivityChannels.map((channel) => (
    buildChannel(channel, tracks, weeks, valuesByTrackAndWeek)
  ))

  return {
    channels,
    subtitle: 'Actual reactivation touches by week and track.',
    title: 'Weekly Activity',
    tracks,
    weeks,
  }
}
