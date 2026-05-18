import { CLINIC_NEEDED_ACTION_TYPES } from '../../../entities/needed-from-client'
import { ClinicSuggestedActionButtons } from '../../admin-clinic-actions'

function getNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getSuggestedActions(metric) {
  if (Array.isArray(metric.booking_action_suggestions)) {
    return metric.booking_action_suggestions.map((suggestion) => ({
      hasOpenAction: Boolean(suggestion.hasOpenAction),
      label: suggestion.actionLabel,
      openAction: suggestion.openAction ?? null,
      type: suggestion.type,
    }))
  }

  const suggestions = []

  if (getNumber(metric.missed_calls) > 0) {
    suggestions.push({
      hasOpenAction: false,
      label: 'Create missed-call action',
      type: CLINIC_NEEDED_ACTION_TYPES.FIX_MISSED_CALL_FOLLOW_UP,
    })
  }

  if (getNumber(metric.average_response_seconds) >= 120) {
    suggestions.push({
      hasOpenAction: false,
      label: 'Create call script action',
      type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
    })
  }

  if (getNumber(metric.no_response_leads) + getNumber(metric.follow_up_needed_count) > 0) {
    suggestions.push({
      hasOpenAction: false,
      label: 'Create follow-up action',
      type: CLINIC_NEEDED_ACTION_TYPES.CONFIRM_APPOINTMENT_AVAILABILITY,
    })
  }

  return suggestions
}

export function CallBookingSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  metric,
  onCreateSuggestedAction,
}) {
  const suggestions = getSuggestedActions(metric)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <ClinicSuggestedActionButtons
      createdActionKeys={createdActionKeys}
      createPayload={({ record, suggestion }) => ({
        metricId: record.id,
        suggestionType: suggestion.type,
      })}
      creatingActionKey={creatingActionKey}
      isDirty={isDirty}
      onCreateSuggestedAction={onCreateSuggestedAction}
      record={metric}
      suggestions={suggestions}
    />
  )
}
