import { getClinicExecutivePerformancePage } from '../../../domain/services/clinicReportingService'
import { ExecutivePerformanceDashboard } from '../../../widgets/clinic-reporting'

export function ClientExecutivePerformancePage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClinicExecutivePerformancePage({
    clientId,
    periodId: routeParams.periodId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  return <ExecutivePerformanceDashboard page={page} />
}
