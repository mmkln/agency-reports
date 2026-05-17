import { Navigate } from 'react-router-dom'

function buildReportsDashboardsRedirect({ clientId, reportId }) {
  const searchParams = new URLSearchParams()

  if (clientId) {
    searchParams.set('clientId', clientId)
  }

  if (reportId) {
    searchParams.set('reportId', reportId)
  }

  const search = searchParams.toString()
  const hash = reportId ? '#selected-report' : '#report-archive'

  return `/client/reports-dashboards${search ? `?${search}` : ''}${hash}`
}

export function ClientReportsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId

  return (
    <Navigate
      replace
      to={buildReportsDashboardsRedirect({
        clientId,
        reportId: routeParams.reportId,
      })}
    />
  )
}
