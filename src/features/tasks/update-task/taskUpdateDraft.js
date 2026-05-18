import { TASK_STATUSES } from '@/entities/task'

export const TASK_UPDATE_VALIDATION_MESSAGES = {
  blockerReasonRequired: 'Blocker reason is required.',
}

export function createTaskUpdateDraft(task) {
  if (!task) {
    return null
  }

  return {
    blockerNote: task.blockerNote,
    clientSafeSummary: task.clientSafeSummary,
    internalNote: task.internalNote,
    status: task.status,
  }
}

export function isTaskUpdateDraftChanged(task, draft) {
  if (!task || !draft) {
    return false
  }

  const persistedDraft = createTaskUpdateDraft(task)

  return Object.keys(persistedDraft).some((key) => persistedDraft[key] !== draft[key])
}

export function validateTaskUpdateDraft(draft) {
  if (draft?.status === TASK_STATUSES.BLOCKED && !draft.blockerNote.trim()) {
    return TASK_UPDATE_VALIDATION_MESSAGES.blockerReasonRequired
  }

  return ''
}
