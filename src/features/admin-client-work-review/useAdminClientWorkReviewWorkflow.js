import { useMemo, useState } from 'react'

import {
  archiveClientWorkItem,
  createClientWorkItemFromTask,
  markClientWorkItemReadyForReview,
  publishClientWorkItem,
  updateClientWorkItem,
} from '../../domain/services/clientWorkItemService'
import { getAdminReviewQueues } from '../../domain/services/adminReviewService'
import { createNeededAction } from '../../domain/services/neededFromClientService'
import { NEEDED_ACTION_PRIORITIES } from '../../entities/needed-from-client'
import { useAsyncResource } from '../../shared/data/useAsyncResource'
import { useToast } from '../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function createEditDraft(item = {}) {
  return {
    status: item.clientFacingStatus ?? '',
    summary: item.summary ?? '',
    targetDate: item.targetDate ?? '',
    title: item.title ?? '',
  }
}

function getQueueItems(queues, queueKey) {
  if (queueKey === 'all') {
    return [
      ...queues.readyForReview,
      ...queues.missingClientSummary,
      ...queues.stalePublished,
      ...queues.waitingClientWithoutRequest,
      ...queues.blockedWithoutClientExplanation,
      ...queues.recentlyPublished,
    ]
  }

  return queues[queueKey] ?? []
}

function getQueueCounts(queues) {
  return {
    all: getQueueItems(queues, 'all').length,
    archived: queues.archived.length,
    blockedWithoutClientExplanation: queues.blockedWithoutClientExplanation.length,
    missingClientSummary: queues.missingClientSummary.length,
    readyForReview: queues.readyForReview.length,
    recentlyPublished: queues.recentlyPublished.length,
    stalePublished: queues.stalePublished.length,
    waitingClientWithoutRequest: queues.waitingClientWithoutRequest.length,
  }
}

function createRequestInputFromReviewItem(item) {
  const sourceTaskId = item.taskId ?? item.sourceTask?.id ?? ''
  const workItemId = item.workItemId ?? ''

  return {
    clientId: item.client?.id ?? '',
    description: item.summary
      || item.sourceTask?.clientSafeSummary
      || item.sourceTask?.blockerNote
      || `Please review ${item.title}.`,
    dueDate: item.targetDate ?? '',
    internalNotes: 'Created from the published work review queue.',
    ownerName: '',
    priority: NEEDED_ACTION_PRIORITIES.MEDIUM,
    relatedTaskId: sourceTaskId,
    relatedWorkItemId: workItemId,
    title: `Action needed: ${item.title}`,
  }
}

const EMPTY_REVIEW_DATA = {
  clients: [],
  queues: {
    archived: [],
    blockedWithoutClientExplanation: [],
    missingClientSummary: [],
    readyForReview: [],
    recentlyPublished: [],
    stalePublished: [],
    waitingClientWithoutRequest: [],
  },
  status: 'ready',
}

