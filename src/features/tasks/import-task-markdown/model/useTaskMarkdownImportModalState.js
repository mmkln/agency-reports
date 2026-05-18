import { useMemo, useRef, useState } from 'react'

import { TASK_IMPORT_PARTIAL_POLICIES } from './taskMarkdownImport'
import { createExampleMarkdown } from './taskMarkdownExample'

export function useTaskMarkdownImportModalState({
  clients,
  defaultClientId,
  importPlan,
  onInvalidatePreview,
  onPreview,
  projects,
}) {
  const fileInputRef = useRef(null)
  const hasClients = clients.length > 0
  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || '')
  const [partialPolicy, setPartialPolicy] = useState(TASK_IMPORT_PARTIAL_POLICIES.FILL_MISSING)
  const [projectId, setProjectId] = useState('none')
  const [rawMarkdown, setRawMarkdown] = useState(createExampleMarkdown)
  const selectedClientProjects = useMemo(
    () => projects.filter((project) => project.client_id === clientId),
    [clientId, projects],
  )
  const canPreview = hasClients && clientId && rawMarkdown.trim().length > 0
  const canApply = Boolean(importPlan) && importPlan.counts.create > 0 && importPlan.counts.conflict === 0

  function previewImport(event) {
    event.preventDefault()
    onPreview({
      clientId,
      partialPolicy,
      projectId: projectId === 'none' ? '' : projectId,
      rawMarkdown,
    })
  }

  function changeClient(nextClientId) {
    setClientId(nextClientId)
    setProjectId('none')
    onInvalidatePreview()
  }

  function changeProject(nextProjectId) {
    setProjectId(nextProjectId)
    onInvalidatePreview()
  }

  function changePartialPolicy(nextPartialPolicy) {
    setPartialPolicy(nextPartialPolicy)
    onInvalidatePreview()
  }

  function changeRawMarkdown(nextRawMarkdown) {
    setRawMarkdown(nextRawMarkdown)
    onInvalidatePreview()
  }

  function fillExample() {
    setRawMarkdown(createExampleMarkdown())
    onInvalidatePreview()
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function readMarkdownFile(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setRawMarkdown(String(reader.result ?? ''))
      onInvalidatePreview()
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return {
    canApply,
    canPreview,
    changeClient,
    changePartialPolicy,
    changeProject,
    changeRawMarkdown,
    clientId,
    fileInputRef,
    fillExample,
    hasClients,
    openFilePicker,
    partialPolicy,
    previewImport,
    projectId,
    rawMarkdown,
    readMarkdownFile,
    selectedClientProjects,
  }
}
