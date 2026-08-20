import { useMemo, useState } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Input,
  Label,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TooltipIconButton,
} from '@/shared/ui'

const ENTITY_OPTIONS = [
  { label: 'Contact', value: 'contact' },
  { label: 'Opportunity', value: 'opportunity' },
  { label: 'Contact or opportunity', value: 'any' },
]

function MappingSelect({ children, id, label, onValueChange, placeholder, value }) {
  return (
    <div className="grid gap-item">
      <Label htmlFor={id}>{label}</Label>
      <RadixSelect onValueChange={onValueChange} value={value}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </RadixSelect>
    </div>
  )
}

function TagMappingCombobox({ id, label, onValueChange, options, value }) {
  const selectedOption = options.find((option) => option.value === value) ?? null

  return (
    <div className="grid gap-item">
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        items={options}
        onValueChange={(option) => onValueChange(option?.value ?? '')}
        value={selectedOption}
      >
        <ComboboxInput id={id} placeholder="Search tags" showClear />
        <ComboboxContent>
          <ComboboxEmpty>No tags found.</ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

function SignalMappingRow({
  customFields,
  index,
  mapping,
  onChange,
  onRemove,
  tags,
}) {
  const expectedValues = mapping.expectedValues.join(', ')

  function changeSource(source) {
    onChange(index, {
      entity: source === 'custom_field' ? '' : mapping.entity,
      expectedValues: [],
      fieldId: '',
      fieldKey: '',
      source,
    })
  }

  function changeCustomField(fieldId) {
    const field = customFields.find((option) => option.id === fieldId)
    onChange(index, {
      entity: field?.entity ?? 'opportunity',
      fieldId,
      fieldKey: field?.fieldKey ?? '',
    })
  }

  return (
    <div className="grid gap-component bg-block-subtle px-component py-item sm:grid-cols-[minmax(8rem,0.7fr)_minmax(9rem,0.8fr)_minmax(12rem,1.5fr)_auto] sm:items-end">
      <MappingSelect
        id={`review-signal-${index}-source`}
        label="Source"
        onValueChange={changeSource}
        value={mapping.source}
      >
        <SelectItem value="tag">Tag</SelectItem>
        <SelectItem value="custom_field">Custom field</SelectItem>
      </MappingSelect>

      {mapping.source === 'tag' ? (
        <MappingSelect
          id={`review-signal-${index}-entity`}
          label="Entity"
          onValueChange={(entity) => onChange(index, { entity })}
          value={mapping.entity}
        >
          {ENTITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </MappingSelect>
      ) : (
        <div className="grid gap-item">
          <Label>Entity</Label>
          <div className="flex min-h-target items-center text-ui text-text-secondary">
            {ENTITY_OPTIONS.find((option) => option.value === mapping.entity)?.label}
          </div>
        </div>
      )}

      {mapping.source === 'tag' ? (
        <TagMappingCombobox
          id={`review-signal-${index}-tag`}
          label="GHL tag"
          onValueChange={(value) => onChange(index, { expectedValues: [value] })}
          options={tags}
          value={mapping.expectedValues[0] ?? ''}
        />
      ) : (
        <div className="grid gap-component sm:grid-cols-2">
          <MappingSelect
            id={`review-signal-${index}-field`}
            label="GHL custom field"
            onValueChange={changeCustomField}
            value={mapping.fieldId}
            placeholder="Select field"
          >
            {customFields.map((field) => (
              <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
            ))}
          </MappingSelect>
          <div className="grid gap-item">
            <Label htmlFor={`review-signal-${index}-values`}>Matching values</Label>
            <Input
              id={`review-signal-${index}-values`}
              onChange={(event) => onChange(index, {
                expectedValues: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
              })}
              placeholder="Value 1, Value 2"
              value={expectedValues}
            />
          </div>
        </div>
      )}

      <TooltipIconButton
        className="self-end text-text-secondary hover:text-destructive"
        label={`Remove ${mapping.label} source`}
        onClick={() => onRemove(index)}
        size="md"
      >
        <Icon name="trash" size={16} />
      </TooltipIconButton>
    </div>
  )
}

function isConfiguredMapping(mapping) {
  if (mapping.isActive === false || !mapping.expectedValues.length) {
    return false
  }
  if (mapping.source === 'tag') {
    return Boolean(mapping.entity)
  }
  if (mapping.source === 'custom_field') {
    return Boolean(mapping.entity && (mapping.fieldId || mapping.fieldKey))
  }
  return false
}

export function ReviewMappingsSection({
  draft,
  onAdd,
  onChange,
  onRemove,
  options,
  validationResult,
  validationState,
  onValidate,
  signalError,
}) {
  const requiredKeys = useMemo(
    () => (options.signalKeys ?? []).filter((signalKey) => signalKey.required),
    [options.signalKeys],
  )
  const configuredKeys = useMemo(() => new Set(
    draft.signals
      .filter(isConfiguredMapping)
      .map((mapping) => mapping.key),
  ), [draft.signals])
  const configuredCount = requiredKeys.filter((signalKey) => (
    configuredKeys.has(signalKey.value)
  )).length
  const isComplete = configuredCount === requiredKeys.length
  const [isOpen, setIsOpen] = useState(!isComplete)
  const tags = (options.tags ?? []).filter((tag) => tag.sourceConnectionId === draft.sourceConnectionId)
  const customFields = (options.customFields ?? []).filter((field) => (
    field.sourceConnectionId === draft.sourceConnectionId
  ))
  const validationByKey = Object.fromEntries(
    (validationResult?.signals ?? []).map((result) => [result.key, result.matchCount]),
  )
  const mappingsOpen = isOpen || Boolean(signalError)

  return (
    <Collapsible
      className="grid gap-component border-t border-separator pt-card"
      onOpenChange={setIsOpen}
      open={mappingsOpen}
    >
      <div className="flex items-center justify-between gap-component">
        <span className="grid min-w-0 gap-tag">
          <span className="text-ui font-semibold text-text-primary">Outcome mapping</span>
          <span className="text-label font-normal text-text-muted">
            {configuredCount} of {requiredKeys.length} configured
            {isComplete ? ' · Ready' : ' · Setup incomplete'}
          </span>
        </span>
        <CollapsibleTrigger asChild>
          <TooltipIconButton
            label={mappingsOpen ? 'Collapse outcome mapping' : 'Expand outcome mapping'}
            size="md"
          >
            <Icon
              className={`transition-transform duration-motion-fast ${mappingsOpen ? 'rotate-180' : ''}`}
              name="chevronDown"
              size={18}
            />
          </TooltipIconButton>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="grid gap-card">
        <p className="text-ui text-text-muted">
          Map each reporting concept to the exact GHL tag or custom field used by this campaign.
          {' '}You can save partial progress and finish the remaining mappings later.
        </p>
        <div className="grid gap-card">
        {(options.signalKeys ?? []).map((signalKey) => {
          const mappings = draft.signals
            .map((mapping, index) => ({ index, mapping }))
            .filter(({ mapping }) => mapping.key === signalKey.value)

          return (
            <section className="grid gap-item" key={signalKey.value}>
              <div className="flex items-center justify-between gap-component">
                <div className="min-w-0">
                  <h4 className="text-ui font-medium text-text-primary">{signalKey.label}</h4>
                  {validationByKey[signalKey.value] !== undefined ? (
                    <p className="text-label text-text-muted">
                      {validationByKey[signalKey.value]} matching contacts
                    </p>
                  ) : null}
                </div>
                <Button onClick={() => onAdd(signalKey.value)} size="sm" type="button" variant="outline">
                  Add source
                </Button>
              </div>
              {mappings.length > 0 ? (
                <div className="grid gap-tag overflow-hidden rounded-control">
                  {mappings.map(({ index, mapping }) => (
                    <SignalMappingRow
                      customFields={customFields}
                      index={index}
                      key={mapping.id || `${mapping.key}-${index}`}
                      mapping={mapping}
                      onChange={onChange}
                      onRemove={onRemove}
                      tags={tags}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-ui text-text-muted">No source configured.</p>
              )}
            </section>
          )
        })}
        </div>

        <div className="flex items-center justify-between gap-component border-t border-separator pt-component">
          <div className="min-w-0">
            <p className={signalError ? 'text-label text-destructive' : 'text-label text-text-muted'}>
              {signalError || (validationResult?.valid
                ? 'Mappings are valid.'
                : 'Validate before activating this review.')}
            </p>
          </div>
          <Button
            disabled={validationState === 'validating'}
            onClick={onValidate}
            type="button"
            variant="outline"
          >
            {validationState === 'validating' ? 'Validating...' : 'Validate mappings'}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
