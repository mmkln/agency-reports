import { getClinicMonthlyStrategyPage } from '../../../domain/services/clinicReportingService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Skeleton } from '@/shared/ui'
import { MonthlyStrategyDashboard } from '../../../widgets/clinic-reporting'

export function ClientMonthlyStrategyPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:clinic-monthly-strategy:${clientId ?? ''}:${routeParams.periodId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClinicMonthlyStrategyPage({
      clientId,
      periodId: routeParams.periodId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  return <MonthlyStrategyDashboard page={page} />
}
