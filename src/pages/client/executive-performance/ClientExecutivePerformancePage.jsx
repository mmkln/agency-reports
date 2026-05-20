import { getClinicExecutivePerformancePage } from '../../../domain/services/clinicReportingService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Skeleton } from '@/shared/ui'
import { ExecutivePerformanceDashboard } from '../../../widgets/clinic-reporting'

export function ClientExecutivePerformancePage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:clinic-executive-performance:${clientId ?? ''}:${routeParams.periodId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClinicExecutivePerformancePage({
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

  return <ExecutivePerformanceDashboard page={page} />
}
