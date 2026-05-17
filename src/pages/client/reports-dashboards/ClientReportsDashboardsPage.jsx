import { useEffect, useRef } from 'react'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientReportsDashboardsPage } from '../../../domain/services/clientReportsDashboardsService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { Panel, PanelBody } from '@/shared/ui'
import { AccessDeniedState } from '../../../widgets/client-overview'
import {
  CurrentPerformanceSection,
  ReportArchiveSection,
  ResultsHeader,
  ResultsTrustContext,
  SelectedReportSection,
  SourceDashboardSection,
} from '../../../widgets/client-reports-dashboards'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientReportOpened({ clientId, reportId, repositories, runtime }) {
  if (runtime.viewer.role !== USER_ROLES.CLIENT_USER || !reportId) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType: ACTIVITY_EVENT_TYPES.REPORT_OPENED,
    idGenerator: createUuid,
    metadata: {
      reportId,
      source: 'client_reports_dashboards',
    },
    repositories,
    viewer: runtime.viewer,
  })
}

export function ClientReportsDashboardsPage({ routeParams = {}, runtime }) {
  const recordedReportOpenRef = useRef('')
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const mode = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN ? 'admin_preview' : 'client'
  const performancePeriodId = routeParams.performancePeriodId ?? routeParams.periodId
  const pageResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:reports-dashboards:${clientId}:${routeParams.dashboardId ?? ''}:${performancePeriodId ?? ''}:${routeParams.reportId ?? ''}`,
    load: () => runtime.dataClient.read((repositories) => getClientReportsDashboardsPage({
      clientId,
      dashboardId: routeParams.dashboardId,
      mode,
      performancePeriodId,
      reportId: routeParams.reportId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = pageResource.data
  const selectedReportId = page?.reportsPage?.selectedReport?.id ?? ''

  useEffect(() => {
    if (
      pageResource.status !== 'ready'
      || page?.status !== 'ready'
      || !selectedReportId
      || recordedReportOpenRef.current === selectedReportId
    ) {
      return
    }

    recordedReportOpenRef.current = selectedReportId
    void runtime.dataClient.write((repositories) => recordClientReportOpened({
      clientId,
      reportId: selectedReportId,
      repositories,
      runtime,
    }))
  }, [clientId, page?.status, pageResource.status, runtime, selectedReportId])

  if (pageResource.status === 'loading' || !page) {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  if (pageResource.status === 'error' || page.status === 'error') {
    return <AccessDeniedState />
  }

  return (
    <div className="grid gap-6">
      <ResultsHeader page={page} />
      <CurrentPerformanceSection mode={mode} performancePage={page.performancePage} />
      <ResultsTrustContext trustContext={page.trustContext} />
      <SourceDashboardSection clientId={clientId} dashboardPage={page.dashboardPage} />
      <SelectedReportSection clientId={clientId} reportsPage={page.reportsPage} />
      <ReportArchiveSection clientId={clientId} reportsPage={page.reportsPage} />
    </div>
  )
}
