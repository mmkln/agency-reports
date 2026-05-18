import { useEffect, useState } from 'react'

import {
  getAdminClinicReputationPage,
  publishReputationSnapshot,
  saveAdminClinicReputation,
} from '../../domain/services/adminClinicReputationService'
import { useToast } from '../../shared/notifications'
import {
  applyClinicReputationImportToDraft,
  previewClinicReputationImport,
} from './model/clinicReputationImportDraft'

function createUuid() {
  return crypto.randomUUID()
}

function createDraft(page) {
  return {
    reputationSnapshots: page.reputationSnapshots.map((snapshot) => ({ ...snapshot })),
  }
}

function createInitialState() {
  return {
    draft: null,
    error: '',
    page: null,
    status: 'loading',
  }
}

export function useAdminClinicReputationWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [state, setState] = useState(createInitialState)
  const [importError, setImportError] = useState('')
  const [importPlan, setImportPlan] = useState(null)
  const [importRawJson, setImportRawJson] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState('')

  useEffect(() => {
    let isActive = true

    void Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setState(createInitialState())
        setImportError('')
        setImportPlan(null)
        setImportRawJson('')
        setIsImportOpen(false)
        setIsDirty(false)
        setSaveState('')

        return runtime.dataClient.read((repositories) => getAdminClinicReputationPage({
          clientId,
          repositories,
          viewer: runtime.viewer,
        }))
      })
      .then((page) => {
        if (!isActive || !page) {
          return
        }

        setState({
          draft: createDraft(page),
          error: '',
          page,
          status: 'ready',
        })
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setState({
          draft: null,
          error: caughtError.message,
          page: null,
          status: 'error',
        })
      })

    return () => {
      isActive = false
    }
  }, [clientId, runtime])

  function updateDraft(updater) {
    setState((currentState) => ({
      ...currentState,
      draft: typeof updater === 'function' ? updater(currentState.draft) : updater,
    }))
    setIsDirty(true)
    setSaveState('')
  }

  function openImportDialog() {
    setImportError('')
    setImportPlan(null)
    setImportRawJson('')
    setIsImportOpen(true)
  }

  function updateImportRawJson(rawJson) {
    setImportRawJson(rawJson)
    setImportError('')
    setImportPlan(null)
  }

  function closeImportDialog() {
    setImportError('')
    setImportPlan(null)
    setImportRawJson('')
    setIsImportOpen(false)
  }

  function previewImport(rawJson = importRawJson) {
    try {
      const nextImportPlan = previewClinicReputationImport({
        clientId,
        rawJson,
      })

      setImportError('')
      setImportPlan(nextImportPlan)
      setImportRawJson(rawJson)
    } catch (caughtError) {
      setImportError(caughtError.message)
      setImportPlan(null)
    }
  }

  function applyImport() {
    try {
      const nextDraft = applyClinicReputationImportToDraft({
        draft: state.draft,
        importPlan,
      })

      setState((currentState) => ({
        ...currentState,
        draft: nextDraft,
        error: '',
        status: 'ready',
      }))
      setIsDirty(true)
      setSaveState('Import ready to save')
      closeImportDialog()
      toast.success('Clinic reputation imported', 'Review the imported aggregate records, then save reputation.')
    } catch (caughtError) {
      setImportError(caughtError.message)
      toast.error('Clinic reputation import failed', caughtError.message)
    }
  }

  function saveDraft() {
    if (!state.draft) {
      return
    }

    setSaveState('Saving...')

    runtime.dataClient.write((repositories) => saveAdminClinicReputation({
      clientId,
      idGenerator: createUuid,
      input: state.draft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((page) => {
        setState({
          draft: createDraft(page),
          error: '',
          page,
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Saved')
        toast.success('Clinic reputation saved', `${page.client.name}'s reputation snapshots were updated.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Clinic reputation was not saved', caughtError.message)
      })
  }

  function resetDraft() {
    if (!state.page) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      draft: createDraft(currentState.page),
      error: '',
      status: 'ready',
    }))
    setIsDirty(false)
    setSaveState('')
  }

  function publishReputationRecord({ id }) {
    setSaveState('Publishing...')

    runtime.dataClient.write((repositories) => publishReputationSnapshot({
      clientId,
      repositories,
      snapshotId: id,
      viewer: runtime.viewer,
    }))
      .then((page) => {
        setState({
          draft: createDraft(page),
          error: '',
          page,
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Published')
        toast.success('Reputation snapshot published', `${page.client.name}'s reputation snapshot is now client-visible.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Reputation snapshot was not published', caughtError.message)
      })
  }

  return {
    applyImport,
    closeImportDialog,
    draft: state.draft,
    error: state.error,
    importError,
    importPlan,
    importRawJson,
    isDirty,
    isImportOpen,
    openImportDialog,
    page: state.page,
    previewImport,
    publishReputationRecord,
    resetDraft,
    saveDraft,
    saveState,
    setImportRawJson: updateImportRawJson,
    status: state.status,
    updateDraft,
  }
}
