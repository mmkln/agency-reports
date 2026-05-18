import { useEffect, useState } from 'react'

import {
  createNeededActionFromClinicComplianceSuggestion,
  createNeededActionFromClinicMedicalApprovalSuggestion,
} from '../../domain/services/neededFromClientService'
import {
  approveMedicalApproval,
  getAdminClinicCompliancePage,
  publishComplianceReview,
  publishMedicalApproval,
  rejectMedicalApproval,
  requestChangesForMedicalApproval,
  saveAdminClinicCompliance,
  transitionComplianceReviewStatus,
} from '../../domain/services/adminClinicComplianceService'
import { useToast } from '../../shared/notifications'
import {
  applyClinicComplianceImportToDraft,
  previewClinicComplianceImport,
} from './model/clinicComplianceImportDraft'

function createUuid() {
  return crypto.randomUUID()
}

function createDraft(page) {
  return {
    complianceReviews: page.complianceReviews.map((review) => ({ ...review })),
    medicalApprovals: page.medicalApprovals.map((approval) => ({ ...approval })),
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

const APPROVAL_DECISION_SERVICES = Object.freeze({
  approve: approveMedicalApproval,
  reject: rejectMedicalApproval,
  request_changes: requestChangesForMedicalApproval,
})
const PUBLISH_SERVICES = Object.freeze({
  approval: publishMedicalApproval,
  review: publishComplianceReview,
})

export function useAdminClinicComplianceWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [state, setState] = useState(createInitialState)
  const [createdComplianceActionKeys, setCreatedComplianceActionKeys] = useState(() => new Set())
  const [creatingComplianceActionKey, setCreatingComplianceActionKey] = useState('')
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
        setCreatedComplianceActionKeys(new Set())
        setCreatingComplianceActionKey('')
        setImportError('')
        setImportPlan(null)
        setImportRawJson('')
        setIsImportOpen(false)
        setIsDirty(false)
        setSaveState('')

        return runtime.dataClient.read((repositories) => getAdminClinicCompliancePage({
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
      const nextImportPlan = previewClinicComplianceImport({
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
      const nextDraft = applyClinicComplianceImportToDraft({
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
      toast.success('Clinic compliance imported', 'Review the imported aggregate records, then save compliance.')
    } catch (caughtError) {
      setImportError(caughtError.message)
      toast.error('Clinic compliance import failed', caughtError.message)
    }
  }

  function saveDraft() {
    if (!state.draft) {
      return
    }

    setSaveState('Saving...')

    runtime.dataClient.write((repositories) => saveAdminClinicCompliance({
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
        toast.success('Clinic compliance saved', `${page.client.name}'s compliance records were updated.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Clinic compliance was not saved', caughtError.message)
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

  function applyApprovalDecision({ action, approvalId, comment, version }) {
    const service = APPROVAL_DECISION_SERVICES[action]

    if (!service) {
      throw new Error('Medical approval action is invalid.')
    }

    setSaveState('Recording decision...')

    runtime.dataClient.write((repositories) => service({
      approvalId,
      clientId,
      input: {
        comment,
        version,
      },
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
        setSaveState('Decision recorded')
        toast.success('Medical approval updated', `${page.client.name}'s approval decision was recorded.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Medical approval was not updated', caughtError.message)
      })
  }

  function applyReviewStatus({ nextStatus, reviewId }) {
    setSaveState('Updating status...')

    runtime.dataClient.write((repositories) => transitionComplianceReviewStatus({
      clientId,
      nextStatus,
      repositories,
      reviewId,
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
        setSaveState('Status updated')
        toast.success('Compliance status updated', `${page.client.name}'s compliance review status was recorded.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Compliance status was not updated', caughtError.message)
      })
  }

  function publishComplianceRecord({ id, type }) {
    const service = PUBLISH_SERVICES[type]

    if (!service) {
      throw new Error('Clinic compliance publish type is invalid.')
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
        toast.success('Clinic compliance record published', `${page.client.name}'s compliance record is now client-visible.`)
      })
      .catch((caughtError) => {
        setState((currentState) => ({
          ...currentState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Clinic compliance record was not published', caughtError.message)
      })
  }

  function createComplianceSuggestionAction({ recordId, recordType, suggestionType }) {
    const actionKey = `${recordId}:${suggestionType}`
    const service = recordType === 'approval'
      ? createNeededActionFromClinicMedicalApprovalSuggestion
      : createNeededActionFromClinicComplianceSuggestion
    const idKey = recordType === 'approval'
      ? 'medicalApprovalId'
      : 'complianceReviewId'

    setCreatingComplianceActionKey(actionKey)
    setSaveState('Creating action...')

    runtime.dataClient.write((repositories) => service({
      idGenerator: createUuid,
      [idKey]: recordId,
      repositories,
      suggestionType,
      viewer: runtime.viewer,
    }))
      .then((action) => {
        setCreatedComplianceActionKeys((currentKeys) => {
          const nextKeys = new Set(currentKeys)
          nextKeys.add(actionKey)
          return nextKeys
        })
        setCreatingComplianceActionKey('')
        setSaveState('Action created')
        toast.success('Clinic action created', action.title)
      })
      .catch((caughtError) => {
        setCreatingComplianceActionKey('')
        setSaveState('')
        toast.error('Clinic action was not created', caughtError.message)
      })
  }

  return {
    applyImport,
    applyApprovalDecision,
    applyReviewStatus,
    closeImportDialog,
    createdComplianceActionKeys,
    createComplianceSuggestionAction,
    creatingComplianceActionKey,
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
    publishComplianceRecord,
    resetDraft,
    saveDraft,
    saveState,
    setImportRawJson: updateImportRawJson,
    status: state.status,
    updateDraft,
  }
}
