import {
  NEEDED_ACTION_PRIORITIES,
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_STATUS_META,
  NEEDED_ACTION_TYPES,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import { USER_ROLES } from '../../entities/profile'
import { TASK_STATUSES } from '../../entities/task'
import { canAccessClient } from '../policies/accessPolicy'
import {
  canAgencyProcessNeededAction,
  canClientRespondToNeededAction,
} from '../policies/neededActionPolicy'
import { isNeededActionVisibleToClient } from '../policies/visibilityPolicy'

const VALID_NEEDED_ACTION_STATUSES = new Set(Object.values(NEEDED_ACTION_STATUSES))
const VALID_NEEDED_ACTION_PRIORITIES = new Set(Object.values(NEEDED_ACTION_PRIORITIES))
const VALID_NEEDED_ACTION_TYPES = new Set(Object.values(NEEDED_ACTION_TYPES))
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function getAction({ actionId, repositories, viewer }) {
  const action = repositories.neededFromClient.findById(actionId)

  if (!action || !canAccessClient(viewer, action.client_id)) {
    throw new Error('Needed action was not found.')
  }

  if (viewer?.role === USER_ROLES.AGENCY_ADMIN && repositories.clients?.findById) {
    const client = repositories.clients.findById(action.client_id)

    if (!client || client.agency_id !== viewer.agencyId) {
      throw new Error('Needed action was not found.')
    }
  }

  return action
}

function createHistoryEvent({ metadata = {}, now, type, viewer }) {
  return {
    created_at: now(),
    created_by: viewer?.userId ?? null,
    metadata: {
      actor_role: viewer?.role ?? null,
      ...metadata,
    },
    type,
  }
}

function appendHistory(action, event) {
  return [
    ...(Array.isArray(action.response_history) ? action.response_history : []),
    event,
  ]
}

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only agency admins can process needed actions.')
  }
}

function assertUuidGenerator(idGenerator) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }
}

function createNeededActionId(idGenerator) {
  const id = idGenerator()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Needed action id must be a string uuid.')
  }

  return id
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeOptionalDate(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  if (Number.isNaN(new Date(normalizedValue).getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return normalizedValue
}

function normalizeOptionalUrl(value = '', fieldName) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol.')
    }
  } catch {
    throw new Error(`${fieldName} must be a valid http(s) URL.`)
  }

  return normalizedValue
}

function getAdminClients({ repositories, viewer }) {
  assertAgencyAdmin(viewer)

  return repositories.clients
    .list()
    .filter((client) => client.agency_id === viewer.agencyId)
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = getAdminClients({ repositories, viewer })
    .find((item) => item.id === clientId)

  if (!client) {
    throw new Error('Client is not available for requests.')
  }

  return client
}

function getNeededActionStatusMeta(status) {
  return VALID_NEEDED_ACTION_STATUSES.has(status) ? status : NEEDED_ACTION_STATUSES.PENDING
}

function normalizePriority(priority) {
  return VALID_NEEDED_ACTION_PRIORITIES.has(priority) ? priority : NEEDED_ACTION_PRIORITIES.MEDIUM
}

function normalizeType(type) {
  return VALID_NEEDED_ACTION_TYPES.has(type) ? type : NEEDED_ACTION_TYPES.OTHER
}

function normalizeOptionalId(value = '') {
  const normalizedValue = normalizeText(value)
  return normalizedValue || null
}

function normalizeEditableActionFields(input = {}) {
  const ownerName = normalizeText(input.ownerName ?? input.owner_name)

  return {
    agency_owner: normalizeText(input.agencyOwner ?? input.agency_owner ?? ownerName),
    client_owner: normalizeText(input.clientOwner ?? input.client_owner),
    description: normalizeText(input.description),
    due_date: normalizeOptionalDate(input.dueDate, 'Request due date'),
    impact_if_delayed: normalizeText(input.impactIfDelayed ?? input.impact_if_delayed),
    internal_notes: normalizeText(input.internalNotes),
    last_reminded_at: input.lastRemindedAt ?? input.last_reminded_at ?? null,
    owner_name: ownerName,
    priority: normalizePriority(input.priority),
    related_link: normalizeOptionalUrl(input.relatedLink, 'Request related link'),
    related_task_id: normalizeOptionalId(input.relatedTaskId ?? input.related_task_id),
    related_work_item_id: normalizeOptionalId(input.relatedWorkItemId ?? input.related_work_item_id),
    title: requireText(input.title, 'Request title'),
    type: normalizeType(input.type),
    why_needed: normalizeText(input.whyNeeded ?? input.why_needed),
  }
}

