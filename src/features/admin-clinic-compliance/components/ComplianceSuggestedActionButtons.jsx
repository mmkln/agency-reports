import { ClinicSuggestedActionButtons } from '../../admin-clinic-actions'

export function ComplianceSuggestedActionButtons({
  createdActionKeys,
  creatingActionKey,
  isDirty,
  onCreateSuggestedAction,
  record,
  recordType,
  suggestions = [],
}) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <ClinicSuggestedActionButtons
      createdActionKeys={createdActionKeys}
      createPayload={({ record: currentRecord, suggestion }) => ({
        recordId: currentRecord.id,
        recordType,
        suggestionType: suggestion.type,
      })}
      creatingActionKey={creatingActionKey}
      isDirty={isDirty}
      onCreateSuggestedAction={onCreateSuggestedAction}
      record={record}
      suggestions={suggestions}
    />
  )
}
