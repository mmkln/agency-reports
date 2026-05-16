import { useMemo, useState } from 'react'

import { getTaskStatusSelectionOptions } from '@/domain/policies/taskPolicy'
import { updateWorkspaceTask } from '@/domain/services/taskWorkspaceService'

import {
  createTaskUpdateDraft,
  isTaskUpdateDraftChanged,
  TASK_UPDATE_VALIDATION_MESSAGES,
  validateTaskUpdateDraft,
} from './taskUpdateDraft'

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
    try {
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

      updateWorkspaceTask({
        input: draft,
        repositories: runtime.repositories,
        taskId: selectedTask.id,
        viewer: runtime.viewer,
      })
      setError('')
      setSaveState('Task update saved.')
      toast.success('Task updated', `${selectedTask.title} was saved.`)
      onUpdated(selectedTask)
    } catch (caughtError) {
      setError(caughtError.message)
      setSaveState('')
      toast.error('Task update failed', caughtError.message)
    }
  }

  return {
    blockerReasonError,
    changeDraft,
    close,
    draft,
    error,
    isDirty,
    reset,
    save,
    saveState,
    selectTask,
    selectedTask,
    statusOptions,
  }
}
