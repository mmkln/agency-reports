import { Button } from '@/shared/ui'

import { CLINIC_RECORD_PUBLISH_STATES } from '../../../entities/clinic'
import { CLINIC_NEEDED_ACTION_TYPES } from '../../../entities/needed-from-client'

function getNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getSuggestedActions(snapshot) {
  if (Array.isArray(snapshot.reputation_action_suggestions)) {
    return snapshot.reputation_action_suggestions.map((suggestion) => ({
      hasOpenAction: Boolean(suggestion.hasOpenAction),
      label: suggestion.actionLabel,
      openAction: suggestion.openAction ?? null,
      type: suggestion.type,
    }))
  }

  const suggestions = []

  if (getNumber(snapshot.negative_reviews) > 0 || getNumber(snapshot.unanswered_reviews) > 0) {
    suggestions.push({
      hasOpenAction: false,
      label: 'Create review response action',
      type: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
    })
  }

  if (getNumber(snapshot.review_response_drafts) > 0) {
    suggestions.push({
      hasOpenAction: false,
      label: 'Create review approval action',
      type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_REVIEW_RESPONSE,
    })
  }

  return suggestions
}

function canCreateSuggestedAction(snapshot, isDirty) {
  return Boolean(snapshot.id)
    && !isDirty
    && snapshot.publish_state === CLINIC_RECORD_PUBLISH_STATES.PUBLISHED
}

function getSuggestedActionKey(snapshot, suggestionType) {
  return `${snapshot.id}:${suggestionType}`
}

export function ReputationSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  onCreateSuggestedAction,
  snapshot,
}) {
  const suggestions = getSuggestedActions(snapshot)
  const canCreateActions = canCreateSuggestedAction(snapshot, isDirty)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const actionKey = getSuggestedActionKey(snapshot, suggestion.type)
        const wasCreated = createdActionKeys.has(actionKey)
        const hasOpenAction = suggestion.hasOpenAction || wasCreated

        return (
          <Button
            disabled={!canCreateActions || hasOpenAction || creatingActionKey === actionKey}
            key={suggestion.type}
            onClick={() => onCreateSuggestedAction({
              snapshotId: snapshot.id,
              suggestionType: suggestion.type,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            {suggestion.hasOpenAction ? 'Action exists' : wasCreated ? 'Action created' : suggestion.label}
          </Button>
        )
      })}
    </div>
  )
}
