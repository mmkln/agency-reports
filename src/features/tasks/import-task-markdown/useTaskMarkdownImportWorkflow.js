import { useState } from 'react'

import {
  applyTaskMarkdownImport,
  previewTaskMarkdownImport,
} from './model/taskMarkdownImport'

function createUuid() {
  return crypto.randomUUID()
}

export function useTaskMarkdownImportWorkflow({
  onClose,
  onImported,
  runtime,
  toast,
}) {
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [saveState, setSaveState] = useState('')

  function clearPreview() {
    setError('')
    setPlan(null)
    setSaveState('')
  }

  function close() {
    clearPreview()
    onClose()
  }

  function preview(input) {
    void runtime.dataClient.read((repositories) => previewTaskMarkdownImport({
      ...input,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextPlan) => {
        setPlan(nextPlan)
        setError('')
        setSaveState('Preview is ready.')
      })
      .catch((caughtError) => {
        setPlan(null)
        setError(caughtError.message)
        setSaveState('')
        toast.error('Import preview failed', caughtError.message)
      })
  }

  function apply() {
    if (!plan) {
      return
    }

    setError('')
    setSaveState('Creating tasks...')

    void runtime.dataClient.write((repositories) => applyTaskMarkdownImport({
      idGenerator: createUuid,
      preview: plan,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((createdTasks) => {
        setSaveState('')
        toast.success('Tasks imported', `${createdTasks.length} tasks were created.`)
        onImported(createdTasks)
        close()
      })
      .catch((caughtError) => {
        setError(caughtError.message)
        setSaveState('')
        toast.error('Task import failed', caughtError.message)
      })
  }

  return {
    apply,
    clearPreview,
    close,
    error,
    plan,
    preview,
    saveState,
  }
}
