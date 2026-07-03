import { useCallback, useMemo, useState } from 'react'

import {
  DEFAULT_GROWTH_REVIEW_LAYOUT_ITEMS,
  normalizeGrowthReviewDashboardLayout,
} from '@/entities/dental-growth-review'
import { updateGrowthReviewDashboardLayout } from '@/domain/services/growthReviewApiReadService'

function cloneItems(items = []) {
  return items.map((item, index) => ({
    label: item.label,
    position: (index + 1) * 10,
    widgetKey: item.widgetKey,
  }))
}

function moveItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items
  }

  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, item)
  return cloneItems(nextItems)
}

export function useGrowthReviewLayoutEditor({
  apiClient,
  layout,
  onSaved,
  workspaceId,
}) {
  const normalizedLayout = useMemo(
    () => normalizeGrowthReviewDashboardLayout(layout),
    [layout],
  )
  const [draftItems, setDraftItems] = useState(() => cloneItems(normalizedLayout.items))
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const open = useCallback(() => {
    setDraftItems(cloneItems(normalizedLayout.items))
    setError('')
    setIsOpen(true)
  }, [normalizedLayout.items])

  const close = useCallback(() => {
    if (!isSaving) {
      setIsOpen(false)
      setError('')
    }
  }, [isSaving])

  const moveUp = useCallback((widgetKey) => {
    setDraftItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.widgetKey === widgetKey)
      return moveItem(currentItems, index, index - 1)
    })
  }, [])

  const moveDown = useCallback((widgetKey) => {
    setDraftItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.widgetKey === widgetKey)
      return moveItem(currentItems, index, index + 1)
    })
  }, [])

  const resetToDefault = useCallback(() => {
    setDraftItems(cloneItems(DEFAULT_GROWTH_REVIEW_LAYOUT_ITEMS))
    setError('')
  }, [])

  const save = useCallback(async () => {
    if (!apiClient || !workspaceId) {
      return null
    }

    setIsSaving(true)
    setError('')

    try {
      const savedLayout = await updateGrowthReviewDashboardLayout({
        apiClient,
        items: draftItems,
        workspaceId,
      })

      setIsOpen(false)
      await onSaved?.(savedLayout)
      return savedLayout
    } catch (requestError) {
      setError(requestError?.message || 'Could not save review layout.')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [apiClient, draftItems, onSaved, workspaceId])

  return {
    close,
    draftItems,
    error,
    isOpen,
    isSaving,
    moveDown,
    moveUp,
    open,
    resetToDefault,
    save,
  }
}
