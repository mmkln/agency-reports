export const REPORT_FILTER_ALL = 'all'

export const initialReportFilters = Object.freeze({
  clientId: REPORT_FILTER_ALL,
  period: '',
  search: '',
  status: REPORT_FILTER_ALL,
})

const reportingMonthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
})

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function monthRange(monthValue) {
  if (!monthValue) {
    return null
  }

  const [year, month] = monthValue.split('-').map(Number)

  if (!year || !month) {
    return null
  }

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  return { end, start }
}

function formatReportingMonth(monthValue) {
  const [year, month] = String(monthValue ?? '').split('-').map(Number)

  if (!year || !month) {
    return monthValue
  }

  return reportingMonthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}

function toMonthValue(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function createInitialReportFilters(clientId) {
  return {
    ...initialReportFilters,
    clientId: clientId || REPORT_FILTER_ALL,
  }
}

export function getReportMonthOptions(reports) {
  const months = new Set()

  reports.forEach((report) => {
    const reportStart = new Date(report.periodStart)
    const reportEnd = new Date(report.periodEnd)

    if (Number.isNaN(reportStart.getTime()) || Number.isNaN(reportEnd.getTime()) || reportStart > reportEnd) {
      return
    }

    const cursor = new Date(Date.UTC(reportStart.getUTCFullYear(), reportStart.getUTCMonth(), 1))
    const end = new Date(Date.UTC(reportEnd.getUTCFullYear(), reportEnd.getUTCMonth(), 1))

    while (cursor <= end) {
      months.add(toMonthValue(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
  })

  return [...months]
    .sort((leftMonth, rightMonth) => rightMonth.localeCompare(leftMonth))
    .map((month) => ({
      label: formatReportingMonth(month),
      value: month,
    }))
}

function reportOverlapsMonth(report, monthValue) {
  const range = monthRange(monthValue)

  if (!range) {
    return true
  }

  const reportStart = new Date(report.periodStart)
  const reportEnd = new Date(report.periodEnd)

  if (Number.isNaN(reportStart.getTime()) || Number.isNaN(reportEnd.getTime())) {
    return false
  }

  return reportStart <= range.end && reportEnd >= range.start
}

export function filterReports(reports, filters) {
  const search = normalizeSearchValue(filters.search)

  return reports.filter((report) => {
    if (filters.clientId !== REPORT_FILTER_ALL && report.clientId !== filters.clientId) {
      return false
    }

    if (filters.status !== REPORT_FILTER_ALL && report.status !== filters.status) {
      return false
    }

    if (!reportOverlapsMonth(report, filters.period)) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      report.client.name,
      report.client.portalSlug,
      report.clientDecisionsNeeded,
      report.nextActions,
      report.problems,
      report.results,
      report.summary,
      report.title,
      report.whatWeDid,
      report.wins,
    ].some((value) => normalizeSearchValue(value).includes(search))
  })
}
