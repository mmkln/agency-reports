import { useState } from 'react'

import { getClientOverview } from '../../../domain/services/clientOverviewService'
import { answerNeededAction } from '../../../domain/services/neededFromClientService'
import { USER_ROLES } from '../../../entities/profile'
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
  ProgressSummaryBlock,
} from '../../../widgets/client-overview'

export function ClientOverviewPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const [, setRevision] = useState(0)
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const overview = getClientOverview({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })

  if (overview.status === 'error') {
    return <AccessDeniedState />
  }

  if (overview.status === 'loading') {
    return <LoadingOverviewState />
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
              onAnswerAction={runtime.viewer.role === USER_ROLES.CLIENT_USER
                ? (actionId, message) => {
                    answerNeededAction({
                      actionId,
                      message,
                      repositories: runtime.repositories,
                      viewer: runtime.viewer,
                    })
                    setRevision((currentRevision) => currentRevision + 1)
                    toast.success('Response sent', 'The agency team can now see your answer.')
                  }
                : null}
            />
            <LatestUpdateBlock focusItems={overview.currentFocus} update={overview.latestUpdate} />
            <ActiveTasksBlock tasks={overview.activeTasks} />
          </div>
          <aside className="grid gap-6">
            <ProgressSummaryBlock projects={overview.progressSummary} />
            <DashboardOverviewBlock clientId={overview.client.id} dashboard={overview.dashboard} />
            <LatestMonthlySummaryBlock clientId={overview.client.id} report={overview.latestReport} />
          </aside>
        </div>
      )}
    </>
  )
}
