import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  DashboardEmbedFrame,
  DashboardPageSummary,
  DashboardUnavailableState,
  LatestSummaryCallout,
  NoDashboardState,
} from '../../../widgets/dashboard-embed'
import { Skeleton } from '@/shared/ui'
import { canRecordClientPortalActivity, getClientPageMode } from '../clientPageAccess'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientDashboardOpened({ clientId, dashboardId, runtime }) {
  if (!canRecordClientPortalActivity(runtime.viewer) || !dashboardId) {
    return
  }

  void runtime.dataClient.write((repositories) => recordActivityEvent({
    clientId,
    eventType: ACTIVITY_EVENT_TYPES.DASHBOARD_OPENED,
    idGenerator: createUuid,
    metadata: {
      dashboardId,
    },
    repositories,
    viewer: runtime.viewer,
  }))
}

export function ClientDashboardPage({ routeParams = {}, runtime }) {
  const recordedDashboardOpenRef = useRef('')
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const mode = getClientPageMode(runtime.viewer)
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-dashboard:${clientId ?? ''}:${routeParams.dashboardId ?? ''}:${mode}`,
    load: () => runtime.dataClient.read((repositories) => getClientDashboardPage({
      clientId,
      dashboardId: routeParams.dashboardId,
      mode,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data
  const dashboardId = page?.dashboard?.id ?? ''

  useEffect(() => {
    if (
      page?.status !== 'ready'
      || page?.redirectTo
      || !dashboardId
      || recordedDashboardOpenRef.current === dashboardId
    ) {
      return
    }

    recordedDashboardOpenRef.current = dashboardId
    recordClientDashboardOpened({
      clientId,
      dashboardId,
      runtime,
    })
  }, [clientId, dashboardId, page?.redirectTo, page?.status, runtime])

  if (pageResource.status === 'loading' || !page) {
    return <Skeleton className="h-[420px] w-full" />
  }

  if (page.status === 'error') {
    return <AccessDeniedState />
  }

  if (page.redirectTo) {
    return <Navigate replace to={page.redirectTo} />
  }

  if (!page.dashboard) {
    return <NoDashboardState />
  }

  return (
    <div className="grid gap-6">
      <DashboardPageSummary clientId={clientId} dashboard={page.dashboard} />

      {!page.dashboard.isAvailable ? (
        <DashboardUnavailableState dashboard={page.dashboard} />
      ) : (
        <DashboardEmbedFrame dashboard={page.dashboard} />
      )}

      <LatestSummaryCallout clientId={clientId} report={page.latestReport} />
    </div>
  )
}
