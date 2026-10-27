import { useCallback, useMemo, useState } from 'react'

import { normalizeGrowthReviewDashboardLayout } from '@/entities/dental-growth-review'
import { updateGrowthReviewReviewName } from '@/entities/growth-review-review'
import { updateGrowthReviewDashboardLayout } from '@/domain/services/growthReviewApiReadService'

function cloneItems(items = []) {
  return items.map((item, index) => ({
    isVisible: item.isVisible !== false,
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
  campaignId,
  campaignName,
  layout,
  onSaved,
  workspaceId,
}) {
  const normalizedLayout = useMemo(
    () => normalizeGrowthReviewDashboardLayout(layout),
    [layout],
  )
  const normalizedCampaignName = String(campaignName ?? '').trim()
  const [draftName, setDraftName] = useState(normalizedCampaignName)
  const [draftItems, setDraftItems] = useState(() => cloneItems(normalizedLayout.items))
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  const open = useCallback(() => {
    setDraftName(normalizedCampaignName)
    setDraftItems(cloneItems(normalizedLayout.items))
    setError('')
    setNameError('')
    setIsOpen(true)
  }, [normalizedCampaignName, normalizedLayout.items])

  const close = useCallback(() => {
    if (!isSaving) {
      setIsOpen(false)
      setError('')
      setNameError('')
    }
  }, [isSaving])

  const setName = useCallback((name) => {
    setDraftName(name)
    setNameError('')
  }, [])

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

  const setVisibility = useCallback((widgetKey, isVisible) => {
    setDraftItems((currentItems) => currentItems.map((item) => (
      item.widgetKey === widgetKey
        ? { ...item, isVisible }
        : item
    )))
  }, [])

  const resetToDefault = useCallback(async () => {
    if (!apiClient || !workspaceId || !campaignId) {
      return null
    }

    setIsSaving(true)
    setError('')

    try {
      const savedLayout = await updateGrowthReviewDashboardLayout({
        apiClient,
        campaignId,
        reset: true,
        workspaceId,
      })

      setIsOpen(false)
      await onSaved?.(savedLayout)
      return savedLayout
    } catch (requestError) {
      setError(requestError?.message || 'Could not restore the default review layout.')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [apiClient, campaignId, onSaved, workspaceId])

  const save = useCallback(async () => {
    if (!apiClient || !workspaceId || !campaignId) {
      return null
    }

    const nextName = draftName.trim()
    if (!nextName) {
      setNameError('Review name is required.')
      return null
    }

    setIsSaving(true)
    setError('')
    setNameError('')

    try {
      const [savedLayout] = await Promise.all([
        updateGrowthReviewDashboardLayout({
          apiClient,
          campaignId,
          items: draftItems,
          workspaceId,
        }),
        nextName === normalizedCampaignName
          ? Promise.resolve(null)
          : updateGrowthReviewReviewName(
            apiClient,
            workspaceId,
            campaignId,
            nextName,
          ),
      ])

      setIsOpen(false)
      await onSaved?.(savedLayout)
      return savedLayout
    } catch (requestError) {
      setError(requestError?.message || 'Could not save review customization.')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [
    apiClient,
    campaignId,
    draftItems,
    draftName,
    normalizedCampaignName,
    onSaved,
    workspaceId,
  ])

  return {
    close,
    draftItems,
    draftName,
    error,
    isOpen,
    isSaving,
    moveDown,
    moveUp,
    nameError,
    open,
    resetToDefault,
    save,
    setName,
    setVisibility,
  }
}
