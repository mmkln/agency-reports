import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  archiveGrowthReviewReview,
  createGrowthReviewReview,
  getGrowthReviewReviewOptions,
  listGrowthReviewReviews,
  normalizeGrowthReviewReviewValidationIssues,
  updateGrowthReviewReview,
  validateGrowthReviewReview,
} from '@/entities/growth-review-review'
import {
  syncGhlPipelines,
  syncGhlReactivationTouchSchema,
  syncGhlTags,
} from '@/entities/ghl-integration'
import { useAsyncResource } from '@/shared/data/useAsyncResource'
import { useToast } from '@/shared/notifications'

import { isConfiguredMapping } from './mappingRuleModel'

function createReviewDraft(review = null) {
  return {
    activityStartDate: review?.activityStartDate ?? '',
    externalCampaignKey: review?.externalCampaignKey ?? '',
    isDefault: review?.isDefault === true,
    name: review?.name ?? '',
    pipelineId: review?.pipelineId ?? '',
    signals: review?.signals.map((signal) => ({ ...signal })) ?? [],
    tracks: review?.tracks.map((track) => ({
      ...track,
      signals: track.signals.map((signal) => ({ ...signal })),
    })) ?? [],
    sourceConnectionId: review?.sourceConnectionId ?? '',
    status: review?.status ?? 'draft',
    touchCampaignKey: review?.touchCampaignKey ?? '',
  }
}

function getPipelinesForSource(options, sourceConnectionId) {
  return options.pipelines.filter(
    (pipeline) => pipeline.sourceConnectionId === sourceConnectionId,
  )
}

function applyCreateDefaults(draft, options) {
  const sourceConnectionId = draft.sourceConnectionId || options.sourceConnections[0]?.id || ''
  const pipelines = getPipelinesForSource(options, sourceConnectionId)

  return {
    ...draft,
    pipelineId: pipelines.some((pipeline) => pipeline.id === draft.pipelineId)
      ? draft.pipelineId
      : pipelines[0]?.id ?? '',
    sourceConnectionId,
  }
}

function validateReviewDraft(draft) {
  const errors = {}

  if (!draft.name.trim()) {
    errors.name = 'Enter a review name.'
  }
  if (!draft.externalCampaignKey.trim()) {
    errors.externalCampaignKey = 'Enter the external campaign key used in GHL.'
  }
  if (!draft.sourceConnectionId) {
    errors.sourceConnectionId = 'Choose a GHL connection.'
  }
  if (!draft.pipelineId) {
    errors.pipelineId = 'Choose the pipeline used by this campaign.'
  }
  if (!draft.touchCampaignKey.trim()) {
    errors.touchCampaignKey = 'Enter the campaign key used by Reactivation Touch records.'
  }

  return errors
}

function normalizeFieldErrors(error) {
  const detail = error?.payload?.detail

  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) {
    return {}
  }

  function formatValue(value) {
    if (Array.isArray(value)) {
      return formatValue(value[0] ?? '')
    }
    if (value && typeof value === 'object') {
      return Object.entries(value)
        .map(([key, message]) => `${key}: ${formatValue(message)}`)
        .join(' ')
    }
    return String(value ?? '')
  }

  return Object.fromEntries(
    Object.entries(detail).map(([key, value]) => [
      key,
      formatValue(value),
    ]),
  )
}

function getOperationError(error, fallback) {
  const detail = error?.payload?.detail

  if (typeof detail === 'string') {
    return detail
  }

  return error?.message || fallback
}

function canValidateMappings(draft, options) {
  const requiredKeys = (options.signalKeys ?? [])
    .filter((signalKey) => signalKey.required)
    .map((signalKey) => signalKey.value)
  const configuredKeys = new Set(
    draft.signals.filter(isConfiguredMapping).map((signal) => signal.key),
  )

  return Boolean(
    draft.name.trim()
    && draft.externalCampaignKey.trim()
    && draft.sourceConnectionId
    && draft.pipelineId
    && draft.touchCampaignKey.trim()
    && requiredKeys.every((key) => configuredKeys.has(key))
    && draft.tracks.length
    && draft.tracks.every((track) => (
      track.label.trim()
      && track.touchTrackValue?.trim()
      && track.signals.some(isConfiguredMapping)
    )),
  )
}

