import { getClinicDailyOperationsPage } from '../../../domain/services/clinicReportingService'
import { DailyOperationsDashboard } from '../../../widgets/clinic-reporting'

export function ClinicDailyOpsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClinicDailyOperationsPage({
    clientId,
    periodId: routeParams.periodId,
    repositories: runtime.repositories,
    source: routeParams.preview === 'draft' ? 'draft' : 'published',
    viewer: runtime.viewer,
  })

  return <DailyOperationsDashboard page={page} />
}
