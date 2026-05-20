import { getClinicMonthlyStrategyPage } from '../../../domain/services/clinicReportingService'
import { MonthlyStrategyDashboard } from '../../../widgets/clinic-reporting'

export function ClientMonthlyStrategyPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClinicMonthlyStrategyPage({
    clientId,
    periodId: routeParams.periodId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  return <MonthlyStrategyDashboard page={page} />
}
