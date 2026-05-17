import { useEffect, useState } from 'react'

import {
  getAdminClinicMetricsPage,
  publishCallBookingMetric,
  publishPatientAcquisitionSnapshot,
  saveAdminClinicMetrics,
} from '../../domain/services/adminClinicMetricsService'
import { useToast } from '../../shared/notifications'

function createUuid() {
  return crypto.randomUUID()
}

function createDraft(page) {
  return {
    callBookingMetrics: page.callBookingMetrics.map((metric) => ({ ...metric })),
    patientAcquisitionSnapshots: page.patientAcquisitionSnapshots.map((snapshot) => ({ ...snapshot })),
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
  call_booking: publishCallBookingMetric,
  patient_acquisition: publishPatientAcquisitionSnapshot,
})

export function useAdminClinicMetricsWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [state, setState] = useState(createInitialState)
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

  return {
    draft: state.draft,
    error: state.error,
    isDirty,
    page: state.page,
    publishMetricRecord,
    resetDraft,
    saveDraft,
    saveState,
    status: state.status,
    updateDraft,
  }
}
