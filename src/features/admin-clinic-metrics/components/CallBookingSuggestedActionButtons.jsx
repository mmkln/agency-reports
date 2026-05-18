import { Button } from '@/shared/ui'

import { CLINIC_RECORD_PUBLISH_STATES } from '../../../entities/clinic'
import { CLINIC_NEEDED_ACTION_TYPES } from '../../../entities/needed-from-client'

function getNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getSuggestedActions(metric) {
  const suggestions = []

  if (getNumber(metric.missed_calls) > 0) {
    suggestions.push({
      label: 'Create missed-call action',
      type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
    })
  }

  if (getNumber(metric.average_response_seconds) >= 120) {
    suggestions.push({
      label: 'Create call script action',
      type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
    })
  }

  if (getNumber(metric.no_response_leads) + getNumber(metric.follow_up_needed_count) > 0) {
    suggestions.push({
      label: 'Create follow-up action',
      type: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
    })
  }

  return suggestions
}

function canCreateSuggestedAction(metric, isDirty) {
  return Boolean(metric.id)
    && !isDirty
    && metric.publish_state === CLINIC_RECORD_PUBLISH_STATES.PUBLISHED
}

function getSuggestedActionKey(metric, suggestionType) {
  return `${metric.id}:${suggestionType}`
}

export function CallBookingSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  metric,
  onCreateSuggestedAction,
}) {
  const suggestions = getSuggestedActions(metric)
  const canCreateActions = canCreateSuggestedAction(metric, isDirty)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const actionKey = getSuggestedActionKey(metric, suggestion.type)
        const wasCreated = createdActionKeys.has(actionKey)

        return (
          <Button
            disabled={!canCreateActions || wasCreated || creatingActionKey === actionKey}
            key={suggestion.type}
            onClick={() => onCreateSuggestedAction({
              metricId: metric.id,
              suggestionType: suggestion.type,
            })}
            size="sm"
            type="button"
            variant="outline"
          >
            {wasCreated ? 'Action created' : suggestion.label}
          </Button>
        )
      })}
    </div>
  )
}
