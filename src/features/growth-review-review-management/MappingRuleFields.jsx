import { useMemo } from 'react'

import {
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
} from '@/shared/ui'

import { canonicalizeMapping } from './mappingRuleModel'

const ENTITY_LABELS = {
  contact: 'Contact',
  opportunity: 'Opportunity',
}

function MappingCombobox({ emptyMessage, error, id, onValueChange, options, placeholder, value }) {
  const selectedOption = options.find((option) => option.value === value) ?? null
  const errorId = error ? `${id}-error` : undefined

  return (
    <>
      <Combobox
        items={options}
        onValueChange={(option) => onValueChange(option?.value ?? '')}
        value={selectedOption}
      >
        <ComboboxInput
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          id={id}
          placeholder={placeholder}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.value} value={option}>
                <span className="grid min-w-0 gap-micro">
                  <span className="whitespace-normal break-words">{option.label}</span>
                  {option.meta ? (
                    <span className="whitespace-normal break-all text-label font-normal text-text-muted">
                      {option.meta}
                    </span>
                  ) : null}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {selectedOption?.meta ? (
        <p className="whitespace-normal break-all text-label font-normal text-text-muted">
          {selectedOption.meta}
        </p>
      ) : null}
      {error ? <p className="text-label text-destructive" id={errorId}>{error}</p> : null}
    </>
  )
}

export function MappingRuleFields({
  customFields,
  errors = {},
  idPrefix,
  mapping,
  onChange,
  outcomeLabel,
  tags,
}) {
  const tagOptions = useMemo(() => tags.map((tag) => ({
    label: tag.label,
    meta: tag.value,
    value: tag.value,
  })), [tags])
  const customFieldOptions = useMemo(() => customFields.map((field) => ({
    label: field.label,
    meta: field.fieldKey,
    value: field.id,
  })), [customFields])
  const selectedField = customFields.find((field) => field.id === mapping.fieldId)

  function changeSource(source) {
    onChange(canonicalizeMapping({
      ...mapping,
      entity: source === 'tag' ? 'contact' : '',
      expectedValues: [],
      fieldId: '',
      fieldKey: '',
      source,
    }))
  }

  function changeCustomField(fieldId) {
    const field = customFields.find((option) => option.id === fieldId)
    onChange({
      ...mapping,
      entity: field?.entity ?? '',
      fieldId,
      fieldKey: field?.fieldKey ?? '',
    })
  }

  return (
    <div className="grid gap-component">
      <div className="grid gap-item">
        <Label htmlFor={`${idPrefix}-source`}>Identify using</Label>
        <RadixSelect onValueChange={changeSource} value={mapping.source}>
          <SelectTrigger id={`${idPrefix}-source`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tag">Contact tag</SelectItem>
            <SelectItem value="custom_field">Custom field</SelectItem>
          </SelectContent>
        </RadixSelect>
      </div>

      {mapping.source === 'tag' ? (
        <div className="grid gap-item">
          <Label htmlFor={`${idPrefix}-tag`}>Contact tag</Label>
          <MappingCombobox
            emptyMessage="No contact tags found."
            error={errors.values}
            id={`${idPrefix}-tag`}
            onValueChange={(value) => onChange({ ...mapping, expectedValues: value ? [value] : [] })}
            options={tagOptions}
            placeholder="Search contact tags"
            value={mapping.expectedValues[0] ?? ''}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-item">
            <Label htmlFor={`${idPrefix}-field`}>Custom field</Label>
            <MappingCombobox
              emptyMessage="No custom fields found."
              error={errors.field}
              id={`${idPrefix}-field`}
              onValueChange={changeCustomField}
              options={customFieldOptions}
              placeholder="Search custom fields"
              value={mapping.fieldId}
            />
            {selectedField ? (
              <p className="text-label font-normal text-text-muted">
                {ENTITY_LABELS[selectedField.entity] ?? 'Custom'} custom field
              </p>
            ) : null}
          </div>
          <div className="grid gap-item">
            <Label htmlFor={`${idPrefix}-values`}>Value that means {outcomeLabel}</Label>
            <Input
              aria-describedby={errors.values ? `${idPrefix}-values-error` : undefined}
              aria-invalid={Boolean(errors.values)}
              id={`${idPrefix}-values`}
              onChange={(event) => onChange({
                ...mapping,
                expectedValues: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
              })}
              placeholder="Value 1, Value 2"
              value={mapping.expectedValues.join(', ')}
            />
            {errors.values ? (
              <p className="text-label text-destructive" id={`${idPrefix}-values-error`}>
                {errors.values}
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
