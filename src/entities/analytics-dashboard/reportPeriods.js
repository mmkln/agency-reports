const DAY_MS = 24 * 60 * 60 * 1000

function parseDateOnly(value) {
  const date = new Date(`${String(value ?? '').slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, amount) {
  return new Date(date.getTime() + (amount * DAY_MS))
}

function startOfWeek(date) {
  const daysSinceMonday = (date.getUTCDay() + 6) % 7
  return addDays(date, -daysSinceMonday)
}

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function endOfMonth(date) {
  return addDays(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)), -1)
}

function addMonths(date, amount) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
}

function buildWeeklyPeriods(historyStart, currentDate) {
  const firstPeriod = startOfWeek(historyStart)
  const currentPeriod = startOfWeek(currentDate)
  const periods = []

  for (let cursor = firstPeriod; cursor <= currentPeriod; cursor = addDays(cursor, 7)) {
    periods.push({
      end: toIsoDate(addDays(cursor, 6)),
      isCurrent: cursor.getTime() === currentPeriod.getTime(),
      key: `week:${toIsoDate(cursor)}`,
      start: toIsoDate(cursor),
      type: 'week',
    })
  }

  return periods.reverse()
}

function buildMonthlyPeriods(historyStart, currentDate) {
  const firstPeriod = startOfMonth(historyStart)
  const currentPeriod = startOfMonth(currentDate)
  const periods = []

  for (let cursor = firstPeriod; cursor <= currentPeriod; cursor = addMonths(cursor, 1)) {
    periods.push({
      end: toIsoDate(endOfMonth(cursor)),
      isCurrent: cursor.getTime() === currentPeriod.getTime(),
      key: `month:${toIsoDate(cursor).slice(0, 7)}`,
      start: toIsoDate(cursor),
      type: 'month_to_date',
    })
  }

  return periods.reverse()
}

export function buildReportPeriods({
  currentDate: currentDateValue,
  historyStart: historyStartValue,
  periodType,
  reports = [],
}) {
  const currentDate = parseDateOnly(currentDateValue)
  const historyStart = parseDateOnly(historyStartValue)
  if (!currentDate || !historyStart || historyStart > currentDate) {
    return []
  }

  const calendarPeriods = periodType === 'month_to_date'
    ? buildMonthlyPeriods(historyStart, currentDate)
    : buildWeeklyPeriods(historyStart, currentDate)
  const reportsByKey = new Map(
    reports
      .filter((report) => report?.key)
      .map((report) => [report.key, report]),
  )

  return calendarPeriods.map((period) => {
    const report = reportsByKey.get(period.key)
    return {
      ...period,
      calculatedAt: report?.calculatedAt ?? null,
      calculationStatus: report?.calculationStatus ?? 'not_calculated',
      snapshotId: report?.snapshotId ?? null,
      status: report?.status ?? 'not_calculated',
    }
  })
}
