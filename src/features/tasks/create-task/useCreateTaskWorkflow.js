import { useState } from 'react'

import { createTask } from '@/domain/services/taskWorkspaceService'

import { createBlankTaskDraft } from './createTaskDraft'

function createUuid() {
  return crypto.randomUUID()
}

export function useCreateTaskWorkflow({
  clients,
  onClose,
  onCreated,
  routeClientId,
  runtime,
  toast,
}) {
  const createDraft = () => createBlankTaskDraft({
    clients,
    routeClientId,
    viewer: runtime.viewer,
  })
  const [draft, setDraft] = useState(createDraft)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('')

  function reset() {
    setError('')
    setSaveState('')
    setDraft(createDraft())
  }

  function close() {
    reset()
    onClose()
  }

  function changeDraft(nextDraft) {
    setDraft(nextDraft)
    setError('')
    setSaveState('')
  }

  function submit(event) {
    event.preventDefault()
    setError('')
    setSaveState('Creating task...')

    runtime.dataClient.write((repositories) => createTask({
      idGenerator: createUuid,
      input: draft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdTask) => {
        setSaveState('')
        toast.success('Task created', `${createdTask.title} was added to Tasks.`)
        onCreated(createdTask)
        close()
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setSaveState('')
        toast.error('Task was not created', caughtError.message)
      })
  }

  return {
    changeDraft,
    close,
    draft,
    error,
    reset,
    saveState,
    submit,
  }
}
