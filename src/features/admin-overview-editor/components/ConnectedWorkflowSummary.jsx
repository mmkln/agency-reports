import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'

import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../../../entities/client-work-item'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import { VISIBILITY } from '../../../entities/update'
import { Icon } from '../../../shared/icons'
import { EditorCard } from './EditorCard'

export function ConnectedWorkflowSummary({ editor }) {
  const clientWorkItems = editor.clientWorkItems ?? []
  const tasks = editor.tasks ?? []
  const neededActions = editor.neededActions ?? []
  const clientId = editor.client.id
  const publishedWorkItems = clientWorkItems.filter((item) => (
    item.publish_state === CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED
  ))
  const reviewWorkItems = clientWorkItems.filter((item) => (
    [
      CLIENT_WORK_ITEM_PUBLISH_STATES.DRAFT,
      CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    ].includes(item.publish_state)
  ))
  const internalTasks = tasks.filter((task) => task.visibility === VISIBILITY.INTERNAL)
  const openRequests = neededActions.filter((action) => [
    NEEDED_ACTION_STATUSES.PENDING,
    NEEDED_ACTION_STATUSES.ANSWERED,
  ].includes(action.status))
  const answeredRequests = neededActions.filter((action) => action.status === NEEDED_ACTION_STATUSES.ANSWERED)

  const rows = [
    {
      action: 'Open review',
      href: `/admin/client-work-review?clientId=${clientId}`,
      iconName: 'send',
      meta: `${publishedWorkItems.length} published - ${reviewWorkItems.length} in review - ${internalTasks.length} internal tasks`,
      title: 'Active work',
    },
    {
      action: 'Manage requests',
      href: `/admin/client-requests?clientId=${clientId}`,
      iconName: 'messageSquare',
      meta: `${openRequests.length} open - ${answeredRequests.length} answered`,
      title: 'Client requests',
    },
  ]

  return (
    <EditorCard iconName="link" title="Connected Workflow">
      <div className="grid gap-1">
        {rows.map((row) => (
          <div className="group flex items-center gap-3 rounded-control px-2 py-2 transition-colors hover:bg-control" key={row.title}>
            <Icon className="text-text-quaternary" name={row.iconName} size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-ui text-text-primary">{row.title}</p>
              <p className="text-label font-normal text-text-muted">{row.meta}</p>
            </div>
            <Button asChild size="sm" type="button" variant="ghost">
              <Link to={row.href}>
                {row.action}
                <Icon className="text-text-quaternary" name="arrowUpRight" size={13} />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </EditorCard>
  )
}
