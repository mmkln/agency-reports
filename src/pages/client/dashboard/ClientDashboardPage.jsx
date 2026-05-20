import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientDashboardPage } from '../../../domain/services/clientDashboardService'
import { isClientPortalRole, USER_ROLES } from '../../../entities/profile'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  DashboardEmbedFrame,
  DashboardPageSummary,
  DashboardUnavailableState,
  LatestSummaryCallout,
  NoDashboardState,
} from '../../../widgets/dashboard-embed'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientDashboardOpened({ clientId, dashboardId, runtime }) {
  if (!isClientPortalRole(runtime.viewer.role) || !dashboardId) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType: ACTIVITY_EVENT_TYPES.DASHBOARD_OPENED,
    idGenerator: createUuid,
    metadata: {
      dashboardId,
    },
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}

export function ClientDashboardPage({ routeParams = {}, runtime }) {
  const recordedDashboardOpenRef = useRef('')
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const page = getClientDashboardPage({
    clientId,
    dashboardId: routeParams.dashboardId,
    mode: runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client',
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
  const dashboardId = page.dashboard?.id ?? ''

  useEffect(() => {
    if (
      page.status !== 'ready'
      || page.redirectTo
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
  }, [clientId, dashboardId, page.redirectTo, page.status, runtime])

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
