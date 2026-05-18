import { Button } from '@/shared/ui'

import { CLINIC_RECORD_PUBLISH_STATES } from '../../../entities/clinic'

function canCreateSuggestedAction(record, isDirty) {
  return Boolean(record.id)
    && !isDirty
    && record.publish_state === CLINIC_RECORD_PUBLISH_STATES.PUBLISHED
}

function getSuggestedActionKey(record, suggestionType) {
  return `${record.id}:${suggestionType}`
}

export function ComplianceSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  onCreateSuggestedAction,
  record,
  recordType,
  suggestions = [],
}) {
  const canCreateActions = canCreateSuggestedAction(record, isDirty)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const actionKey = getSuggestedActionKey(record, suggestion.type)
        const wasCreated = createdActionKeys.has(actionKey)
        const hasOpenAction = suggestion.hasOpenAction || wasCreated

        return (
          <Button
            disabled={!canCreateActions || hasOpenAction || creatingActionKey === actionKey}
            key={suggestion.type}
            onClick={() => onCreateSuggestedAction({
              recordId: record.id,
              recordType,
              suggestionType: suggestion.type,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            {suggestion.hasOpenAction ? 'Action exists' : wasCreated ? 'Action created' : suggestion.actionLabel}
          </Button>
        )
      })}
    </div>
  )
}
