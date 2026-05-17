import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientActionNeededPage } from '../../../domain/services/clientActionNeededService'
import { answerNeededAction } from '../../../domain/services/neededFromClientService'
import { USER_ROLES } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import { Panel, PanelBody } from '@/shared/ui'
import { ActionNeededInbox, ActionNeededSummary } from '../../../widgets/client-action-needed'
import { AccessDeniedState } from '../../../widgets/client-overview'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientActivity({ actionId, clientId, repositories, runtime }) {
  if (runtime.viewer.role !== USER_ROLES.CLIENT_USER) {
    return
  }

  recordActivityEvent({
    clientId,
    eventType: ACTIVITY_EVENT_TYPES.NEEDED_ACTION_ANSWERED,
    idGenerator: createUuid,
    metadata: {
      actionId,
      source: 'client_action_needed',
    },
    repositories,
    viewer: runtime.viewer,
  })
}

export function ClientActionNeededPage({ routeParams = {}, runtime }) {
  const toast = useToast()
  const clientId = routeParams.clientId ?? runtime.defaultClientId
  const actionNeededResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:client-action-needed:${clientId}`,
    initialData: {
      actions: [],
      client: null,
      counts: {
        all: 0,
        answered: 0,
        completed: 0,
        dueSoon: 0,
        open: 0,
        overdue: 0,
      },
    },
    load: () => runtime.dataClient.read((repositories) => getClientActionNeededPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    })),
  })
  const page = actionNeededResource.data

  function answerAction(action, message) {
    void runtime.dataClient.write((repositories) => {
      const answeredAction = answerNeededAction({
        actionId: action.id,
        message,
        repositories,
        viewer: runtime.viewer,
      })

      recordClientActivity({
        actionId: action.id,
        clientId,
        repositories,
        runtime,
      })

      return answeredAction
    })
      .then(() => {
        void actionNeededResource.reload()
        toast.success('Response sent', `${action.title} was marked answered.`)
      })
      .catch((caughtError) => {
        toast.error('Response was not sent', caughtError.message)
      })
  }

  if (actionNeededResource.status === 'error' || page?.status === 'error') {
    return <AccessDeniedState />
  }

  if (actionNeededResource.status === 'loading') {
    return (
      <Panel>
        <PanelBody className="min-h-[260px] animate-pulse" />
      </Panel>
    )
  }

  return (
    <div className="grid gap-6">
      <ActionNeededSummary counts={page.counts} />
      <ActionNeededInbox
        actions={page.actions}
        counts={page.counts}
        onAnswer={answerAction}
      />
    </div>
  )
}
