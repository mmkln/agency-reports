import { CLIENT_TYPES } from '../../entities/client'
import {
  CLINIC_NEEDED_ACTION_TYPE_META,
  NEEDED_ACTION_STATUSES,
} from '../../entities/needed-from-client'
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
  if (action.type === 'approval') {
    return 'approval'
  }

  if (action.type === 'access') {
    return 'access_needed'
  }

  if (action.type === 'asset') {
    return 'file_needed'
  }

  if (action.type === 'feedback') {
    return 'feedback'
  }

  if (action.type === 'decision') {
    return 'confirmation'
  }

  return 'question'
}

function getClientActionState(action) {
  if (action.isOverdue) {
    return 'overdue'
  }

  if (action.isDueSoon) {
    return 'due_soon'
  }

  return action.status
}

function mapAction(action, now) {
  const mappedAction = {
    ...action,
    actionType: getActionType(action),
    isDueSoon: isDueSoon(action, now),
    isOverdue: isOverdue(action, now),
  }

  return {
    ...mappedAction,
    clientState: getClientActionState(mappedAction),
  }
}

function mapClinicReference(record) {
  if (!record) {
    return null
  }

  return {
    id: record.id,
    name: record.name,
    title: record.title,
  }
}

function getClinicActionContext({ action, repositories }) {
  if (!action.clinicActionType) {
    return null
  }

  return {
    complianceRisk: action.complianceRisk,
    location: mapClinicReference(
      action.relatedLocationId ? repositories.clinicLocations?.findById(action.relatedLocationId) : null,
    ),
    patientImpact: action.patientImpact,
    related: {
      callBookingMetricId: action.relatedCallBookingMetricId,
      campaignName: action.relatedCampaignName,
      complianceReviewId: action.relatedComplianceReviewId,
      medicalApprovalId: action.relatedMedicalApprovalId,
      reputationSnapshotId: action.relatedReputationSnapshotId,
    },
    serviceLine: mapClinicReference(
      action.relatedServiceLineId ? repositories.clinicServiceLines?.findById(action.relatedServiceLineId) : null,
    ),
    type: action.clinicActionType,
    typeMeta: CLINIC_NEEDED_ACTION_TYPE_META[action.clinicActionType],
  }
}

function enrichClinicActions({ actions, client, repositories }) {
  if (client?.type !== CLIENT_TYPES.CLINIC) {
    return actions
  }

  return actions.map((action) => ({
    ...action,
    clinicAction: getClinicActionContext({
      action,
      repositories,
    }),
  }))
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
  const actions = enrichClinicActions({
    actions: result.actions.map((action) => mapAction(action, resolvedNow)),
    client: result.client,
    repositories,
  })

  return {
    actions,
    client: result.client,
    counts: {
      all: actions.length,
      answered: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.ANSWERED),
      approved: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.APPROVED),
      changesRequested: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.CHANGES_REQUESTED),
      clinic: countBy(actions, (action) => Boolean(action.clinicAction)),
      completed: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.RESOLVED),
      dueSoon: countBy(actions, (action) => action.isDueSoon),
      open: countBy(actions, (action) => action.status === NEEDED_ACTION_STATUSES.PENDING),
      overdue: countBy(actions, (action) => action.isOverdue),
    },
    status: 'ready',
  }
}