function mapNeededAction({ action, client }) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    agencyOwner: normalizedAction.agency_owner,
    cancellationNote: normalizedAction.cancellation_note ?? '',
    cancelledAt: normalizedAction.cancelled_at,
    clientId: normalizedAction.client_id,
    clientName: client?.name ?? 'Unknown client',
    clientOwner: normalizedAction.client_owner,
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    impactIfDelayed: normalizedAction.impact_if_delayed,
    internalNotes: normalizedAction.internal_notes,
    lastRemindedAt: normalizedAction.last_reminded_at,
    ownerName: normalizedAction.owner_name,
    priority: normalizedAction.priority,
    relatedLink: normalizedAction.related_link,
    relatedTaskId: normalizedAction.related_task_id,
    relatedWorkItemId: normalizedAction.related_work_item_id,
    respondedAt: normalizedAction.client_responded_at,
    respondedBy: normalizedAction.client_responded_by,
    resolutionNote: normalizedAction.resolution_note ?? '',
    resolvedAt: normalizedAction.resolved_at,
    resolvedBy: normalizedAction.resolved_by,
    responseHistory: normalizedAction.response_history,
    status: getNeededActionStatusMeta(normalizedAction.status),
    title: normalizedAction.title,
    type: normalizedAction.type,
    updatedAt: normalizedAction.updated_at,
    whyNeeded: normalizedAction.why_needed,
  }
}

function mapClientNeededAction(action) {
  const normalizedAction = normalizeNeededAction(action)

  return {
    clientOwner: normalizedAction.client_owner,
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    impactIfDelayed: normalizedAction.impact_if_delayed,
    priority: normalizedAction.priority,
    priorityMeta: NEEDED_ACTION_PRIORITY_META[normalizedAction.priority],
    relatedLink: normalizedAction.related_link,
    relatedTaskId: normalizedAction.related_task_id,
    relatedWorkItemId: normalizedAction.related_work_item_id,
    respondedAt: normalizedAction.client_responded_at,
    responseHistory: normalizedAction.response_history,
    status: normalizedAction.status,
    statusMeta: NEEDED_ACTION_STATUS_META[normalizedAction.status],
    title: normalizedAction.title,
    type: normalizedAction.type,
    updatedAt: normalizedAction.updated_at,
    whyNeeded: normalizedAction.why_needed,
  }
}

function matchesFilter(value, filterValue) {
  return !filterValue || filterValue === 'all' || value === filterValue
}

function getAdminTask({ repositories, taskId, viewer }) {
  assertAgencyAdmin(viewer)

  const task = repositories.tasks?.findById(taskId)

  if (!task) {
    throw new Error('Source task was not found.')
  }

  getAdminClient({
    clientId: task.client_id,
    repositories,
    viewer,
  })

  return task
}

function getAdminWorkItem({ repositories, viewer, workItemId }) {
  assertAgencyAdmin(viewer)

  const workItem = repositories.clientWorkItems?.findById(workItemId)

  if (!workItem) {
    throw new Error('Client work item was not found.')
  }

  getAdminClient({
    clientId: workItem.client_id,
    repositories,
    viewer,
  })

  return workItem
}

function isOpenNeededAction(action) {
  return ![
    NEEDED_ACTION_STATUSES.CANCELLED,
    NEEDED_ACTION_STATUSES.RESOLVED,
  ].includes(action.status)
}

export function listNeededActionsWorkspace({
  filters = {},
  repositories,
  viewer,
}) {
  const clients = getAdminClients({ repositories, viewer })
  const clientsById = new Map(clients.map((client) => [client.id, client]))
  const clientIds = new Set(clients.map((client) => client.id))
  const actions = repositories.neededFromClient
    .list()
    .filter((action) => clientIds.has(action.client_id))
    .filter((action) => matchesFilter(action.client_id, filters.clientId))
    .filter((action) => matchesFilter(action.status, filters.status))
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
        [NEEDED_ACTION_STATUSES.CANCELLED]: 3,
      }

      return (priority[a.status] ?? 4) - (priority[b.status] ?? 4)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map((action) => mapNeededAction({
      action,
      client: clientsById.get(action.client_id),
    }))

  return {
    actions,
    clients,
    filters: {
      clientId: filters.clientId ?? 'all',
      status: filters.status ?? 'all',
    },
    status: 'ready',
  }
}

