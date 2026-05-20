import {
  ACTIVITY_EVENT_TYPES,
  recordActivityEvent,
} from '../../../domain/services/activityTrackingService'
import { getClientActionNeededPage } from '../../../domain/services/clientActionNeededService'
import { answerNeededAction } from '../../../domain/services/neededFromClientService'
import { isClientPortalRole } from '../../../entities/profile'
import { useAsyncResource } from '../../../shared/data/useAsyncResource'
import { useToast } from '../../../shared/notifications'
import { Panel, PanelBody } from '@/shared/ui'
import { ActionNeededInbox } from '../../../widgets/client-action-needed'
import { AccessDeniedState } from '../../../widgets/client-overview'

function createUuid() {
  return crypto.randomUUID()
}

function recordClientActivity({ actionId, clientId, repositories, runtime }) {
  if (!isClientPortalRole(runtime.viewer.role)) {
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
        approved: 0,
        changesRequested: 0,
        clinic: 0,
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

  function answerAction(action, message, options = {}) {
    void runtime.dataClient.write((repositories) => {
      const answeredAction = answerNeededAction({
        actionId: action.id,
        message,
        repositories,
        responseStatus: options.responseStatus,
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
    <ActionNeededInbox
      actions={page.actions}
      counts={page.counts}
      onAnswer={answerAction}
    />
  )
}
