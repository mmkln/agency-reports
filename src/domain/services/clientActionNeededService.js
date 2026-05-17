import { NEEDED_ACTION_STATUSES } from '../../entities/needed-from-client'
import { listClientNeededActions } from './neededFromClientService'

function getDueTime(action) {
  if (!action.dueDate) {
    return null
  }

  const dueDate = new Date(action.dueDate)

  return Number.isNaN(dueDate.getTime()) ? null : dueDate.getTime()
}

function isOverdue(action, now) {
  const dueTime = getDueTime(action)

  return action.status === NEEDED_ACTION_STATUSES.PENDING
    && Boolean(dueTime)
    && dueTime < now.getTime()
}

function isDueSoon(action, now) {
  const dueTime = getDueTime(action)

  if (action.status !== NEEDED_ACTION_STATUSES.PENDING || !dueTime || dueTime < now.getTime()) {
    return false
  }

  const threeDaysFromNow = now.getTime() + 3 * 86_400_000

  return dueTime <= threeDaysFromNow
}

function getActionType(action) {
  const searchableText = `${action.title} ${action.description}`.toLowerCase()

  if (searchableText.includes('approve') || searchableText.includes('approval')) {
    return 'approval'
  }

  if (searchableText.includes('access')) {
    return 'access_needed'
  }

  if (searchableText.includes('file') || searchableText.includes('asset') || searchableText.includes('photo')) {
    return 'file_needed'
  }

  if (searchableText.includes('feedback') || searchableText.includes('review')) {
    return 'feedback'
  }

  if (searchableText.includes('confirm') || searchableText.includes('confirmation')) {
    return 'confirmation'
  }

  return 'question'
}

function mapAction(action, now) {
  return {
    ...action,
    actionType: getActionType(action),
    isDueSoon: isDueSoon(action, now),
    isOverdue: isOverdue(action, now),
  }
}

function countBy(actions, predicate) {
  return actions.filter(predicate).length
}

export function getClientActionNeededPage({
  clientId,
  now = () => new Date(),
  repositories,
  viewer,
}) {
  const result = listClientNeededActions({
    clientId,
    repositories,
    viewer,
  })

  if (result.status === 'error') {
    return result
  }

  const resolvedNow = now()
  const actions = result.actions.map((action) => mapAction(action, resolvedNow))

  return {
    actions,
    client: result.client,
    counts: {
      all: actions.length,
      answered: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.ANSWERED),
      completed: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.RESOLVED),
      dueSoon: countBy(actions, (action) => action.isDueSoon),
      open: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.PENDING),
      overdue: countBy(actions, (action) => action.isOverdue),
    },
    status: 'ready',
  }
}
