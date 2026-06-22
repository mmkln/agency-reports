import { useMemo, useState } from 'react'

import { getTaskStatusSelectionOptions } from '@/domain/policies/taskPolicy'
import {
  markClientWorkItemReadyForReview,
  suggestClientWorkItemFromTask,
} from '@/domain/services/clientWorkItemService'
import { updateWorkspaceTask } from '@/domain/services/taskWorkspaceService'

import {
  createTaskUpdateDraft,
  isTaskUpdateDraftChanged,
  TASK_UPDATE_VALIDATION_MESSAGES,
  validateTaskUpdateDraft,
} from './taskUpdateDraft'

function createUuid() {
  return crypto.randomUUID()
}

export function useUpdateTaskWorkflow({
  onUpdated,
  runtime,
  tasks,
  toast,
}) {
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  )
  const [draft, setDraft] = useState(() => createTaskUpdateDraft(selectedTask))
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('')
  const isDirty = isTaskUpdateDraftChanged(selectedTask, draft)
  const blockerReasonError = error === TASK_UPDATE_VALIDATION_MESSAGES.blockerReasonRequired
  const canSendToClientReview = Boolean(
    selectedTask
    && !isDirty
    && selectedTask.clientSafeSummary?.trim()
    && !selectedTask.isPublishedToClient
    && !selectedTask.isReadyForClientReview,
  )
  const statusOptions = selectedTask
    ? getTaskStatusSelectionOptions({
      currentStatus: selectedTask.status,
      selectedStatus: draft?.status,
    })
    : []

  function selectTask(taskId) {
    if (isDirty && taskId !== selectedTask?.id) {
      setError('')
      setSaveState('Save or reset changes before selecting another task.')
      return
    }

    const task = tasks.find((item) => item.id === taskId) ?? null
    setSelectedTaskId(taskId)
    setDraft(createTaskUpdateDraft(task))
    setError('')
    setSaveState('')
  }

  function close() {
    if (isDirty) {
      setError('')
      setSaveState('Save or reset changes before closing task details.')
      return
    }

    setSelectedTaskId('')
    setDraft(null)
    setError('')
    setSaveState('')
  }

  function reset() {
    setDraft(createTaskUpdateDraft(selectedTask))
    setError('')
    setSaveState('')
  }

  function changeDraft(nextDraft) {
    setDraft(nextDraft)
    setError('')
    setSaveState('')
  }

  function save() {
    if (!selectedTask || !draft) {
      return
    }

    const validationError = validateTaskUpdateDraft(draft)

    if (validationError) {
      setError(validationError)
      setSaveState('')
      if (validationError === TASK_UPDATE_VALIDATION_MESSAGES.blockerReasonRequired) {
        toast.warning('Blocker reason required', 'Add a short note before marking this task as blocked.')
      }
      return
    }

    setSaveState('Saving...')
    void runtime.dataClient.write((repositories) => updateWorkspaceTask({
      input: draft,
      repositories,
      taskId: selectedTask.id,
      viewer: runtime.viewer,
    }))
      .then((updatedTask) => {
        setError('')
        setSaveState('Task update saved.')
        toast.success('Task updated', `${selectedTask.title} was saved.`)
        onUpdated(updatedTask)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setSaveState('')
        toast.error('Task update failed', caughtError.message)
      })
  }

  function sendToClientReview() {
    if (!selectedTask) {
      return
    }

    if (isDirty) {
      setError('')
      setSaveState('Save task changes before sending this work to admin review.')
      return
    }

    if (!selectedTask.clientSafeSummary?.trim()) {
      setError('Portal-ready update is required before sending this work to admin review.')
      setSaveState('')
      toast.warning('Portal-ready update required', 'Add a short portal-ready summary, save it, then send it for review.')
      return
    }

    setSaveState('Sending to review...')
    void runtime.dataClient.write((repositories) => {
      if (selectedTask.clientWorkItem?.id) {
        return markClientWorkItemReadyForReview({
          activityIdGenerator: createUuid,
          repositories,
          viewer: runtime.viewer,
          workItemId: selectedTask.clientWorkItem.id,
        })
      }

      return suggestClientWorkItemFromTask({
        activityIdGenerator: createUuid,
        idGenerator: createUuid,
        repositories,
        taskId: selectedTask.id,
        viewer: runtime.viewer,
      })
    })
      .then((workItem) => {
        setError('')
        setSaveState('Sent to admin review.')
        toast.success('Sent to review', `${selectedTask.title} is queued for published work review.`)
        onUpdated(workItem)
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setSaveState('')
        toast.error('Review action failed', caughtError.message)
      })
  }

  return {
    blockerReasonError,
    canSendToClientReview,
    changeDraft,
    close,
    draft,
    error,
    isDirty,
    reset,
    save,
    saveState,
    selectTask,
    sendToClientReview,
    selectedTask,
    statusOptions,
  }
}
