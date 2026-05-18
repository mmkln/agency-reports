import { useEffect, useRef } from 'react'

import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientOverviewPage } from '../../../domain/services/clientOverviewService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import {
  AccessDeniedState,
  ActiveWorkBlock,
  ContactAskQuestionBlock,
  ClientClinicOverviewView,
  EmptyOverviewState,
  FilesLinksOverviewBlock,
  LatestUpdateBlock,
  LoadingOverviewState,
  NeededFromClientBlock,
  ProgressSummaryBlock,
  ReportsDashboardsOverviewBlock,
} from '../../../widgets/client-overview'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientActivity({
  clientId,
  eventType,
  metadata = {},
  repositories,
  runtime,
}) {
  if (runtime.viewer.role !== USER_ROLES.CLIENT_USER) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType,
    idGenerator: createUuid,
    metadata,
    repositories,
    viewer: runtime.viewer,
  })
}

export function ClientOverviewPage({ routeParams = {}, runtime }) {
  const recordedOverviewOpenRef = useRef(false)
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const previewSource = routeParams.preview === 'draft' ? 'draft' : 'published'
  const overviewResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:${clientId}:${previewSource}`,
    load: () => runtime.dataClient.read((repositories) => getClientOverviewPage({
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
    void runtime.dataClient.write((repositories) => recordClientActivity({
      clientId,
      eventType: ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED,
      metadata: {
        source: 'client_overview',
      },
      repositories,
      runtime,
    }))
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

  if (overview.template === 'clinic' && overview.clinicOverview) {
    return <ClientClinicOverviewView overview={overview} />
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
              requestsHref={`/client/action-needed?clientId=${overview.client.id}`}
            />
            <LatestUpdateBlock
              clientId={overview.client.id}
              focusItems={overview.currentFocus}
              update={overview.latestUpdate}
            />
            <ActiveWorkBlock
              projectsHref={`/client/projects?clientId=${overview.client.id}`}
              workItems={overview.activeWorkItems}
            />
          </div>
          <aside className="grid gap-6">
            <ProgressSummaryBlock projects={overview.progressSummary} />
            <ReportsDashboardsOverviewBlock
              clientId={overview.client.id}
              dashboard={overview.dashboard}
              performancePreview={overview.performancePreview}
              report={overview.latestReport}
            />
            <FilesLinksOverviewBlock
              clientId={overview.client.id}
              fileLinks={overview.fileLinksPreview}
            />
            <ContactAskQuestionBlock client={overview.client} />
          </aside>
        </div>
      )}
    </>
  )
}
