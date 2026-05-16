import { useEffect, useRef, useState } from 'react'

import {
  discardAdminClientOverviewDraft,
  getAdminClientOverviewEditor,
  publishAdminClientOverview,
  restoreAdminClientOverviewFromPublished,
  saveAdminClientOverview,
} from '../../domain/services/adminOverviewService'
import { useToast } from '../../shared/notifications'
import {
  createBlankProject,
  createDraft,
  removeListItem,
} from './model'

function createUuid() {
  return crypto.randomUUID()
}

function loadEditor(clientId, runtime) {
  return getAdminClientOverviewEditor({
    clientId,
    repositories: runtime.repositories,
    viewer: runtime.viewer,
  })
}

function createInitialPageState(clientId, runtime) {
  void clientId
  void runtime

  return {
    draft: null,
    editor: null,
    error: '',
    status: 'loading',
  }
}

export function useAdminOverviewEditorWorkflow({ clientId, runtime }) {
  const toast = useToast()
  const [pageState, setPageState] = useState(() => createInitialPageState(clientId, runtime))
  const { draft, editor, error } = pageState
  const [isDirty, setIsDirty] = useState(false)
  const [isPublishConfirmationOpen, setIsPublishConfirmationOpen] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [saveState, setSaveState] = useState('')
  const autosaveTimeoutRef = useRef(null)
  const saveDraftRef = useRef(null)

  useEffect(() => {
    let isActive = true

    void Promise.resolve()
      .then(() => {
        if (!isActive) {
          return null
        }

        setPageState({
          draft: null,
          editor: null,
          error: '',
          status: 'loading',
        })

        return runtime.dataClient.read((repositories) => loadEditor(clientId, {
          ...runtime,
          repositories,
        }))
      })
      .then((editorData) => {
        if (!isActive || !editorData) {
          return
        }

        setPageState({
          draft: createDraft(editorData),
          editor: editorData,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('')
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setPageState({
          draft: null,
          editor: null,
          error: caughtError.message,
          status: 'error',
        })
      })

    return () => {
      isActive = false
    }
  }, [clientId, runtime])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('agency-reports:editor-dirty-change', {
      detail: { isDirty },
    }))

    return () => {
      window.dispatchEvent(new CustomEvent('agency-reports:editor-dirty-change', {
        detail: { isDirty: false },
      }))
    }
  }, [isDirty])

  useEffect(() => {
    if (!isDirty || !draft || !editor) {
      return undefined
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      saveDraftRef.current?.({ silent: true })
    }, 1500)

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [draft, isDirty, editor])

  function updateDraft(updater) {
    setPageState((currentPageState) => ({
      ...currentPageState,
      draft: typeof updater === 'function' ? updater(currentPageState.draft) : updater,
    }))
    setIsDirty(true)
    setSaveState('')
  }

  function requestDeletion(type, index = null, label = '') {
    setPendingDeletion({ index, label, type })
  }

  function clearPendingDeletion() {
    setPendingDeletion(null)
  }

  function confirmDeletion() {
    if (!pendingDeletion) {
      return
    }

    updateDraft((currentDraft) => {
      if (pendingDeletion.type === 'latest_update') {
        return {
          ...currentDraft,
          updates: [],
        }
      }

      if (pendingDeletion.type === 'project') {
        return {
          ...currentDraft,
          projects: removeListItem(currentDraft.projects, pendingDeletion.index, createBlankProject),
        }
      }

      return currentDraft
    })
    clearPendingDeletion()
  }

  function saveDraft({ silent = false } = {}) {
    setSaveState('Saving...')
    return runtime.dataClient.write((repositories) => saveAdminClientOverview({
      clientId,
      idGenerator: createUuid,
      input: draft,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('')
        if (!silent) {
          toast.success('Draft saved', `${nextEditor.client.name}'s overview draft was updated.`)
        }
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Draft was not saved', caughtError.message)
      })
  }

  useEffect(() => {
    saveDraftRef.current = saveDraft
  })

  function publishDraft() {
    setSaveState('Publishing...')
    runtime.dataClient.write((repositories) => {
      const nextEditor = saveAdminClientOverview({
        clientId,
        idGenerator: createUuid,
        input: draft,
        repositories,
        viewer: runtime.viewer,
      })

      return publishAdminClientOverview({
        clientId: nextEditor.client.id,
        idGenerator: createUuid,
        repositories,
        viewer: runtime.viewer,
      })
    })
      .then((publishedEditor) => {
        setPageState({
          draft: createDraft(publishedEditor),
          editor: publishedEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Published successfully')
        setIsPublishConfirmationOpen(false)
        toast.success('Overview published', `${publishedEditor.client.name}'s client portal is up to date.`)
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setIsPublishConfirmationOpen(false)
        setSaveState('')
        toast.error('Overview was not published', caughtError.message)
      })
  }

  function discardDraft() {
    setSaveState('Discarding draft...')
    runtime.dataClient.write((repositories) => discardAdminClientOverviewDraft({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Draft discarded')
        toast.success('Draft discarded', 'The editor now matches the published client overview.')
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Draft was not discarded', caughtError.message)
      })
  }

  function restorePublished() {
    setSaveState('Restoring published...')
    runtime.dataClient.write((repositories) => restoreAdminClientOverviewFromPublished({
      clientId,
      repositories,
      viewer: runtime.viewer,
    }))
      .then((nextEditor) => {
        setPageState({
          draft: createDraft(nextEditor),
          editor: nextEditor,
          error: '',
          status: 'ready',
        })
        setIsDirty(false)
        setSaveState('Restored from published')
        toast.success('Published overview restored', 'The draft has been reset to the current client-facing version.')
      })
      .catch((caughtError) => {
        setPageState((currentPageState) => ({
          ...currentPageState,
          error: caughtError.message,
          status: 'error',
        }))
        setSaveState('')
        toast.error('Published overview was not restored', caughtError.message)
      })
  }

  return {
    clearPendingDeletion,
    confirmDeletion,
    discardDraft,
    draft,
    editor,
    error,
    isDirty,
    isPublishConfirmationOpen,
    pageState,
    pendingDeletion,
    publishDraft,
    requestDeletion,
    restorePublished,
    saveState,
    setIsPublishConfirmationOpen,
    updateDraft,
  }
}
