import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'

import { listAdminClients } from '../../../domain/services/adminClientService'
import { getAdminPerformanceDashboardPeriod } from '../../../domain/services/adminPerformanceDashboardService'
import { AdminPerformanceDashboardEditor } from '../../../features/admin-performance-dashboards'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'

export function AdminPerformanceDashboardEditorPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const periodId = routeParams.periodId
  const editorResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-performance-dashboard-editor:${periodId ?? 'missing'}`,
    initialData: {
      clients: [],
      period: null,
    },
    load: () => {
      if (!periodId) {
        throw new Error('Performance dashboard period id is required.')
      }

      return runtime.dataClient.read((repositories) => ({
        clients: listAdminClients({
          repositories,
          viewer: runtime.viewer,
        }),
        period: getAdminPerformanceDashboardPeriod({
          periodId,
          repositories,
          viewer: runtime.viewer,
        }),
      }))
    },
  })

  if (editorResource.status === 'loading') {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-app-gutter py-6">
        <div className="h-28 rounded-block border border-control-border bg-block shadow-card" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <div className="h-72 rounded-block border border-control-border bg-block shadow-card" />
            <div className="h-96 rounded-block border border-control-border bg-block shadow-card" />
          </div>
          <div className="h-64 rounded-block border border-control-border bg-block shadow-card" />
        </div>
      </div>
    )
  }

  if (editorResource.status === 'error') {
    return (
      <div className="mx-auto grid w-full max-w-3xl gap-4 px-app-gutter py-10">
        <div className="rounded-block border border-destructive/20 bg-destructive/10 p-5">
          <h2 className="text-heading text-destructive">Performance dashboard was not found</h2>
          <p className="mt-2 text-body text-destructive">
            {editorResource.error}
          </p>
          <Button asChild className="mt-4" type="button" variant="outline">
            <Link to="/admin/performance-dashboards">Back to Performance Dashboards</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminPerformanceDashboardEditor
      clients={editorResource.data.clients}
      initialPeriod={editorResource.data.period}
      runtime={runtime}
      toast={toast}
    />
  )
}
