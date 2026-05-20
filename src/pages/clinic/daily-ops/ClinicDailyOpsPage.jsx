import { getClinicDailyOperationsPage } from '../../../domain/services/clinicReportingService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Skeleton } from '@/shared/ui'
import { DailyOperationsDashboard } from '../../../widgets/clinic-reporting'

export function ClinicDailyOpsPage({ routeParams = {}, runtime }) {
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const source = routeParams.preview === 'draft' ? 'draft' : 'published'
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:clinic-daily-ops:${clientId ?? ''}:${routeParams.periodId ?? ''}:${source}`,
    load: () => runtime.dataClient.read((repositories) => getClinicDailyOperationsPage({
      clientId,
      periodId: routeParams.periodId,
      repositories,
      source,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data

  if (pageResource.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  return <DailyOperationsDashboard page={page} />
}
