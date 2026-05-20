import { useState } from 'react'

import { Button } from '@/shared/ui'

import {
  ACTIVITY_EVENT_TYPES,
  listClientActivityEvents,
} from '../../../domain/services/activityTrackingService'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { InlineEmptyState, WorkspaceCard } from '../../admin-client-workspace'
import { Icon } from '../../../shared/icons'

const activityEventMeta = {
  [ACTIVITY_EVENT_TYPES.DASHBOARD_OPENED]: {
    icon: 'layoutDashboard',
    label: 'Opened dashboard',
  },
  [ACTIVITY_EVENT_TYPES.NEEDED_ACTION_ANSWERED]: {
    icon: 'checkCircle2',
    label: 'Answered client request',
  },
  [ACTIVITY_EVENT_TYPES.OVERVIEW_OPENED]: {
    icon: 'user',
    label: 'Opened overview',
  },
  [ACTIVITY_EVENT_TYPES.REPORT_OPENED]: {
    icon: 'fileText',
    label: 'Opened report',
  },
}

function formatActivityTime(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

function getActivityDetail(event) {
  if (event.metadata?.reportId) {
    return `Report: ${event.metadata.reportId}`
  }

  if (event.metadata?.dashboardId) {
    return `Dashboard: ${event.metadata.dashboardId}`
  }

  if (event.metadata?.actionId) {
    return `Request: ${event.metadata.actionId}`
  }

  return event.actorEmail || event.actorRole || 'Client portal'
}

export function RecentClientActivityPanel({ clientId, runtime }) {
  const [reloadTick, setReloadTick] = useState(0)
  const eventsResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-activity:${clientId ?? ''}:${reloadTick}`,
    initialData: [],
    load: () => runtime.dataClient.read((repositories) => listClientActivityEvents({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const events = eventsResource.data ?? []

  function refreshActivity() {
    setReloadTick((currentTick) => currentTick + 1)
  }

  return (
    <WorkspaceCard
      action={(
        <Button onClick={refreshActivity} size="sm" type="button" variant="ghost">
          Refresh
        </Button>
      )}
      description="Local QA activity from portal pages."
      iconName="clock"
      title="Recent Client Activity"
    >
      {events.length > 0 ? (
        <div className="grid gap-2">
          {events.map((event) => {
            const meta = activityEventMeta[event.eventType] ?? {
              icon: 'clock',
              label: event.eventType,
            }

            return (
              <article className="rounded-control bg-block-subtle p-3" key={event.id}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control bg-action-muted text-action">
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-ui text-text-primary">{meta.label}</p>
                      <span className="shrink-0 text-label font-normal text-text-muted">{formatActivityTime(event.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-label font-normal text-text-muted">
                      {event.actorName} | {getActivityDetail(event)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <InlineEmptyState iconName="clock" title="No client activity yet">
          Client-facing events will appear here after the portal, dashboard, reports, or needed-action workflows are used.
        </InlineEmptyState>
      )}
    </WorkspaceCard>
  )
}
