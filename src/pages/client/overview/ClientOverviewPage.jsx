import { useEffect, useRef, useState } from 'react'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientOverview } from '../../../domain/services/clientOverviewService'
import { answerNeededAction } from '../../../domain/services/neededFromClientService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import {
  AccessDeniedState,
  ActiveTasksBlock,
  DashboardOverviewBlock,
  EmptyOverviewState,
  LatestMonthlySummaryBlock,
  LatestUpdateBlock,
  LoadingOverviewState,
  NeededFromClientBlock,
  PerformanceOverviewBlock,
  ProgressSummaryBlock,
} from '../../../widgets/client-overview'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientActivity({ clientId, eventType, metadata = {}, runtime }) {
  if (runtime.viewer.role !== USER_ROLES.CLIENT_USER) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType,
    idGenerator: createUuid,
    metadata,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}

export function ClientOverviewPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const recordedOverviewOpenRef = useRef(false)
  const [, setRevision] = useState(0)
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = routeParams.preview === 'draft' ? 'draft' : 'published'
  const dashboardHrefBase = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN
    ? '/admin/client-dashboard-preview'
    : '/client/dashboard'
  const performanceHrefBase = runtime.viewer.role === USER_ROLES.AGENCY_ADMIN
    ? '/admin/client-performance-preview'
    : '/client/performance'
  const overviewResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientOverview({
      clientId,
      repositories,
      source: previewSource,
      viewer: runtime.viewer,
    })),
  })
  const overview = overviewResource.data

  useEffect(() => {
    if (overviewResource.status !== 'ready' || overview?.status !== 'ready' || recordedOverviewOpenRef.current) {
      return
    }

    recordedOverviewOpenRef.current = true
    recordClientActivity({
      clientId,
      eventType: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      metadata: {
        source: 'client_overview',
      },
      runtime,
    })
  }, [clientId, overview?.status, overviewResource.status, runtime])

  if (overviewResource.status === 'loading' || !overview) {
    return <LoadingOverviewState />
  }

  if (overviewResource.status === 'error') {
    return (
      <div className="rounded-block border border-destructive/20 bg-destructive/10 px-4 py-3 text-ui text-destructive">
        {overviewResource.error}
      </div>
    )
  }

  if (overview.status === 'error') {
    return <AccessDeniedState />
  }

  return (
    <>
      {overview.isEmpty ? (
        <EmptyOverviewState client={overview.client} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="grid gap-6">
            <NeededFromClientBlock
              actions={overview.neededActions}
              requestsHref={`/client/requests?clientId=${overview.client.id}`}
              onAnswerAction={runtime.viewer.role === USER_ROLES.CLIENT_USER
                ? (actionId, message) => {
                    answerNeededAction({
                      actionId,
                      message,
                      repositories: runtime.repositories,
                      viewer: runtime.viewer,
                    })
                    recordClientActivity({
                      clientId,
                      eventType: ACTIVITY_EVENT_TYPES.NEEDED_ACTION_ANSWERED,
                      metadata: {
                        actionId,
                      },
                      runtime,
                    })
                    setRevision((currentRevision) => currentRevision + 1)
                    void overviewResource.reload()
                    toast.success('Response sent', 'The agency team can now see your answer.')
                  }
                : null}
            />
            <LatestUpdateBlock focusItems={overview.currentFocus} update={overview.latestUpdate} />
            <ActiveTasksBlock tasks={overview.activeTasks} />
          </div>
          <aside className="grid gap-6">
            <ProgressSummaryBlock projects={overview.progressSummary} />
            <PerformanceOverviewBlock
              clientId={overview.client.id}
              hrefBase={performanceHrefBase}
              preview={overview.performancePreview}
            />
            <DashboardOverviewBlock
              clientId={overview.client.id}
              dashboard={overview.dashboard}
              hrefBase={dashboardHrefBase}
            />
            <LatestMonthlySummaryBlock clientId={overview.client.id} report={overview.latestReport} />
          </aside>
        </div>
      )}
    </>
  )
}
