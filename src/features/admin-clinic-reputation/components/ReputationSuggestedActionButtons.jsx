import { CLINIC_NEEDED_ACTION_TYPES } from '../../../entities/needed-from-client'
import { ClinicSuggestedActionButtons } from '../../admin-clinic-actions'

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

export function ReputationSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  onCreateSuggestedAction,
  snapshot,
}) {
  const suggestions = getSuggestedActions(snapshot)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <ClinicSuggestedActionButtons
      createdActionKeys={createdActionKeys}
      createPayload={({ record, suggestion }) => ({
        snapshotId: record.id,
        suggestionType: suggestion.type,
      })}
      creatingActionKey={creatingActionKey}
      isDirty={isDirty}
      onCreateSuggestedAction={onCreateSuggestedAction}
      record={snapshot}
      suggestions={suggestions}
    />
  )
}