export function useAdminClientWorkReviewWorkflow({
  defaultQueue = 'readyForReview',
  routeClientId,
  runtime,
  staleAfterDays,
}) {
  const toast = useToast()
  const [queueFilter, setQueueFilter] = useState(defaultQueue)
  const [editingItem, setEditingItem] = useState(null)
  const [editDraft, setEditDraft] = useState(() => createEditDraft())
  const [editError, setEditError] = useState('')
  const [editSaveState, setEditSaveState] = useState('')
  const [pendingArchive, setPendingArchive] = useState(null)
  const reviewResource = useAsyncResource({
    dependencyKey: `${runtime.viewer?.userId ?? ''}:admin-client-work-review:${routeClientId ?? ''}:${staleAfterDays ?? 'default'}`,
    initialData: EMPTY_REVIEW_DATA,
    load: () => runtime.dataClient.read((repositories) => getAdminReviewQueues({
      clientId: routeClientId,
      repositories,
      staleAfterDays,
      viewer: runtime.viewer,
    })),
  })
  const reviewData = reviewResource.data ?? EMPTY_REVIEW_DATA
  const client = reviewData.clients.find((item) => item.id === routeClientId) ?? reviewData.clients[0] ?? null
  const queues = reviewData.queues ?? EMPTY_REVIEW_DATA.queues
  const queueCounts = useMemo(() => getQueueCounts(queues), [queues])
  const visibleItems = useMemo(() => getQueueItems(queues, queueFilter), [queueFilter, queues])

  function reloadReview() {
    void reviewResource.reload()
  }

  function openEditDialog(item) {
    if (!item?.workItemId) {
      return
    }

    setEditingItem(item)
    setEditDraft(createEditDraft(item))
    setEditError('')
    setEditSaveState('')
  }

  function closeEditDialog() {
    setEditingItem(null)
    setEditDraft(createEditDraft())
    setEditError('')
    setEditSaveState('')
  }

  function submitEdit(event) {
    event.preventDefault()

    if (!editingItem?.workItemId) {
      return
    }

    setEditError('')
    setEditSaveState('Saving...')

    void runtime.dataClient.write((repositories) => updateClientWorkItem({
      input: editDraft,
      repositories,
      viewer: runtime.viewer,
      workItemId: editingItem.workItemId,
    }))
      .then((updatedItem) => {
        setEditSaveState('')
        closeEditDialog()
        reloadReview()
        toast.success('Client-facing work updated', `${updatedItem.title} is ready for review.`)
      })
      .catch((caughtError) => {
        setEditError(caughtError.message)
        setEditSaveState('')
        toast.error('Work item was not updated', caughtError.message)
      })
  }

  function publishWorkItem(item) {
    if (!item?.workItemId) {
      return
    }

    void runtime.dataClient.write((repositories) => publishClientWorkItem({
      repositories,
      viewer: runtime.viewer,
      workItemId: item.workItemId,
    }))
      .then((publishedItem) => {
        reloadReview()
        toast.success('Published to portal', `${publishedItem.title} is now visible.`)
      })
      .catch((caughtError) => {
        toast.error('Work item was not published', caughtError.message)
      })
  }

  function markReadyForReview(item) {
    if (!item?.workItemId) {
      return
    }

    void runtime.dataClient.write((repositories) => markClientWorkItemReadyForReview({
      repositories,
      viewer: runtime.viewer,
      workItemId: item.workItemId,
    }))
      .then((updatedItem) => {
        reloadReview()
        toast.success('Ready for review', `${updatedItem.title || item.title} is queued for publishing review.`)
      })
      .catch((caughtError) => {
        toast.error('Work item was not marked ready', caughtError.message)
      })
  }

  function archiveWorkItem() {
    if (!pendingArchive?.workItemId) {
      return
    }

    void runtime.dataClient.write((repositories) => archiveClientWorkItem({
      repositories,
      viewer: runtime.viewer,
      workItemId: pendingArchive.workItemId,
    }))
      .then((archivedItem) => {
        setPendingArchive(null)
        reloadReview()
        toast.success('Client-facing work archived', `${archivedItem.title} was removed from the client surface.`)
      })
      .catch((caughtError) => {
        setPendingArchive(null)
        toast.error('Work item was not archived', caughtError.message)
      })
  }

  function createWorkItemFromTask(item) {
    if (!item?.taskId) {
      return
    }

    void runtime.dataClient.write((repositories) => createClientWorkItemFromTask({
      idGenerator: createUuid,
      input: {
        summary: item.summary,
        targetDate: item.targetDate,
        title: item.title,
      },
      repositories,
      taskId: item.taskId,
      viewer: runtime.viewer,
    }))
      .then((createdItem) => {
        reloadReview()
        toast.success('Client-facing draft created', `${createdItem.title} can now be reviewed before publishing.`)
      })
      .catch((caughtError) => {
        toast.error('Client-facing draft was not created', caughtError.message)
      })
  }

  function createRequestFromReviewItem(item) {
    if (!item?.client?.id) {
      return
    }

    void runtime.dataClient.write((repositories) => createNeededAction({
      idGenerator: createUuid,
      input: createRequestInputFromReviewItem(item),
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdAction) => {
        reloadReview()
        toast.success('Client request created', `${createdAction.title} is now waiting on the client.`)
      })
      .catch((caughtError) => {
        toast.error('Client request was not created', caughtError.message)
      })
  }

  return {
    archiveWorkItem,
    closeEditDialog,
    client,
    createRequestFromReviewItem,
    createWorkItemFromTask,
    editDraft,
    editError,
    editingItem,
    editSaveState,
    pendingArchive,
    markReadyForReview,
    openEditDialog,
    publishWorkItem,
    queueCounts,
    queueFilter,
    queues,
    reviewResource,
    setEditDraft,
    setPendingArchive,
    setQueueFilter,
    submitEdit,
    visibleItems,
  }
}
