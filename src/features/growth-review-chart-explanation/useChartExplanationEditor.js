import { useMemo, useState } from 'react'

import {
  resetGrowthReviewChartExplanation,
  updateGrowthReviewChartExplanation,
} from '@/domain/services/growthReviewApiReadService'

function createDraft(explanation = {}) {
  return {
    additionalNote: explanation.additionalNote ?? '',
    calculationExplanation: explanation.calculationExplanation ?? '',
    definition: explanation.definition ?? '',
  }
}

function draftsMatch(left, right) {
  return left.additionalNote === right.additionalNote
    && left.calculationExplanation === right.calculationExplanation
    && left.definition === right.definition
}

export function useChartExplanationEditor({
  apiClient,
  campaignId,
  chartKey,
  explanation,
  onSaved,
  workspaceId,
}) {
  const [savedExplanation, setSavedExplanation] = useState(null)
  const [draft, setDraft] = useState(() => createDraft(explanation))
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mode, setMode] = useState('view')
  const currentExplanation = savedExplanation ?? explanation
  const initialDraft = useMemo(() => createDraft(currentExplanation), [currentExplanation])
  const isDirty = !draftsMatch(draft, initialDraft)

  function setOpen(nextOpen) {
    if (!nextOpen && mode === 'edit' && isDirty) {
      return
    }

    setIsOpen(nextOpen)
    if (!nextOpen) {
      setMode('view')
      setError('')
      setDraft(createDraft(currentExplanation))
    }
  }

  function edit() {
    setDraft(createDraft(currentExplanation))
    setError('')
    setMode('edit')
  }

  function cancel() {
    setDraft(createDraft(currentExplanation))
    setError('')
    setMode('view')
  }

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  async function save() {
    setIsSaving(true)
    setError('')

    try {
      const saved = await updateGrowthReviewChartExplanation({
        apiClient,
        campaignId,
        chartKey,
        explanation: draft,
        workspaceId,
      })
      setSavedExplanation(saved)
      setDraft(createDraft(saved))
      setMode('view')
      await onSaved?.(saved)
      return saved
    } catch (requestError) {
      setError(requestError?.message || 'Could not save this chart explanation.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function reset() {
    setIsSaving(true)
    setError('')

    try {
      const saved = await resetGrowthReviewChartExplanation({
        apiClient,
        campaignId,
        chartKey,
        workspaceId,
      })
      setSavedExplanation(saved)
      setDraft(createDraft(saved))
      setMode('view')
      await onSaved?.(saved)
      return saved
    } catch (requestError) {
      setError(requestError?.message || 'Could not restore the default explanation.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  return {
    cancel,
    currentExplanation,
    draft,
    edit,
    error,
    isDirty,
    isOpen,
    isSaving,
    mode,
    reset,
    save,
    setOpen,
    updateField,
  }
}
