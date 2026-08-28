import { useState } from 'react'

import { OutcomeMappingRow } from './OutcomeMappingRow'
import {
  findRequiredMappingIssue,
  findValidationIssueMessage,
} from './validationIssues'

export function ReviewMappingsSection({
  draft,
  onReplace,
  options,
  validationResult,
  validationIssues = [],
  signalError,
}) {
  const [expandedKey, setExpandedKey] = useState('')
  const tags = (options.tags ?? []).filter((tag) => (
    tag.sourceConnectionId === draft.sourceConnectionId
  ))
  const customFields = (options.customFields ?? []).filter((field) => (
    field.sourceConnectionId === draft.sourceConnectionId
  ))
  const validationByKey = Object.fromEntries(
    (validationResult?.signals ?? []).map((result) => [result.key, result.matchCount]),
  )

  return (
    <section className="grid gap-component border-t border-separator pt-card">
      <div className="grid gap-tag">
        <h3 className="text-ui font-semibold text-text-primary">Reporting outcomes</h3>
        <p className="text-ui text-text-muted">
          Choose the GHL signal that identifies each campaign outcome.
        </p>
      </div>

      <div className="overflow-hidden rounded-control bg-block-subtle">
        {(options.signalKeys ?? []).map((signalKey, index) => {
          const entries = draft.signals
            .map((mapping, mappingIndex) => ({ mapping, mappingIndex }))
            .filter(({ mapping }) => mapping.key === signalKey.value)
          const mappings = entries.map(({ mapping }) => mapping)
          const requiredIssue = findRequiredMappingIssue(validationIssues, signalKey.value)
          const fieldIssue = entries
            .flatMap(({ mappingIndex }) => validationIssues.filter((issue) => (
              issue.path === `signals.${mappingIndex}`
              || issue.path.startsWith(`signals.${mappingIndex}.`)
            )))
            .at(0)
          const rowIssue = requiredIssue || fieldIssue
          const mappingErrors = entries.map(({ mappingIndex }) => ({
            field: findValidationIssueMessage(validationIssues, `signals.${mappingIndex}.field_id`),
            values: findValidationIssueMessage(validationIssues, `signals.${mappingIndex}.expected_values`),
          }))

          return (
            <div
              className={index < options.signalKeys.length - 1 ? 'border-b border-separator' : ''}
              key={signalKey.value}
            >
              <OutcomeMappingRow
                customFields={customFields}
                error={rowIssue?.message}
                errors={mappingErrors}
                isOpen={expandedKey === signalKey.value}
                mappingKey={signalKey.value}
                mappings={mappings}
                matchCount={validationByKey[signalKey.value]}
                onCommit={(mappingKey, nextMappings) => onReplace(
                  mappingKey,
                  nextMappings.map((mapping) => ({
                    ...mapping,
                    confidence: mapping.confidence || 'medium',
                    isActive: mapping.isActive !== false,
                    key: mappingKey,
                    label: signalKey.label,
                  })),
                )}
                onOpenChange={(open) => setExpandedKey(open ? signalKey.value : '')}
                tags={tags}
                title={signalKey.label}
              />
            </div>
          )
        })}
      </div>

      {signalError ? <p className="text-label text-destructive">{signalError}</p> : null}
    </section>
  )
}
