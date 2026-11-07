import { useState } from 'react'

import { Button } from '@/shared/ui'

import { MappingDisclosure } from './MappingDisclosure'
import {
  canonicalizeMapping,
  createEmptyMapping,
  getMappingsPresentation,
} from './mappingRuleModel'
import { MappingRulesEditor } from './MappingRulesEditor'

function cloneMappings(mappings) {
  const cloned = mappings.map((mapping) => ({
    ...mapping,
    expectedValues: [...mapping.expectedValues],
  }))
  return cloned.length ? cloned : [createEmptyMapping()]
}

export function OutcomeMappingRow({
  customFields,
  error,
  errors = [],
  isOpen,
  mappingKey,
  mappings,
  matchCount,
  onCommit,
  onOpenChange,
  tags,
  title,
}) {
  const [draftMappings, setDraftMappings] = useState(() => cloneMappings(mappings))
  const presentation = getMappingsPresentation(mappings, { customFields, tags })

  function handleOpenChange(open) {
    if (open) {
      setDraftMappings(cloneMappings(mappings))
    }
    onOpenChange(open)
  }

  function cancelChanges() {
    setDraftMappings(cloneMappings(mappings))
    onOpenChange(false)
  }

  function applyChanges() {
    onCommit(mappingKey, draftMappings.map(canonicalizeMapping))
    onOpenChange(false)
  }

  return (
    <MappingDisclosure
      error={error}
      isOpen={isOpen}
      matchCount={matchCount}
      onOpenChange={handleOpenChange}
      sourceLabel={presentation.title}
      sourceType={presentation.detail}
      title={title}
    >
      <div className="grid gap-card">
        <p className="text-ui text-text-secondary">Count this outcome when</p>
        <MappingRulesEditor
          customFields={customFields}
          errors={errors}
          idPrefix={`outcome-${mappingKey}`}
          mappings={draftMappings}
          onChange={setDraftMappings}
          outcomeLabel={title.toLowerCase()}
          tags={tags}
        />
        {error ? <p className="text-label text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-item">
          <Button onClick={cancelChanges} type="button" variant="ghost">Cancel</Button>
          <Button onClick={applyChanges} type="button">Done</Button>
        </div>
      </div>
    </MappingDisclosure>
  )
}
