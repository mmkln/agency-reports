import { getClinicWeeklyOperatorPage } from '../../../domain/services/clinicReportingService'
import { WeeklyOperatorDashboard } from '../../../widgets/clinic-reporting'

export function TeamClinicOperatorPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClinicWeeklyOperatorPage({
    clientId,
    periodId: routeParams.periodId,
    repositories: runtime.repositories,
    source: routeParams.preview === 'draft' ? 'draft' : 'published',
    viewer: runtime.viewer,
  })

  return <WeeklyOperatorDashboard page={page} />
}
