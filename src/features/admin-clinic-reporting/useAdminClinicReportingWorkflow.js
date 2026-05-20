import { useEffect, useMemo, useState } from 'react'

import {
  getAdminDentalGrowthReviewDraft,
  getAdminClinicReportingPage,
  importDentalGrowthReviewSourceAndGenerateDraft,
  importAdminClinicReportingJson,
  previewAdminDentalGrowthReviewSourceImport,
  previewAdminClinicReportingImport,
  updateAdminDentalGrowthReviewDraft,
  updateAdminClinicReportingPublishState,
} from '../../domain/services/adminClinicReportingService'
import {
  CLINIC_REPORTING_LAYERS,
  CLINIC_REPORTING_PUBLISH_STATES,
} from '../../entities/clinic-reporting'
import { useToast } from '../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function createInitialState() {
  return {
    error: '',
    page: null,
    status: 'loading',
  }
}

export function useAdminClinicReportingWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [state, setState] = useState(createInitialState)
  const [importError, setImportError] = useState('')
  const [importLayer, setImportLayer] = useState(CLINIC_REPORTING_LAYERS.EXECUTIVE_PERFORMANCE)
  const [importPlan, setImportPlan] = useState(null)
  const [importRawJson, setImportRawJson] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isReviewEditorOpen, setIsReviewEditorOpen] = useState(false)
  const [isSourceImportOpen, setIsSourceImportOpen] = useState(false)
  const [reviewEditorError, setReviewEditorError] = useState('')
  const [reviewEditorPeriod, setReviewEditorPeriod] = useState(null)
  const [saveState, setSaveState] = useState('')
  const [sourceImportError, setSourceImportError] = useState('')
  const [sourceImportPlan, setSourceImportPlan] = useState(null)
  const [sourceRawJson, setSourceRawJson] = useState('')

  const layerOptions = useMemo(() => state.page?.layers ?? [], [state.page])

  function loadPage() {
    setState(createInitialState())
    return runtime.dataClient.read((repositories) => getAdminClinicReportingPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((page) => {
        setState({
          error: '',
          page,
          status: 'ready',
        })
      })
      .catch((caughtError) => {
        setState({
          error: caughtError.message,
          page: null,
          status: 'error',
        })
      })
  }

  useEffect(() => {
    let isActive = true

    runtime.dataClient.read((repositories) => getAdminClinicReportingPage({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((page) => {
        if (!isActive) {
          return
        }

        setState({
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
          error: caughtError.message,
          page: null,
          status: 'error',
        })
      })

    return () => {
      isActive = false
    }
  }, [clientId, runtime])

  function openImportDialog() {
    setImportError('')
    setImportPlan(null)
    setImportRawJson('')
    setIsImportOpen(true)
  }

  function closeImportDialog() {
    setImportError('')
    setImportPlan(null)
    setImportRawJson('')
    setIsImportOpen(false)
  }

  function closeReviewEditor() {
    setIsReviewEditorOpen(false)
    setReviewEditorError('')
    setReviewEditorPeriod(null)
  }

  function openSourceImportDialog() {
    setSourceImportError('')
    setSourceImportPlan(null)
    setSourceRawJson('')
    setIsSourceImportOpen(true)
  }

  function closeSourceImportDialog() {
    setSourceImportError('')
    setSourceImportPlan(null)
    setSourceRawJson('')
    setIsSourceImportOpen(false)
  }

  function updateRawJson(rawJson) {
    setImportRawJson(rawJson)
    setImportError('')
    setImportPlan(null)
  }

  function updateImportLayer(layer) {
    setImportLayer(layer)
    setImportError('')
    setImportPlan(null)
  }

  function updateSourceRawJson(rawJson) {
    setSourceRawJson(rawJson)
    setSourceImportError('')
    setSourceImportPlan(null)
  }

  function previewImport(rawJson = importRawJson) {
    runtime.dataClient.read((repositories) => previewAdminClinicReportingImport({
      clientId,
      idGenerator: createUuid,
      layer: importLayer,
      rawJson,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((result) => {
        setImportRawJson(rawJson)
        setImportPlan(result)
        setImportError(result.isValid ? '' : result.errors.map((error) => error.message).join('\n'))
      })
      .catch((caughtError) => {
        setImportPlan(null)
        setImportError(caughtError.message)
      })
  }

  function applyImport() {
    setSaveState('Importing...')

    runtime.dataClient.write((repositories) => importAdminClinicReportingJson({
      clientId,
      idGenerator: createUuid,
      layer: importLayer,
      rawJson: importRawJson,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((result) => {
        if (!result.isValid) {
          throw new Error(result.errors.map((error) => error.message).join('\n'))
        }

        closeImportDialog()
        setSaveState('Draft imported')
        toast.success('Clinic reporting draft imported', 'The record is saved as draft and is not visible in the portal.')
        return loadPage()
      })
      .catch((caughtError) => {
        setSaveState('')
        setImportError(caughtError.message)
        toast.error('Clinic reporting import failed', caughtError.message)
      })
  }

  function openReviewEditor(periodId) {
    setReviewEditorError('')
    setSaveState('Loading draft...')

    runtime.dataClient.read((repositories) => getAdminDentalGrowthReviewDraft({
      periodId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((period) => {
        setReviewEditorPeriod(period)
        setIsReviewEditorOpen(true)
        setSaveState('')
      })
      .catch((caughtError) => {
        setSaveState('')
        setReviewEditorError(caughtError.message)
        toast.error('Growth review editor failed', caughtError.message)
      })
  }

  function previewSourceImport(rawJson = sourceRawJson) {
    runtime.dataClient.read((repositories) => previewAdminDentalGrowthReviewSourceImport({
      clientId,
      idGenerator: createUuid,
      rawJson,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((result) => {
        setSourceRawJson(rawJson)
        setSourceImportPlan(result)
        setSourceImportError(result.isValid ? '' : result.errors.map((error) => error.message).join('\n'))
      })
      .catch((caughtError) => {
        setSourceImportPlan(null)
        setSourceImportError(caughtError.message)
      })
  }

  function generateGrowthReviewDraftFromSource() {
    setSaveState('Generating draft...')

    runtime.dataClient.write((repositories) => importDentalGrowthReviewSourceAndGenerateDraft({
      clientId,
      idGenerator: createUuid,
      rawJson: sourceRawJson,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((result) => {
        if (!result.isValid) {
          throw new Error(result.errors.map((error) => error.message).join('\n'))
        }

        closeSourceImportDialog()
        setSaveState('Draft generated')
        toast.success('Growth review draft generated', 'Source data was saved and the dashboard draft was calculated.')
        return loadPage().then(() => openReviewEditor(result.generatedPeriod.id))
      })
      .catch((caughtError) => {
        setSaveState('')
        setSourceImportError(caughtError.message)
        toast.error('Growth review source import failed', caughtError.message)
      })
  }

  function saveGrowthReviewDraft(period) {
    setReviewEditorError('')
    setSaveState('Saving draft...')

    runtime.dataClient.write((repositories) => updateAdminDentalGrowthReviewDraft({
      period,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((result) => {
        setReviewEditorPeriod(result.period)
        setSaveState('Draft saved')
        toast.success('Growth review draft saved', 'Publish explicitly when it is ready for the client dashboard.')
        return loadPage()
      })
      .catch((caughtError) => {
        setSaveState('')
        setReviewEditorError(caughtError.message)
        toast.error('Growth review draft failed', caughtError.message)
      })
  }

  function updatePublishState({ layer, periodId, publishState }) {
    setSaveState(publishState === CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED ? 'Publishing...' : 'Archiving...')

    runtime.dataClient.write((repositories) => updateAdminClinicReportingPublishState({
      layer,
      periodId,
      publishState,
      repositories,
      viewer: runtime.viewer,
    }))
      .then(() => {
        setSaveState(publishState === CLINIC_REPORTING_PUBLISH_STATES.PUBLISHED ? 'Published' : 'Archived')
        toast.success('Clinic reporting updated', `The period is now ${publishState}.`)
        return loadPage()
      })
      .catch((caughtError) => {
        setSaveState('')
        toast.error('Clinic reporting update failed', caughtError.message)
      })
  }

  return {
    error: state.error,
    importError,
    importLayer,
    importPlan,
    importRawJson,
    isImportOpen,
    isReviewEditorOpen,
    isSourceImportOpen,
    layerOptions,
    openImportDialog,
    openReviewEditor,
    openSourceImportDialog,
    page: state.page,
    applyImport,
    closeImportDialog,
    closeReviewEditor,
    closeSourceImportDialog,
    generateGrowthReviewDraftFromSource,
    previewImport,
    previewSourceImport,
    reviewEditorError,
    reviewEditorPeriod,
    saveState,
    saveGrowthReviewDraft,
    setImportLayer: updateImportLayer,
    setImportRawJson: updateRawJson,
    setSourceRawJson: updateSourceRawJson,
    sourceImportError,
    sourceImportPlan,
    sourceRawJson,
    status: state.status,
    updatePublishState,
  }
}