export function useGrowthReviewReviewsWorkflow({ apiClient, workspaceId }) {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftOverride, setDraftOverride] = useState(null)
  const [createDraft, setCreateDraft] = useState(() => createReviewDraft())
  const [fieldErrors, setFieldErrors] = useState({})
  const [operationError, setOperationError] = useState('')
  const [operationState, setOperationState] = useState('idle')
  const [optionsOverride, setOptionsOverride] = useState(null)
  const [pipelineSyncState, setPipelineSyncState] = useState('idle')
  const [touchTrackOptionSyncState, setTouchTrackOptionSyncState] = useState('idle')
  const [tagSyncState, setTagSyncState] = useState('idle')
  const [reviewPendingArchive, setReviewPendingArchive] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [validationIssues, setValidationIssues] = useState([])
  const validationRequestId = useRef(0)
  const resource = useAsyncResource({
    dependencyKey: `growth-review-reviews:${workspaceId}`,
    load: () => Promise.all([
      listGrowthReviewReviews(apiClient, workspaceId),
      getGrowthReviewReviewOptions(apiClient, workspaceId),
    ]).then(([reviewData, options]) => ({ ...reviewData, options })),
  })
  const reviews = useMemo(() => resource.data?.reviews ?? [], [resource.data?.reviews])
  const options = useMemo(() => (
    optionsOverride?.workspaceId === workspaceId
      ? optionsOverride.value
      : resource.data?.options
  ) ?? {
    pipelines: [],
    sourceConnections: [],
    statuses: [],
    customFields: [],
    signalKeys: [],
    tags: [],
    touchTrackOptions: [],
  }, [optionsOverride, resource.data?.options, workspaceId])
  const requestedReviewId = searchParams.get('review') ?? ''
  const selectedReview = reviews.find((review) => review.id === requestedReviewId)
    ?? reviews.find((review) => review.id === resource.data?.defaultReviewId)
    ?? reviews[0]
    ?? null
  const reviewDraft = draftOverride && selectedReview && draftOverride.reviewId === selectedReview.id
    ? draftOverride.value
    : createReviewDraft(selectedReview)
  const resolvedCreateDraft = applyCreateDefaults(createDraft, options)
  const isCreateOpen = searchParams.get('create') === 'review'
  const isDirty = Boolean(selectedReview) && JSON.stringify(reviewDraft) !== JSON.stringify(
    createReviewDraft(selectedReview),
  )

  function clearValidation() {
    validationRequestId.current += 1
    setValidationResult(null)
    setValidationIssues([])
  }

  async function validateMappings(candidateDraft) {
    if (!selectedReview || !canValidateMappings(candidateDraft, options)) {
      clearValidation()
      return
    }

    const requestId = validationRequestId.current + 1
    validationRequestId.current = requestId

    try {
      const result = await validateGrowthReviewReview(
        apiClient,
        workspaceId,
        selectedReview.id,
        candidateDraft,
      )
      if (validationRequestId.current !== requestId) {
        return
      }
      setValidationResult(result)
      setValidationIssues([])
    } catch (error) {
      if (validationRequestId.current !== requestId) {
        return
      }
      setValidationResult(null)
      setValidationIssues(normalizeGrowthReviewReviewValidationIssues(error?.payload))
    }
  }

  function updateSearchParams(update) {
    const nextSearchParams = new URLSearchParams(searchParams)
    update(nextSearchParams)
    setSearchParams(nextSearchParams, { replace: true })
  }

  function selectReview(reviewId) {
    setDraftOverride(null)
    setFieldErrors({})
    setOperationError('')
    clearValidation()
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.set('review', reviewId)
      nextSearchParams.delete('create')
    })
  }

  function openCreateDialog() {
    setCreateDraft(createReviewDraft())
    setFieldErrors({})
    setOperationError('')
    clearValidation()
    updateSearchParams((nextSearchParams) => nextSearchParams.set('create', 'review'))
  }

  function closeCreateDialog() {
    setCreateDraft(createReviewDraft())
    setFieldErrors({})
    setOperationError('')
    updateSearchParams((nextSearchParams) => nextSearchParams.delete('create'))
  }

  function changeReviewField(field, value) {
    if (!selectedReview) {
      return
    }

    setFieldErrors((current) => ({ ...current, [field]: '' }))
    clearValidation()
    const nextValue = {
      ...reviewDraft,
      [field]: value,
    }
    setDraftOverride({
      reviewId: selectedReview.id,
      value: nextValue,
    })
  }

  function changeReviewSource(sourceConnectionId) {
    const pipelineId = getPipelinesForSource(options, sourceConnectionId)[0]?.id ?? ''
    setFieldErrors((current) => ({
      ...current,
      pipelineId: '',
      sourceConnectionId: '',
    }))
    setDraftOverride({
      reviewId: selectedReview.id,
      value: {
        ...reviewDraft,
        pipelineId,
        sourceConnectionId,
      },
    })
  }

  function replaceReviewSignals(key, signals) {
    const basePriority = (options.signalKeys.findIndex((item) => item.value === key) + 1) * 100
    const nextDraft = {
      ...reviewDraft,
      signals: [
        ...reviewDraft.signals.filter((signal) => signal.key !== key),
        ...signals.map((signal, index) => ({
          ...signal,
          key,
          priority: basePriority + index,
        })),
      ],
    }
    setDraftOverride({
      reviewId: selectedReview.id,
      value: nextDraft,
    })
    void validateMappings(nextDraft)
  }

  function addReviewTrack() {
    const usedKeys = new Set(reviewDraft.tracks.map((track) => track.key))
    let number = reviewDraft.tracks.length + 1
    while (usedKeys.has(`track-${number}`)) {
      number += 1
    }
    const track = {
      id: '',
      isActive: true,
      key: `track-${number}`,
      label: `Track ${number}`,
      priority: reviewDraft.tracks.length * 100,
      touchTrackValue: '',
      signals: [{
        entity: 'contact',
        expectedValues: [],
        fieldId: '',
        fieldKey: '',
        id: '',
        isActive: true,
        priority: 0,
        source: 'tag',
      }],
    }
    clearValidation()
    setDraftOverride({
      reviewId: selectedReview.id,
      value: { ...reviewDraft, tracks: [...reviewDraft.tracks, track] },
    })
  }

  function updateReviewTrack(index, nextTrack) {
    const nextDraft = {
      ...reviewDraft,
      tracks: reviewDraft.tracks.map((track, trackIndex) => (
        trackIndex === index
          ? {
            ...nextTrack,
            priority: track.priority,
            signals: nextTrack.signals.map((signal, signalIndex) => ({
              ...signal,
              priority: signalIndex * 100,
            })),
          }
          : track
      )),
    }
    setDraftOverride({
      reviewId: selectedReview.id,
      value: nextDraft,
    })
    void validateMappings(nextDraft)
  }

  function removeReviewTrack(index) {
    clearValidation()
    setDraftOverride({
      reviewId: selectedReview.id,
      value: {
        ...reviewDraft,
        tracks: reviewDraft.tracks.filter((_track, trackIndex) => trackIndex !== index),
      },
    })
  }

  function changeCreateField(field, value) {
    setFieldErrors((current) => ({ ...current, [field]: '' }))
    setCreateDraft((current) => ({ ...current, [field]: value }))
  }

  function changeCreateSource(sourceConnectionId) {
    const pipelineId = getPipelinesForSource(options, sourceConnectionId)[0]?.id ?? ''
    setFieldErrors((current) => ({
      ...current,
      pipelineId: '',
      sourceConnectionId: '',
    }))
    setCreateDraft((current) => ({
      ...current,
      pipelineId,
      sourceConnectionId,
    }))
  }

  function resetReviewDraft() {
    setDraftOverride(null)
    setFieldErrors({})
    setOperationError('')
    clearValidation()
  }

  async function reloadAndSelect(reviewId) {
    updateSearchParams((nextSearchParams) => {
      if (reviewId) {
        nextSearchParams.set('review', reviewId)
      } else {
        nextSearchParams.delete('review')
      }
      nextSearchParams.delete('create')
    })
    setOptionsOverride(null)
    await resource.reload()
  }

  async function refreshPipelines(sourceConnectionId) {
    if (!sourceConnectionId || pipelineSyncState === 'syncing') {
      return
    }

    setPipelineSyncState('syncing')
    try {
      await syncGhlPipelines(apiClient, workspaceId, sourceConnectionId)
      const refreshedOptions = await getGrowthReviewReviewOptions(apiClient, workspaceId)
      setOptionsOverride({
        value: refreshedOptions,
        workspaceId,
      })
      toast.success('Pipelines updated', 'The latest GHL pipelines are now available.')
    } catch (error) {
      toast.error('Pipelines were not updated', getOperationError(error, 'Try again.'))
    } finally {
      setPipelineSyncState('idle')
    }
  }

  async function refreshTags(sourceConnectionId) {
    if (!sourceConnectionId || tagSyncState === 'syncing') {
      return
    }

    setTagSyncState('syncing')
    try {
      await syncGhlTags(apiClient, workspaceId, sourceConnectionId)
      const refreshedOptions = await getGrowthReviewReviewOptions(apiClient, workspaceId)
      setOptionsOverride({
        value: refreshedOptions,
        workspaceId,
      })
      toast.success('Tags updated', 'The latest GHL tags are now available.')
    } catch (error) {
      toast.error('Tags were not updated', getOperationError(error, 'Try again.'))
    } finally {
      setTagSyncState('idle')
    }
  }

  async function refreshTouchTrackOptions(sourceConnectionId) {
    if (!sourceConnectionId || touchTrackOptionSyncState === 'syncing') {
      return
    }

    setTouchTrackOptionSyncState('syncing')
    try {
      await syncGhlReactivationTouchSchema(apiClient, workspaceId, sourceConnectionId)
      const refreshedOptions = await getGrowthReviewReviewOptions(apiClient, workspaceId)
      setOptionsOverride({
        value: refreshedOptions,
        workspaceId,
      })
      toast.success(
        'Activity options updated',
        'The latest Reactivation Touch values are now available.',
      )
    } catch (error) {
      toast.error(
        'Activity options were not updated',
        getOperationError(error, 'Try again.'),
      )
    } finally {
      setTouchTrackOptionSyncState('idle')
    }
  }

  async function createReview(event) {
    event.preventDefault()
    const nextErrors = validateReviewDraft(resolvedCreateDraft)
    setFieldErrors(nextErrors)
    setOperationError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setOperationState('creating')
    try {
      const review = await createGrowthReviewReview(
        apiClient,
        workspaceId,
        resolvedCreateDraft,
      )
      setCreateDraft(createReviewDraft())
      await reloadAndSelect(review.id)
      toast.success('Review added', `${review.name} is ready to configure.`)
    } catch (error) {
      setFieldErrors(normalizeFieldErrors(error))
      setOperationError(getOperationError(error, 'The review could not be created.'))
      toast.error('Review was not added', getOperationError(error, 'Try again.'))
    } finally {
      setOperationState('idle')
    }
  }

  async function saveReview(event) {
    event.preventDefault()
    const nextErrors = validateReviewDraft(reviewDraft)
    setFieldErrors(nextErrors)
    setOperationError('')

    if (!selectedReview || Object.keys(nextErrors).length > 0) {
      return
    }

    setOperationState('saving')
    try {
      if (reviewDraft.status === 'active') {
        await validateGrowthReviewReview(
          apiClient,
          workspaceId,
          selectedReview.id,
          reviewDraft,
        )
      }
      const review = await updateGrowthReviewReview(
        apiClient,
        workspaceId,
        selectedReview.id,
        reviewDraft,
      )
      setDraftOverride(null)
      await reloadAndSelect(review.id)
      toast.success('Review saved', `${review.name} was updated.`)
    } catch (error) {
      const issues = normalizeGrowthReviewReviewValidationIssues(error?.payload)
      setValidationIssues(issues)
      if (issues.length === 0) {
        setFieldErrors(normalizeFieldErrors(error))
        setOperationError(getOperationError(error, 'The review could not be saved.'))
      }
      toast.error('Review was not saved', getOperationError(error, 'Try again.'))
    } finally {
      setOperationState('idle')
    }
  }

  async function confirmArchive() {
    if (!reviewPendingArchive) {
      return
    }

    setOperationState('archiving')
    try {
      await archiveGrowthReviewReview(apiClient, workspaceId, reviewPendingArchive)
      const nextReview = reviews.find((review) => (
        review.id !== reviewPendingArchive.id && review.status !== 'archived'
      )) ?? null
      setReviewPendingArchive(null)
      setDraftOverride(null)
      await reloadAndSelect(nextReview?.id ?? '')
      toast.success('Review archived', `${reviewPendingArchive.name} was removed from active review work.`)
    } catch (error) {
      setOperationError(getOperationError(error, 'The review could not be archived.'))
      toast.error('Review was not archived', getOperationError(error, 'Try again.'))
    } finally {
      setOperationState('idle')
    }
  }

  return {
    addReviewTrack,
    changeCreateField,
    changeCreateSource,
    changeReviewField,
    changeReviewSource,
    closeCreateDialog,
    confirmArchive,
    createDraft: resolvedCreateDraft,
    createReview,
    fieldErrors,
    isCreateOpen,
    isDirty,
    openCreateDialog,
    operationError,
    operationState,
    options,
    pipelineSyncState,
    pipelinesForCreateSource: getPipelinesForSource(
      options,
      resolvedCreateDraft.sourceConnectionId,
    ),
    pipelinesForReviewSource: getPipelinesForSource(
      options,
      reviewDraft.sourceConnectionId,
    ),
    requestArchive: setReviewPendingArchive,
    removeReviewTrack,
    replaceReviewSignals,
    refreshPipelines,
    refreshTags,
    refreshTouchTrackOptions,
    resetReviewDraft,
    resource,
    reviewDraft,
    reviewPendingArchive,
    reviews,
    saveReview,
    selectedReview,
    selectReview,
    updateReviewTrack,
    validationResult,
    validationIssues,
    tagSyncState,
    touchTrackOptionSyncState,
  }
}
