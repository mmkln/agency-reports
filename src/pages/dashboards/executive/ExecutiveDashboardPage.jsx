import executivePreviewWatermarkUrl from '@/assets/executive-preview-watermark.png'
import { useExecutiveDashboardReadModel } from '@/features/executive-dashboard-data'
import { PageShell, Skeleton } from '@/shared/ui'
import { ExecutiveDashboard } from '@/widgets/executive-dashboard'

export function ExecutiveDashboardPage({ routeParams = {}, runtime }) {
  const executiveDashboard = useExecutiveDashboardReadModel({
    routeParams,
    runtime,
  })

  if (executiveDashboard.status === 'error') {
    throw new Error(executiveDashboard.error || 'Executive Dashboard could not be loaded.')
  }

  if (executiveDashboard.status === 'loading' || !executiveDashboard.page) {
    return (
      <PageShell className="pb-section pt-card" width="wide">
        <Skeleton className="min-h-screen w-full" />
      </PageShell>
    )
  }

  return (
    <PageShell className="pb-section pt-card" width="wide">
      <ExecutiveDashboard page={executiveDashboard.page} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 bg-repeat opacity-10"
        style={{
          backgroundImage: `url(${executivePreviewWatermarkUrl})`,
          backgroundSize: '112px auto',
        }}
      />
    </PageShell>
  )
}
