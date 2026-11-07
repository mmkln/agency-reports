import { useMemo } from 'react'

import { MultiSelect } from '@/shared/ui'

function normalizedTagName(value) {
  return String(value ?? '').trim().toLocaleLowerCase()
}

function SourceMappingRow({ mapping, mappings, onChange, tagOptions }) {
  const availableOptions = useMemo(() => {
    const assignedElsewhere = new Set(
      mappings
        .filter((candidate) => candidate.key !== mapping.key)
        .flatMap((candidate) => candidate.tagNames)
        .map(normalizedTagName),
    )

    return tagOptions.filter((option) => (
      mapping.tagNames.includes(option.value)
      || !assignedElsewhere.has(normalizedTagName(option.value))
    ))
  }, [mapping.key, mapping.tagNames, mappings, tagOptions])
  const inputId = `lead-source-mapping-${mapping.key}`

  return (
    <div className="grid gap-item py-component first:pt-0 last:pb-0">
      <div>
        <label className="text-ui font-medium text-text-primary" htmlFor={inputId}>
          {mapping.label}
        </label>
        {mapping.detail ? (
          <p className="mt-micro text-label text-text-muted">{mapping.detail}</p>
        ) : null}
      </div>
      <MultiSelect
        emptyText="No unused synced GHL tags are available."
        id={inputId}
        onChange={(tagNames) => onChange(mapping.key, tagNames)}
        options={availableOptions}
        placeholder={`Choose tags for ${mapping.label}`}
        value={mapping.tagNames}
      />
    </div>
  )
}

export function LeadSourceMappingSection({ mappings, onChange, tagOptions }) {
  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Lead sources</h3>
        <p className="mt-micro text-label text-text-muted">
          Identify each acquisition channel using synchronized GHL contact tags.
        </p>
      </div>
      {mappings.length ? (
        <div className="divide-y divide-separator">
          {mappings.map((mapping) => (
            <SourceMappingRow
              key={mapping.key}
              mapping={mapping}
              mappings={mappings}
              onChange={onChange}
              tagOptions={tagOptions}
            />
          ))}
        </div>
      ) : (
        <p className="text-label text-text-muted">
          This dashboard has no configurable lead source channels.
        </p>
      )}
    </section>
  )
}
