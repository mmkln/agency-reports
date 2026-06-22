const BOOKED_STAGE_IDS = new Set([
  'booked',
  'booked_appointment',
])

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
}

function getStageCount(stage) {
  return Math.max(Number(stage?.stage_count ?? stage?.count ?? stage?.output_count ?? 0) || 0, 0)
}

function getCohortCount(funnelChart) {
  return getStageCount(funnelChart?.stages?.[0])
}

function findReplyStage(funnelChart) {
  const stages = Array.isArray(funnelChart?.stages) ? funnelChart.stages : []

  return stages.find((stage) => {
    const id = normalizeKey(stage.id ?? stage.stage_id)
    const name = normalizeKey(stage.stage_name ?? stage.name)

    return id.includes('replied') || name.includes('replied')
  })
}

function findBookedStage(funnelChart) {
  const stages = Array.isArray(funnelChart?.stages) ? funnelChart.stages : []

  return stages.find((stage) => {
    const id = normalizeKey(stage.id ?? stage.stage_id)
    const name = normalizeKey(stage.stage_name ?? stage.name)

    return BOOKED_STAGE_IDS.has(id) || BOOKED_STAGE_IDS.has(name)
  })
}

function formatInteger(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatPercent(numerator, denominator) {
  if (!denominator || numerator <= 0) {
    return '0%'
  }

  const value = (numerator / denominator) * 100

  return `${Math.round(value)}%`
}

export function buildCampaignKpiCardsModel(funnelChart) {
  const cohortCount = getCohortCount(funnelChart)
  const repliesCount = getStageCount(findReplyStage(funnelChart))
  const bookedCount = getStageCount(findBookedStage(funnelChart))

  if (!cohortCount || !repliesCount) {
    return []
  }

  return [
    {
      helper: `${formatPercent(repliesCount, cohortCount)} reply rate`,
      iconName: 'messageSquare',
      id: 'patient-replies',
      label: 'Patient replies',
      tone: 'blue',
      value: formatInteger(repliesCount),
    },
    {
      helper: `${formatInteger(bookedCount)} of ${formatInteger(repliesCount)} replies booked`,
      iconName: 'trendingUp',
      id: 'reply-to-booking',
      label: 'Reply → Booking',
      tone: 'purple',
      value: formatPercent(bookedCount, repliesCount),
    },
  ]
}
