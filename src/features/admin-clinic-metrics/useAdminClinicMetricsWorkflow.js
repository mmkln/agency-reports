import { useEffect, useState } from 'react'

import {
  createNeededActionFromClinicBookingSuggestion,
} from '../../domain/services/neededFromClientService'
import {
  getAdminClinicMetricsPage,
  publishBookingPipelineSnapshot,
  publishCallBookingMetric,
  publishLocationPerformance,
  publishPatientAcquisitionSnapshot,
  publishServiceLinePerformance,
  saveAdminClinicMetrics,
} from '../../domain/services/adminClinicMetricsService'
import { useToast } from '../../shared/notifications'
import {
  applyClinicMetricsImportToDraft,
  previewClinicMetricsImport,
} from './model/clinicMetricsImportDraft'

function createUuid() {
  return crypto.randomUUID()
}

function createDraft(page) {
  return {
    bookingPipelineSnapshots: page.bookingPipelineSnapshots.map((snapshot) => ({ ...snapshot })),
    callBookingMetrics: page.callBookingMetrics.map((metric) => ({ ...metric })),
    locationPerformance: page.locationPerformance.map((performance) => ({ ...performance })),
    patientAcquisitionSnapshots: page.patientAcquisitionSnapshots.map((snapshot) => ({ ...snapshot })),
    serviceLinePerformance: page.serviceLinePerformance.map((performance) => ({ ...performance })),
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

const PUBLISH_SERVICES = Object.freeze({
  booking_pipeline: publishBookingPipelineSnapshot,
  call_booking: publishCallBookingMetric,
  location_performance: publishLocationPerformance,
  patient_acquisition: publishPatientAcquisitionSnapshot,
  service_line_performance: publishServiceLinePerformance,
})

export function useAdminClinicMetricsWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [state, setState] = useState(createInitialState)
  const [createdBookingActionKeys, setCreatedBookingActionKeys] = useState(() => new Set())
  const [creatingBookingActionKey, setCreatingBookingActionKey] = useState('')
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
        setCreatedBookingActionKeys(new Set())
        setCreatingBookingActionKey('')
        setImportError('')
        setImportPlan(null)
        setImportRawJson('')
        setIsImportOpen(false)
        setIsDirty(false)
        setSaveState('')

        return runtime.dataClient.read((repositories) => getAdminClinicMetricsPage({
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
      const nextImportPlan = previewClinicMetricsImport({
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
      const nextDraft = applyClinicMetricsImportToDraft({
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
      toast.success('Clinic metrics imported', 'Review the imported aggregate records, then save metrics.')
    } catch (caughtError) {
      setImportError(caughtError.message)
      toast.error('Clinic metrics import failed', caughtError.message)
    }
  }

  function saveDraft() {
    if (!state.draft) {
      return
    }

    setSaveState('Saving...')

    runtime.dataClient.write((repositories) => saveAdminClinicMetrics({
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
        toast.success('Clinic metrics saved', `${page.client.name}'s aggregate metrics were updated.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Clinic metrics were not saved', caughtError.message)
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

  function publishMetricRecord({ id, type }) {
    const service = PUBLISH_SERVICES[type]

    if (!service) {
      throw new Error('Clinic metric publish type is invalid.')
    }

    setSaveState('Publishing...')

    runtime.dataClient.write((repositories) => service({
      clientId,
      id,
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
        setSaveState('Published')
        toast.success('Clinic metric published', `${page.client.name}'s metric record is now client-visible.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Clinic metric was not published', caughtError.message)
      })
  }

  function createBookingSuggestionAction({ metricId, suggestionType }) {
    const actionKey = `${metricId}:${suggestionType}`

    setCreatingBookingActionKey(actionKey)
    setSaveState('Creating action...')

    runtime.dataClient.write((repositories) => createNeededActionFromClinicBookingSuggestion({
      callBookingMetricId: metricId,
      idGenerator: createUuid,
      repositories,
      suggestionType,
      viewer: runtime.viewer,
    }))
      .then((action) => {
        setCreatedBookingActionKeys((currentKeys) => {
          const nextKeys = new Set(currentKeys)
          nextKeys.add(actionKey)
          return nextKeys
        })
        setCreatingBookingActionKey('')
        setSaveState('Action created')
        toast.success('Clinic action created', action.title)
      })
      .catch((caughtError) => {
        setCreatingBookingActionKey('')
        setSaveState('')
        toast.error('Clinic action was not created', caughtError.message)
      })
  }

  return {
    createdBookingActionKeys,
    createBookingSuggestionAction,
    creatingBookingActionKey,
    draft: state.draft,
    error: state.error,
    importError,
    importPlan,
    importRawJson,
    isDirty,
    isImportOpen,
    openImportDialog,
    page: state.page,
    applyImport,
    closeImportDialog,
    previewImport,
    publishMetricRecord,
    resetDraft,
    saveDraft,
    saveState,
    status: state.status,
    setImportRawJson: updateImportRawJson,
    updateDraft,
  }
}
