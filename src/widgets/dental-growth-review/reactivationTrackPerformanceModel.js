const BOOKED_STAGE_IDS = new Set([
  'booked',
  'booked_appointment',
])

function getStageId(stage) {
  return String(stage?.id || stage?.stage_id || '').trim()
}

function getTrackKey(track) {
  return String(track?.key || track?.id || '').trim().toUpperCase()
}

function getBookedStage(track) {
  return (track?.stages ?? []).find((stage) => BOOKED_STAGE_IDS.has(getStageId(stage)))
}

export function buildTrackPerformanceModel(funnelChart) {
  const tracks = funnelChart?.breakdowns?.by_track ?? []

  const rows = tracks
    .map((track) => {
      const bookedStage = getBookedStage(track)
      const key = getTrackKey(track)

      return {
        id: track.id || key,
        key,
        label: track.label || `Track ${key}`,
        value: Number(bookedStage?.count ?? 0),
      }
    })
    .filter((row) => row.key)

  const total = rows.reduce((sum, row) => sum + row.value, 0)

  if (!total) {
    return null
  }

  return {
    chartRows: rows.filter((row) => row.value > 0),
    rows: rows.map((row) => ({
      ...row,
      percentage: Math.round((row.value / total) * 100),
    })),
    total,
  }
}