export function listClientNeededActions({
  clientId,
  repositories,
  viewer,
}) {
  const normalizedClientId = normalizeText(clientId || viewer?.clientId)

  if (!normalizedClientId || !canAccessClient(viewer, normalizedClientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const client = repositories.clients?.findById(normalizedClientId)

  if (!client) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const actions = repositories.neededFromClient
    .listByClientId(normalizedClientId)
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => {
      const priority = {
        [NEEDED_ACTION_STATUSES.PENDING]: 0,
        [NEEDED_ACTION_STATUSES.ANSWERED]: 1,
        [NEEDED_ACTION_STATUSES.RESOLVED]: 2,
      }

      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        || new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime()
    })
    .map(mapClientNeededAction)

  return {
    actions,
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
    },
    status: 'ready',
  }
}

export function createNeededAction({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)
  assertUuidGenerator(idGenerator)

  const client = getAdminClient({
    clientId: normalizeText(input.clientId),
    repositories,
    viewer,
  })
  const title = normalizeText(input.title)

  if (!title) {
    throw new Error('Request title is required.')
  }

  const timestamp = now()
  const actionId = createNeededActionId(idGenerator)
  const action = {
    client_id: client.id,
    created_at: timestamp,
    id: actionId,
    ...normalizeEditableActionFields({
      ...input,
      title,
    }),
    response_history: [
      createHistoryEvent({
        metadata: {
          title,
        },
        now,
        type: 'admin_created',
        viewer,
      }),
    ],
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(action)

  return action
}

export function createNeededActionFromTask({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  const task = getAdminTask({ repositories, taskId, viewer })

  return createNeededAction({
    idGenerator,
    input: Object.assign({}, input, {
      clientId: task.client_id,
      description: input.description ?? task.client_safe_summary ?? task.blocker_note ?? `Please respond to unblock ${task.title}.`,
      dueDate: input.dueDate ?? task.due_date ?? '',
      impactIfDelayed: input.impactIfDelayed ?? task.blocker_note ?? '',
      priority: input.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
      relatedTaskId: task.id,
      title: input.title ?? `Action needed: ${task.title}`,
      type: input.type ?? NEEDED_ACTION_TYPES.OTHER,
      whyNeeded: input.whyNeeded ?? task.client_safe_summary ?? task.blocker_note ?? '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function createNeededActionFromWorkItem({
  idGenerator,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })

  return createNeededAction({
    idGenerator,
    input: Object.assign({}, input, {
      clientId: workItem.client_id,
      description: input.description ?? workItem.summary ?? `Please respond to unblock ${workItem.title}.`,
      dueDate: input.dueDate ?? workItem.target_date ?? '',
      impactIfDelayed: input.impactIfDelayed ?? '',
      priority: input.priority ?? NEEDED_ACTION_PRIORITIES.MEDIUM,
      relatedTaskId: input.relatedTaskId ?? workItem.source_task_id ?? '',
      relatedWorkItemId: workItem.id,
      title: input.title ?? `Action needed: ${workItem.title}`,
      type: input.type ?? NEEDED_ACTION_TYPES.OTHER,
      whyNeeded: input.whyNeeded ?? workItem.summary ?? '',
    }),
    now,
    repositories,
    viewer,
  })
}

export function updateNeededAction({
  actionId,
  input = {},
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  const timestamp = now()
  const updatedAction = {
    ...action,
    ...normalizeEditableActionFields(input),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        fields: [
          'title',
          'description',
          'due_date',
          'related_link',
          'related_task_id',
          'related_work_item_id',
          'priority',
          'owner_name',
          'internal_notes',
        ],
      },
      now,
      type: 'admin_updated',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function linkNeededActionToTask({
  actionId,
  now = () => new Date().toISOString(),
  repositories,
  taskId,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })
  const task = getAdminTask({ repositories, taskId, viewer })

  if (action.client_id !== task.client_id) {
    throw new Error('Source task is not available for this request.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    related_task_id: task.id,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        related_task_id: task.id,
      },
      now,
      type: 'admin_linked_task',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function linkNeededActionToWorkItem({
  actionId,
  now = () => new Date().toISOString(),
  repositories,
  viewer,
  workItemId,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })

  if (action.client_id !== workItem.client_id) {
    throw new Error('Client work item is not available for this request.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    related_work_item_id: workItem.id,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        related_work_item_id: workItem.id,
      },
      now,
      type: 'admin_linked_work_item',
      viewer,
    })),
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function listOpenNeededActionsForWorkItem({
  repositories,
  viewer,
  workItemId,
}) {
  const workItem = getAdminWorkItem({ repositories, viewer, workItemId })
  const client = repositories.clients.findById(workItem.client_id)
  const actions = repositories.neededFromClient
    .listByClientId(workItem.client_id)
    .filter((action) => action.related_work_item_id === workItem.id)
    .filter(isOpenNeededAction)
    .map((action) => mapNeededAction({ action, client }))

  return {
    actions,
    status: 'ready',
  }
}

export function listWaitingClientTasksWithoutRequests({
  clientId = '',
  repositories,
  viewer,
}) {
  const clients = getAdminClients({ repositories, viewer })
    .filter((client) => !clientId || client.id === clientId)
  const clientIds = new Set(clients.map((client) => client.id))
  const openRequestTaskIds = new Set(
    repositories.neededFromClient
      .list()
      .filter((action) => clientIds.has(action.client_id))
      .filter(isOpenNeededAction)
      .map((action) => action.related_task_id)
      .filter(Boolean),
  )
  const openRequestWorkItemIds = new Set(
    repositories.neededFromClient
      .list()
      .filter((action) => clientIds.has(action.client_id))
      .filter(isOpenNeededAction)
      .map((action) => action.related_work_item_id)
      .filter(Boolean),
  )
  const linkedWorkItemsByTaskId = new Map()

  for (const workItem of repositories.clientWorkItems?.list?.() ?? []) {
    if (!clientIds.has(workItem.client_id) || !workItem.source_task_id) {
      continue
    }

    const taskWorkItems = linkedWorkItemsByTaskId.get(workItem.source_task_id) ?? []
    taskWorkItems.push(workItem)
    linkedWorkItemsByTaskId.set(workItem.source_task_id, taskWorkItems)
  }

  const tasks = repositories.tasks
    .list()
    .filter((task) => clientIds.has(task.client_id))
    .filter((task) => task.status === TASK_STATUSES.WAITING_CLIENT)
    .filter((task) => {
      if (openRequestTaskIds.has(task.id)) {
        return false
      }

      return !(linkedWorkItemsByTaskId.get(task.id) ?? [])
        .some((workItem) => openRequestWorkItemIds.has(workItem.id))
    })

  return {
    status: 'ready',
    tasks,
  }
}

export function answerNeededAction({
  actionId,
  message = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  const action = getAction({ actionId, repositories, viewer })

  if (viewer?.role !== USER_ROLES.CLIENT_USER) {
    throw new Error('Only client users can respond to needed actions.')
  }

  if (!canClientRespondToNeededAction({ action, viewer })) {
    throw new Error('Only pending actions can be answered.')
  }

  const timestamp = now()
  const clientResponse = requireText(message || 'Completed by client', 'Response')
  const updatedAction = {
    ...action,
    client_response: clientResponse,
    client_responded_at: timestamp,
    client_responded_by: viewer.userId,
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        response: clientResponse,
      },
      now,
      type: 'client_answered',
      viewer,
    })),
    responded_at: timestamp,
    responded_by: viewer.userId,
    status: NEEDED_ACTION_STATUSES.ANSWERED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function resolveNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.RESOLVED,
    viewer,
  })) {
    throw new Error('Only pending or answered actions can be resolved.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    resolved_at: timestamp,
    resolved_by: viewer.userId,
    resolution_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_resolved',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.RESOLVED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function cancelNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.CANCELLED,
    viewer,
  })) {
    throw new Error('Action is already cancelled.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: timestamp,
    cancelled_by: viewer.userId,
    cancellation_note: String(note ?? '').trim(),
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_cancelled',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.CANCELLED,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}

export function reopenNeededAction({
  actionId,
  note = '',
  now = () => new Date().toISOString(),
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const action = getAction({ actionId, repositories, viewer })

  if (!canAgencyProcessNeededAction({
    action,
    targetStatus: NEEDED_ACTION_STATUSES.PENDING,
    viewer,
  })) {
    throw new Error('Only answered, resolved, or cancelled actions can be reopened.')
  }

  const timestamp = now()
  const updatedAction = {
    ...action,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_note: '',
    resolved_at: null,
    resolved_by: null,
    resolution_note: '',
    response_history: appendHistory(action, createHistoryEvent({
      metadata: {
        note: String(note ?? '').trim(),
      },
      now,
      type: 'admin_reopened',
      viewer,
    })),
    status: NEEDED_ACTION_STATUSES.PENDING,
    updated_at: timestamp,
  }

  repositories.neededFromClient.upsert(updatedAction)

  return updatedAction
}
